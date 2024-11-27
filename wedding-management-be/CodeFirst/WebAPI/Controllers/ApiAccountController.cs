using CloudinaryDotNet.Actions;
using CloudinaryDotNet;
using CodeFirst.Data;
using CodeFirst.Models;
using CodeFirst.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebAPI.Models;
using WebAPI.Repositories;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.Extensions.Configuration;

namespace WebAPI.Controllers
{
    [Route("api/account")]
    [ApiController]
    public class AccountsController : ControllerBase
    {
        private readonly IAccountRepository accountRepo;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IConfiguration _configuration;
        private readonly RoleManager<IdentityRole> _roleManager;

        public AccountsController(IAccountRepository repo, UserManager<ApplicationUser> userManager, ApplicationDbContext context, SignInManager<ApplicationUser> signInManager, IConfiguration configuration, RoleManager<IdentityRole> roleManager)
        {
            accountRepo = repo;
            _userManager = userManager;
            _context = context;
            _signInManager = signInManager;
            _configuration = configuration;
            _roleManager = roleManager;
        }

        // GET: api/account
        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            try 
            {
                var users = await _context.ApplicationUser.ToListAsync();
                var userDtos = new List<object>();

                foreach (var user in users)
                {
                    var roles = await _userManager.GetRolesAsync(user);
                    userDtos.Add(new
                    {
                        user.Id,
                        user.FirstName,
                        user.LastName,
                        user.Email,
                        user.PhoneNumber,
                        user.Avatar,
                        user.UserName,
                        Roles = roles
                    });
                }

                return Ok(userDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // GET: api/account/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(string id)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(id);
                if (user == null)
                {
                    return NotFound("Không tìm thấy người dùng");
                }

                // Lấy roles của user
                var roles = await _userManager.GetRolesAsync(user);

                var userDto = new
                {
                    user.Id,
                    user.FirstName,
                    user.LastName,
                    user.Email,
                    user.PhoneNumber,
                    user.UserName,
                    Roles = roles.ToArray() 
                };

                return Ok(userDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server: " + ex.Message });
            }
        }

        // POST: api/account/create
        [HttpPost("create")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserModel model)
        {
            try
            {
                // Kiểm tra user đã tồn tại
                var existingUser = await _userManager.FindByEmailAsync(model.Email);
                if (existingUser != null)
                {
                    return BadRequest(new[] { new { code = "DuplicateUserName", description = $"Username '{model.Email}' is already taken." } });
                }

                // Tạo user mới
                var user = new ApplicationUser
                {
                    UserName = model.Email,
                    Email = model.Email,
                    FirstName = model.FirstName,
                    LastName = model.LastName,
                    PhoneNumber = model.PhoneNumber,
                    EmailConfirmed = true // Tự động xác nhận email
                };

                // Tạo user với password
                var result = await _userManager.CreateAsync(user, model.Password);
                if (!result.Succeeded)
                {
                    return BadRequest(result.Errors);
                }

                // Thêm role cho user
                if (model.Roles != null && model.Roles.Any())
                {
                    // Kiểm tra role có tồn tại
                    foreach (var role in model.Roles)
                    {
                        var roleExists = await _roleManager.RoleExistsAsync(role);
                        if (!roleExists)
                        {
                            // Tạo role mới nếu chưa tồn tại
                            await _roleManager.CreateAsync(new IdentityRole(role));
                        }
                    }

                    // Thêm user vào role
                    var addToRolesResult = await _userManager.AddToRolesAsync(user, model.Roles);
                    if (!addToRolesResult.Succeeded)
                    {
                        // Nếu thêm role thất bại, xóa user đã tạo
                        await _userManager.DeleteAsync(user);
                        return BadRequest(addToRolesResult.Errors);
                    }
                }
                else
                {
                    // Nếu không có role được chỉ định, thêm role mặc định "user"
                    var defaultRole = "user";
                    var roleExists = await _roleManager.RoleExistsAsync(defaultRole);
                    if (!roleExists)
                    {
                        await _roleManager.CreateAsync(new IdentityRole(defaultRole));
                    }
                    await _userManager.AddToRoleAsync(user, defaultRole);
                }

                return Ok(new { message = "Tạo tài khoản thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server: " + ex.Message });
            }
        }

        // PUT: api/account/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserModel model)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(id);
                if (user == null)
                {
                    return NotFound("Không tìm thấy người dùng");
                }

                // Cập nhật thông tin cơ bản
                user.FirstName = model.FirstName ?? user.FirstName;
                user.LastName = model.LastName ?? user.LastName;
                user.PhoneNumber = model.PhoneNumber ?? user.PhoneNumber;
                user.Email = model.Email ?? user.Email;
                user.UserName = model.Email ?? user.UserName;

                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                {
                    return BadRequest(result.Errors);
                }

                // Cập nhật roles nếu có thay đổi
                if (model.Roles != null && model.Roles.Any())
                {
                    // Lấy roles hiện tại của user
                    var currentRoles = await _userManager.GetRolesAsync(user);
                    
                    // Xóa tất cả roles hiện tại
                    await _userManager.RemoveFromRolesAsync(user, currentRoles);

                    // Thêm roles mới
                    foreach (var role in model.Roles)
                    {
                        var roleExists = await _roleManager.RoleExistsAsync(role);
                        if (!roleExists)
                        {
                            await _roleManager.CreateAsync(new IdentityRole(role));
                        }
                    }
                    
                    // Gán roles mới cho user
                    var addToRolesResult = await _userManager.AddToRolesAsync(user, model.Roles);
                    if (!addToRolesResult.Succeeded)
                    {
                        return BadRequest(addToRolesResult.Errors);
                    }
                }

                return Ok(new { message = "Cập nhật thông tin thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server: " + ex.Message });
            }
        }

        // DELETE: api/account/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);

            if (user == null)
            {
                return NotFound("Không tìm thấy người dùng");
            }

            var result = await _userManager.DeleteAsync(user);

            if (result.Succeeded)
            {
                return NoContent();
            }

            return BadRequest(result.Errors);
        }

        // POST: api/account/change-password
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordModel model)
        {
            var user = await _userManager.FindByIdAsync(model.UserId);

            if (user == null)
            {
                return NotFound("Không tìm thấy người dùng");
            }

            var result = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);

            if (result.Succeeded)
            {
                return Ok("Đổi mật khẩu thành công");
            }

            return BadRequest(result.Errors);
        }

        // Giữ lại các phương thức hiện có
        [HttpPost("Update")]
        public async Task<IActionResult> UpdateProfile([FromBody] UserProfile profileData)
        {
            // Find the user by email or another unique identifier
            var user = await _context.ApplicationUser.FirstOrDefaultAsync(u => u.Email == profileData.Email);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            // Update the user's information
            user.FirstName = profileData.FirstName;
            user.LastName = profileData.LastName;
            user.Email = profileData.Email;
            user.PhoneNumber = profileData.PhoneNumber;
            // Save the changes to the database
            _context.ApplicationUser.Update(user);
            await _context.SaveChangesAsync();

            // Return the user's avatar URL or any other relevant information
            return Ok();
        }

        [HttpGet("GetAvatar")]
        public async Task<IActionResult> GetAvatarAsync([FromQuery] string id)
        {
            // Find the user by email
            var user = await _context.ApplicationUser.FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            // Return the user's avatar URL
            return Ok(new { avatar = user.Avatar });
        }

        [HttpGet("GetInFoUserById")]
        public async Task<IActionResult> GetInFoUserById([FromQuery] string id)
        {
            // Find the user by email
            var user = await _context.ApplicationUser.FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            // Return the user's avatar URL
            return Ok(new { firstName = user.FirstName, lastName = user.LastName, email = user.Email, phone = user.PhoneNumber});
        }

        [HttpPost("SignUp")]
        public async Task<IActionResult> SignUp(SignUpModel signUpModel)
        {
            var result = await accountRepo.SignUpAsync(signUpModel);
            if (result.Succeeded)
            {
                return Ok(result.Succeeded);
            }

            return Unauthorized();
        }

        [HttpPost("SignIn")]
        public async Task<IActionResult> SignIn(SignInModel signInModel)
        {
            var token = await accountRepo.SignInAsync(signInModel);

            if (string.IsNullOrEmpty(token))
            {
                return Unauthorized();
            }

            return Ok(new { token });
        }
        [HttpPost("GetUserInfo")]
        public async Task<IActionResult> GetUserInfoAsync([FromBody] string email)
        {
            // Sử dụng email để truy vấn thông tin người dùng

            var user = await _context.ApplicationUser.FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                return null; // Trả về null nếu không tìm thấy thông tin người dùng
            }

            // Chuyển đổi thông tin người dùng thành đối tượng UserInfo
            var userInfo = new ApplicationUser
            {
                Id = user.Id,
                PasswordHash = user.PasswordHash,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Avatar = user.Avatar,
                //Thêm các thuộc tính khác từ đối tượng User
            };

            if (userInfo == null)
            {
                return NotFound(); // Trả về 404 nếu không tìm thấy thông tin người dùng
            }

            return Ok(userInfo); // Trả về thông tin người dùng nếu tìm thấy
        }

        [HttpPost("SignInAdmin")]
        public async Task<IActionResult> SignInAdmin([FromBody] SignInModel signInModel)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(signInModel.Email);
                if (user == null)
                {
                    return BadRequest(new { message = "Email hoặc mật khẩu không đúng" });
                }

                var result = await _signInManager.CheckPasswordSignInAsync(user, signInModel.Password, false);
                if (!result.Succeeded)
                {
                    return BadRequest(new { message = "Email hoặc mật khẩu không đúng" });
                }

                var roles = await _userManager.GetRolesAsync(user);
                var allowedRoles = new[] { "employee", "administrator system", "admin" };
                
                if (!roles.Any(role => allowedRoles.Contains(role)))
                {
                    return BadRequest(new { message = "Tài khoản không có quyền truy cập" });
                }

                var authClaims = new List<Claim>
                {
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                };

                foreach (var role in roles)
                {
                    authClaims.Add(new Claim(ClaimTypes.Role, role));
                }

                var token = GenerateToken(authClaims);

                return Ok(new
                {
                    token = new JwtSecurityTokenHandler().WriteToken(token),
                    roles = roles,
                    expiration = token.ValidTo
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server: " + ex.Message });
            }
        }

        private JwtSecurityToken GenerateToken(List<Claim> authClaims)
        {
            var authSigningKey = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(_configuration["JWT:Secret"]));

            var token = new JwtSecurityToken(
                issuer: _configuration["JWT:ValidIssuer"],
                audience: _configuration["JWT:ValidAudience"],
                expires: DateTime.Now.AddMinutes(30),
                claims: authClaims,
                signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
            );

            return token;
        }
    }

    // Models mới cho các request
    public class CreateUserModel
    {
        public string Email { get; set; }
        public string Password { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PhoneNumber { get; set; }
        public string[] Roles { get; set; }
    }

    public class UpdateUserModel
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string[] Roles { get; set; }
    }

    public class ChangePasswordModel
    {
        public string UserId { get; set; }
        public string CurrentPassword { get; set; }
        public string NewPassword { get; set; }
    }
}