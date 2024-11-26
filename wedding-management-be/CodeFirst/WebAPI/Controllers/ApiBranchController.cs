using CodeFirst.Data;
using CodeFirst.Models;
using CodeFirst.Models.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebAPI.Repositories;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ApiBranchController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ApiBranchController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllBranches()
        {
            var branches = await _context.Branch.ToListAsync();
            return Ok(branches);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetBranchById(int id)
        {
            var branch = await _context.Branch.FindAsync(id);
            if (branch == null)
            {
                return NotFound("Không tìm thấy chi nhánh");
            }
            return Ok(branch);
        }

        [HttpPost]
        public async Task<IActionResult> CreateBranch([FromBody] Branch branch)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.Branch.Add(branch);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBranchById), new { id = branch.BranchId }, branch);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBranch(int id, [FromBody] Branch branch)
        {
            if (id != branch.BranchId)
            {
                return BadRequest("ID không khớp");
            }

            _context.Entry(branch).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { message = "Cập nhật thành công" });
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BranchExists(id))
                {
                    return NotFound();
                }
                throw;
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBranch(int id)
        {
            var branch = await _context.Branch.FindAsync(id);
            if (branch == null)
            {
                return NotFound("Không tìm thấy chi nhánh");
            }

            try
            {
                _context.Branch.Remove(branch);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Xóa thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi xóa chi nhánh", error = ex.Message });
            }
        }

        private bool BranchExists(int id)
        {
            return _context.Branch.Any(e => e.BranchId == id);
        }
    }
}
