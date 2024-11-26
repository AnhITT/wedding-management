using CodeFirst.Data;
using CodeFirst.Models.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace WebAPI.Controllers
{
    
    [Route("api/service")]
    [ApiController]
    public class ApiServiceController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public ApiServiceController(ApplicationDbContext context)
        {
            _context = context;
        }

        // API cho Service Category
        [HttpGet("getCateService")]
        public async Task<ActionResult<IEnumerable<ServiceCategory>>> GetCategories()
        {
            var categories = await _context.ServiceCategory.ToListAsync();
            if (categories == null)
            {
                return NotFound();
            }
            return Ok(categories);
        }

        [HttpGet("category/{id}")]
        public async Task<ActionResult<ServiceCategory>> GetCategory(int id)
        {
            var category = await _context.ServiceCategory.FindAsync(id);
            if (category == null)
            {
                return NotFound("Không tìm thấy danh mục");
            }
            return Ok(new {
                categoryId = category.CategoryId,
                name = category.Name,
                description = category.Description
            });
        }

        [HttpPost("category")]
        public async Task<ActionResult<ServiceCategory>> CreateCategory([FromBody] ServiceCategory category)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.ServiceCategory.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategory), new { id = category.CategoryId }, category);
        }

        [HttpPut("category/{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] ServiceCategory category)
        {
            if (id != category.CategoryId)
            {
                return BadRequest("ID không khớp");
            }

            _context.Entry(category).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { message = "Cập nhật thành công" });
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CategoryExists(id))
                {
                    return NotFound();
                }
                throw;
            }
        }

        [HttpDelete("category/{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.ServiceCategory.FindAsync(id);
            if (category == null)
            {
                return NotFound("Không tìm thấy danh mục");
            }

            try
            {
                _context.ServiceCategory.Remove(category);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Xóa thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi xóa danh mục", error = ex.Message });
            }
        }

        private bool CategoryExists(int id)
        {
            return _context.ServiceCategory.Any(e => e.CategoryId == id);
        }

        // API cho Service
        [HttpGet]
        public async Task<IActionResult> GetAsync()
        {
            try
            {
                var serviceItems = await _context.ServiceEntity
                    .Include(service => service.ServiceCategory)
                    .ToListAsync();

                var result = serviceItems.Select(service => new
                {
                    ServiceId = service.ServiceId,
                    Name = service.Name,
                    Price = service.Price,
                    Description = service.Description,
                    CategoryName = service.ServiceCategory?.Name,
                    Image = service.Image
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("{id}")]
        public IActionResult Get(int id)
        {
            var serviceById = _context.ServiceEntity.Find(id);
            if (serviceById == null)
            {
                return NotFound();
            }
            return Ok(serviceById);
        }

        [HttpPost]
        public async Task<IActionResult> PostAsync([FromBody] ServiceEntity service)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.ServiceEntity.Add(service);
            await _context.SaveChangesAsync();

            return Ok(service);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateService(int id, [FromBody] ServiceEntity service)
        {
            if (id != service.ServiceId)
            {
                return BadRequest("ID không khớp");
            }

            _context.Entry(service).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ServiceExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteService(int id)
        {
            var service = await _context.ServiceEntity.FindAsync(id);
            if (service == null)
            {
                return NotFound();
            }

            _context.ServiceEntity.Remove(service);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ServiceExists(int id)
        {
            return _context.ServiceEntity.Any(e => e.ServiceId == id);
        }
    }
}
