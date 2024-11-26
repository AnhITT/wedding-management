using CodeFirst.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DashboardController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("statistics")]
        public async Task<IActionResult> GetStatistics()
        {
            try
            {
                if (!User.Identity.IsAuthenticated)
                {
                    return Unauthorized(new { message = "Vui lòng đăng nhập" });
                }

                if (!User.IsInRole("employee") && !User.IsInRole("administrator system") && !User.IsInRole("admin"))
                {
                    return Forbid();
                }

                var totalHalls = await _context.Hall.CountAsync();
                var totalBranches = await _context.Branch.CountAsync();
                var totalMenus = await _context.MenuEntity.CountAsync();
                var totalServices = await _context.ServiceEntity.CountAsync();
                var totalUsers = await _context.ApplicationUser.CountAsync();
                var totalInvoices = await _context.Invoice.CountAsync();
                var totalRevenue = await _context.Invoice
                    .Where(i => i.PaymentStatus == true)
                    .SumAsync(i => i.Total) ?? 0;
                var totalFeedback = await _context.Feedback.CountAsync();

                // Lấy top 5 sảnh được đặt nhiều nhất
                var topHalls = await _context.Invoice
                    .Where(i => i.HallId != null)
                    .GroupBy(i => i.HallId)
                    .Select(g => new
                    {
                        HallId = g.Key,
                        HallName = g.First().Hall.Name,
                        BookingCount = g.Count()
                    })
                    .OrderByDescending(x => x.BookingCount)
                    .Take(5)
                    .ToListAsync();

                // Lấy doanh thu theo tháng trong năm hiện tại
                var currentYear = DateTime.Now.Year;
                var revenueByMonth = await _context.Invoice
                    .Where(i => i.PaymentStatus == true && i.InvoiceDate.Value.Year == currentYear)
                    .GroupBy(i => i.InvoiceDate.Value.Month)
                    .Select(g => new
                    {
                        Month = g.Key,
                        Revenue = g.Sum(i => i.Total)
                    })
                    .OrderBy(x => x.Month)
                    .ToListAsync();

                return Ok(new
                {
                    totalHalls,
                    totalBranches,
                    totalMenus,
                    totalServices,
                    totalUsers,
                    totalInvoices,
                    totalRevenue,
                    totalFeedback,
                    topHalls,
                    revenueByMonth
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
} 