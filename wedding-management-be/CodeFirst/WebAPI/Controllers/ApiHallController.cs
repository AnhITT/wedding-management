using CodeFirst.Data;
using CodeFirst.Models;
using CodeFirst.Models.Entities;
using CodeFirst.ViewModels;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using WebAPI.Repositories;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace WebAPI.Controllers
{
    [Route("api/hall")]
    [ApiController]
    public class ApiHallController : ControllerBase
    {
        private readonly IAccountRepository accountRepo;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;

        public ApiHallController(IAccountRepository repo, UserManager<ApplicationUser> userManager, ApplicationDbContext context)
        {
            accountRepo = repo;
            _userManager = userManager;
            _context = context;
        }


        [HttpGet("/api/getsuggesthall/{branchid}/{numberOfTables}/{cost}")]
        public async Task<IActionResult> GetSuggestedHalls(int branchid, int numberOfTables,  double cost)
        {
            try
            {
                // Query to filter halls based on branchId, numberOfTables, and cost
                if(numberOfTables == null)
                {
                    numberOfTables = 0;
                }
                var filteredHalls = await _context.Hall
                    .Where(h => h.BranchId == branchid && h.Capacity >= numberOfTables && h.Price <= cost)
                    .ToListAsync();

                return Ok(filteredHalls);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        [HttpGet("/api/get-hall-by-branchid/{branchid}")]
        public IActionResult GetHallByBranchId(int branchid)
        {
            var listHallByBranchId = _context.Hall.Where(x => x.BranchId == branchid)
            .Select(hall => new
            {
                hall.HallId,
                hall.Name,
                hall.Description,
                hall.Image,
                hall.Price,
                hall.Capacity,
            }).ToList();
            return Ok(listHallByBranchId);
        }


        [HttpGet]
        public IActionResult GetAllHalls()
        {
            // Lấy danh sách tất cả các Hall kèm theo thông tin Name của Branch
            var halls = _context.Hall
                .Select(hall => new
                {
                    hall.HallId,
                    hall.Name,
                    hall.Description,
                    hall.Image,
                    hall.Price,
                    hall.Capacity,
                    BranchName = hall.Branch != null ? hall.Branch.Name : null // Lấy tên của Branch hoặc null nếu không có Branch
                })
                .ToList();

            return Ok(halls); // Trả về danh sách thông tin Hall và BranchName
        }

      

        // GET api/<ApiHallController>/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetHallById(int id)
        {
            var hall = await _context.Hall
                .Include(h => h.Branch)
                .FirstOrDefaultAsync(h => h.HallId == id);

            if (hall == null)
            {
                return NotFound("Không tìm thấy sảnh");
            }

            return Ok(hall);
        }

        // POST api/<ApiHallController>
        [HttpPost]
        public async Task<IActionResult> CreateHall([FromBody] Hall hall)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.Hall.Add(hall);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetHallById), new { id = hall.HallId }, hall);
        }

        // PUT api/<ApiHallController>/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateHall(int id, [FromBody] Hall hall)
        {
            if (id != hall.HallId)
            {
                return BadRequest("ID không khớp");
            }

            _context.Entry(hall).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!HallExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE api/<ApiHallController>/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHall(int id)
        {
            var hall = await _context.Hall.FindAsync(id);
            if (hall == null)
            {
                return NotFound();
            }

            _context.Hall.Remove(hall);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool HallExists(int id)
        {
            return _context.Hall.Any(e => e.HallId == id);
        }
    }
}
