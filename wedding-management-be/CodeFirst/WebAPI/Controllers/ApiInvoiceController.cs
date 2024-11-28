using CodeFirst.Data;
using CodeFirst.Models;
using CodeFirst.Models.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net.Mail;
using System.Net;
using System.Text;
using Newtonsoft.Json.Linq;
using static MudBlazor.CategoryTypes;
using System.ComponentModel.DataAnnotations;

namespace WebAPI.Controllers
{
    [Route("api/invoice")]
    [ApiController]
    public class ApiInvoiceController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ApiInvoiceController(ApplicationDbContext context)
        {
            _context = context;
        }
        [HttpGet("/api/time/get-hall-id")]
        public async Task<ActionResult<List<TimeOfDay>>> GetTimeOfDayByHallId(int hallId)
        {
            var timeOfDayList = await _context.TimeOfDay
                .Where(t => t.HallId == hallId)
                .ToListAsync();

            if (timeOfDayList == null || !timeOfDayList.Any())
            {
                return NotFound();
            }

            return Ok(timeOfDayList);
        }

        //[HttpPost("/api/invoice/payment-wallet/{id}")]
        //public async Task<IActionResult> PaymentWallet(int id)
        //{
        //    var invoice = _context.Invoice.FirstOrDefault(x => x.InvoiceID == id);
        //    var user = _context.ApplicationUser.Where(x => x.Id == invoice.UserId).FirstOrDefault();

        //    _currentInvoiceId = invoice.InvoiceID;

        //    return Ok(new { message = "Đã thanh toán bằng coin" });
        //}

        [HttpPost("/api/invoice/repayment-compelete-wallet/{id}")]
        public async Task<IActionResult> RepaymentCompeleteWallet(int id)
        {
            var invoice = _context.Invoice.FirstOrDefault(x => x.InvoiceID == id);
            if (invoice != null)
            {
                _currentInvoiceId = invoice.InvoiceID;
                invoice.PaymentStatus = true;
                invoice.PaymentCompleteWallet = true;


                var existingWallet = await _context.Wallet.Where(x => x.UserId == invoice.UserId).FirstOrDefaultAsync();


                if (existingWallet != null)
                {
                    if (existingWallet.Coin == null)
                    {
                        existingWallet.Coin = 0;
                    }
                    if (existingWallet.Coin < (invoice.Total / 2))
                    {
                        return BadRequest(new { message = "Số dư trong ví không đủ để thanh toán." });
                    }
                    existingWallet.Coin -= (invoice.Total - invoice.DepositPayment);
                    _context.Update(existingWallet);
                    SendMailPayment("HOÀN TẤT THANH TOÁN BẰNG COIN", invoice);
                }

                _context.Update(invoice);
                await _context.SaveChangesAsync();
            }


            return Ok(new { message = "Đã hủy đơn hàng" });
        }

        [HttpPost("/api/invoice/repayment-compelete/{id}")]
        public async Task<IActionResult> RepaymentCompelete(int id)
        {
            var invoice = _context.Invoice.FirstOrDefault(x => x.InvoiceID == id);
            if (invoice != null)
            {
                _currentInvoiceId = invoice.InvoiceID;
                invoice.PaymentStatus = true;
                invoice.OrderStatus = "Hoàn tất thanh toán";
                _context.Update(invoice);
                await _context.SaveChangesAsync();
                SendMailPayment("HOÀN TẤT THANH TOÁN BẰNG VNPAY", invoice);
            }


            return Ok(new { message = "Đã hủy đơn hàng" });
        }

        [HttpPost("/api/invoice/check-repayment/{id}")]
        public async Task<IActionResult> Repayment(int id)
        {
            var invoice = _context.Invoice.FirstOrDefault(x => x.InvoiceID == id);
            if (invoice != null)
            {
                if (invoice.OrderStatus == "Đã hủy đơn hàng")
                {
                    return BadRequest(new { message = "Đã hủy đơn nên không thể thanh toán đầy đủ" });
                }
                if (invoice.OrderStatus == "Hoàn tất thanh toán")
                {
                    return BadRequest(new { message = "Đơn hàng đã được hoàn tất thanh toán" });
                }
            }
            return Ok();
        }

        [HttpGet("/api/wallet/{userId}")]
        public async Task<IActionResult> WalletByUserId(string userId)
        {
            var wallet = await _context.Wallet.Where(x => x.UserId == userId).FirstOrDefaultAsync();
            return Ok(wallet);
        }

        [HttpPost("/api/invoice/cancel/{id}")]
        public async Task<IActionResult> CancelOrder(int id)
        {
            var invoice = _context.Invoice.FirstOrDefault(x => x.InvoiceID == id);
            if (invoice == null)
            {
                return NotFound(new { message = "Không tìm thấy hóa đơn" });
            }
            invoice.OrderStatus = "Đã hủy đơn hàng";

            var existingWallet = await _context.Wallet.Where(x => x.UserId == invoice.UserId).FirstOrDefaultAsync();
            var coinAmount = (bool)invoice.PaymentStatus ? invoice.Total : invoice.DepositPayment;


            if (existingWallet != null)
            {
                if (existingWallet.Coin == null)
                {
                    existingWallet.Coin = 0;
                }
                existingWallet.Coin += coinAmount;
                _context.Update(existingWallet);
            }
            else
            {
                var wallet = new Wallet()
                {
                    UserId = invoice.UserId,
                    Coin = coinAmount,
                };
                _context.Add(wallet);

                await _context.SaveChangesAsync();
            }


            _context.Update(invoice);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã hủy đơn hàng" });
        }

        [HttpPost("checked")]
        public IActionResult CheckDuplicateInvoice([FromBody] CheckDuplicateInvoice request)
        {
            var existingInvoice = _context.Invoice.FirstOrDefault(i =>
                i.AttendanceDate.Value.Date == request.AttendanceDate.Date &&
                i.BranchId == request.BranchId &&
                i.HallId == request.HallId &&
                i.TimeHall == request.TimeHall && string.IsNullOrEmpty(i.OrderStatus)
               );

            if (existingInvoice != null)
            {
                return BadRequest(new { message = "Chi nhánh, sảnh và buổi đến tham gia đã có người đặt" });
            }

            return Ok(new { message = "Không có hóa đơn trùng." });
        }
        static int? _currentInvoiceId;
        [HttpPost]
        public async Task<IActionResult> CreateInvoiceAndOrderMenus([FromBody] InvoiceAndOrderMenusRequest request)
        {

            // Kiểm tra xem đã có hóa đơn nào cùng ngày, cùng sảnh và cùng chi nhánh chưa
            var existingInvoice = _context.Invoice
                .FirstOrDefault(i => i.AttendanceDate.HasValue &&
                    i.AttendanceDate.Value.Date == request.AttendanceDate.Value.Date &&
                    i.BranchId == request.BranchId &&
                    i.HallId == request.HallId && i.TimeHall == request.TimeHall
                    && string.IsNullOrEmpty(i.OrderStatus));
            if (existingInvoice != null)
            {
                return BadRequest(new { message = "Đã có hóa đơn được tạo trong cùng một ngày, cùng chi nhánh và cùng sảnh." });
            }
            var invoice = new Invoice
            {
                UserId = request.UserId,
                BranchId = (int)request.BranchId,
                HallId = (int)request.HallId,
                InvoiceDate = DateTime.Now,
                Total = request.Total,
                TotalBeforeDiscount = request.TotalBeforeDiscount,
                FullName = request.FullName,
                PhoneNumber = request.PhoneNumber,
                Note = request.Note,
                PaymentStatus = false,
                TimeHall = request.TimeHall,
                DepositPayment = request.DepositPayment,
                OrderStatus = "Đã đặt cọc"
            };


            if (request.AttendanceDate.HasValue)
            {
                TimeSpan difference = request.AttendanceDate.Value - DateTime.Now;
                if (difference.Days < 20)
                {
                    return BadRequest(new { message = "Ngày đến tham dự phải cách ngày hiện tại ít nhất 20 ngày." });
                }
                invoice.AttendanceDate = request.AttendanceDate;
            }


            // Xử lý thanh toán qua ví
            if (request.PaymentWallet == true)
            {
                var existingWallet = await _context.Wallet.FirstOrDefaultAsync(x => x.UserId == invoice.UserId);

                if (existingWallet != null)
                {
                    if (existingWallet.Coin < (invoice.Total / 2))
                    {
                        invoice.PaymentWallet = false;
                        return BadRequest(new { message = "Số dư trong ví không đủ để thanh toán." });
                    }
                    invoice.PaymentWallet = true;
                    existingWallet.Coin -= ((invoice.Total) / 2);
                    _context.Update(existingWallet);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    return BadRequest(new { message = "Không tìm thấy ví cho người dùng." });
                }
            }


            _context.Invoice.Add(invoice);
            await _context.SaveChangesAsync();

            var newProjectByInvoice = new Project
            {
                Name = invoice.InvoiceID.ToString(),
            };
            _context.Projects.Add(newProjectByInvoice);
            await _context.SaveChangesAsync();

            var orderMenus = request.OrderMenus.Select(orderMenu => new OrderMenu
            {
                InvoiceID = invoice.InvoiceID,
                MenuId = orderMenu.MenuID
            }).ToList();


            _context.OrderMenu.AddRange(orderMenus);
            await _context.SaveChangesAsync();

            var orderServices = request.OrderServices.Select(orderService => new OrderService
            {
                InvoiceID = invoice.InvoiceID,
                ServiceId = orderService.ServiceId
            }).ToList();

            _context.OrderService.AddRange(orderServices);
            await _context.SaveChangesAsync();
            SendMail("HOÀN TẤT ĐẶT CỌC", request, invoice, orderMenus, orderServices);



            // Tạo danh sách các đối tượng InvoiceCode và thêm thông tin mã giảm giá
            var invoiceCodes = request.InvoiceCodeRequest.Select(codeId => new InvoiceCode
            {
                InvoiceId = invoice.InvoiceID,
                CodeId = codeId.CodeId
            }).ToList();

            _context.InvoiceCode.AddRange(invoiceCodes);
            await _context.SaveChangesAsync();
            //}
            _currentInvoiceId = invoice.InvoiceID;
            return Ok(new { message = "Hóa đơn và món đã đặt đã được tạo thành công!" });
        }

        [HttpGet("payment-return-url")]
        public IActionResult ReturnPaymentUrl()
        {
            try
            {
                var paymentUrl = "http://localhost:3000/payment-success";
                return RedirectPermanent(paymentUrl);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("booked-hall")]
        public IActionResult GetBookedHalls()
        {
            var currentDate = DateTime.Now.Date;

            // sắp xếp theo AttendanceDate tăng dần
            var bookedHalls = _context.Invoice
                .Where(i => i.HallId != null && i.AttendanceDate >= currentDate && string.IsNullOrEmpty(i.OrderStatus))
                .Select(i => new
                {
                    HallId = i.HallId,
                    HallName = i.Hall.Name,
                    BranchName = i.Branch.Name,
                    BookingDate = i.AttendanceDate,
                    TimeHall = i.TimeHall
                })
                .OrderBy(i => i.BookingDate)
                .ToList();

            return Ok(bookedHalls);
        }
        void SendMailPayment(string title, Invoice invoiceRecv)
        {
            var invoice = _context.Invoice.Include(x => x.Branch).Include(x => x.Hall).Include(x => x.User).FirstOrDefault(x => x.InvoiceID == invoiceRecv.InvoiceID);

            StringBuilder body = new StringBuilder();
            body.AppendLine("<html><head>");
            body.AppendLine("<style>");
            body.AppendLine("body { font-family: Arial, sans-serif; margin: 0; padding: 0; }");
            body.AppendLine(".container { width: 80%; margin: auto; overflow: hidden; }");
            body.AppendLine("header { background: white; color: white; padding-top: 30px; min-height: 70px; border-bottom: #D4BB72 4px solid; }");
            body.AppendLine("header a { color: white; text-decoration: none; text-transform: uppercase; font-size: 16px; }");
            body.AppendLine("header ul { padding: 0; margin: 0; float: right; margin-top: 20px; list-style: none; }");
            body.AppendLine("header #branding { float: left; margin: 0; padding: 0; }");
            body.AppendLine("header #branding img { height: 80px; }");
            body.AppendLine("header .highlight, header .current a { color: #E8BD72; font-weight: bold; }");
            body.AppendLine("header a:hover { color: #ffffff; font-weight: bold; }");
            body.AppendLine(".main { padding: 0; }");
            body.AppendLine(".main h2 { color: #333; }");
            body.AppendLine(".main p { font-size: 18px; color: #666; }");
            body.AppendLine("table { border-collapse: collapse; width: 100%; }");
            body.AppendLine("th, td { border: 1px solid #dddddd; text-align: left; padding: 12px; font-size: 16px; }");
            body.AppendLine("th { background-color: #f2f2f2; }");
            body.AppendLine("</style>");
            body.AppendLine("</head><body>");
            body.AppendLine("<header>");
            body.AppendLine("<div class=\"container\">");
            body.AppendLine("<div id=\"branding\">");
            // Thêm ảnh logo vào giữa header
            body.AppendLine("<h1><span class=\"highlight\">Nhà hàng tiệc cưới</span></h1>");
            body.AppendLine("</div>");
            body.AppendLine("</div>");
            body.AppendLine("</header>");
            body.AppendLine("<div class=\"container main\">");
            body.AppendLine("<h2>Chi tiết đơn hàng:</h2>");

            body.AppendLine($"<p><strong>Mã đơn hàng:</strong> {invoice.InvoiceID.ToString()}</p>");

            body.AppendLine($"<p><strong>Email đặt hàng:</strong> {invoice.User.Email}</p>");
            body.AppendLine($"<p><strong>Số điện thoại:</strong> {invoice.User.PhoneNumber}</p>");

            body.AppendLine($"<p><strong>Ngày đặt hàng:</strong> {invoice.InvoiceDate?.ToString("dd/MM/yyyy")}</p>");
            body.AppendLine($"<p><strong>Ngày tham dự:</strong> {invoice.AttendanceDate?.ToString("dd/MM/yyyy")}</p>");
            body.AppendLine($"<p><strong>Ca đến:</strong> {invoice.TimeHall}</p>");
            body.AppendLine($"<p><strong>Chi nhánh đã đặt:</strong> {invoice.Branch.Name}</p>");
            body.AppendLine($"<p><strong>Sản phẩm:</strong></p>");


            body.AppendLine("<table>");
            body.AppendLine("<tr><th>Hình nh</th><th>Tên sản phẩm</th><th>Giá bán</th></tr>");

            body.AppendLine($"<tr>");
            body.AppendLine($"<td style='width: 150px'><img src='{invoice.Hall.Image}' alt='Logo' style='width: 100%; height: 120px;' /></td>");
            body.AppendLine($"<td>{invoice.Hall.Name}</td>");
            body.AppendLine($"<td>{invoice.Hall.Price.Value.ToString("#,##0")} VND</td>");
            body.AppendLine($"</tr>");

            List<OrderMenu> orderMenus = _context.OrderMenu.Where(x => x.InvoiceID == invoiceRecv.InvoiceID).ToList();
            List<OrderService> orderServices = _context.OrderService.Where(x => x.InvoiceID == invoiceRecv.InvoiceID).ToList();

            // danh sách món ăn đặt nhà hàng
            foreach (var orderMenu in orderMenus)
            {
                var item = _context.MenuEntity.Find(orderMenu.MenuId);
                body.AppendLine($"<tr>");
                body.AppendLine($"<td style='width: 150px'><img src='{item.Image}' alt='Logo' style='width: 100%; height: 120px;' /></td>");
                body.AppendLine($"<td>{item.Name}</td>");
                body.AppendLine($"<td>{item.Price.Value.ToString("#,##0")} VND</td>");
                body.AppendLine($"</tr>");
            }
            // danh sách dịch vụ đặt nhà hàng
            foreach (var orderService in orderServices)
            {
                var item = _context.ServiceEntity.Find(orderService.ServiceId);
                body.AppendLine($"<tr>");
                body.AppendLine($"<td style='width: 150px'><img src='{item.Image}' alt='Logo' style='width: 100%; height: 120px;' /></td>");
                body.AppendLine($"<td>{item.Name}</td>");
                body.AppendLine($"<td>{item.Price.Value.ToString("#,##0")} VND</td>");
                body.AppendLine($"</tr>");
            }
            body.AppendLine($"<tr><td colspan='2'><strong>Tổng tiền sau khi áp dụng mã giảm:</strong></td><td>{invoice.Total.Value.ToString("#,##0")} VND</td></tr>");


            body.AppendLine("</table>");
            body.AppendLine("</div>");

            body.AppendLine("<footer style=\"margin-top:20px;background: #262626; color: white; padding: 20px 0;\">");
            body.AppendLine("<div class=\"container\">");
            body.AppendLine("<p>&copy; 2024 Khóa luận Khoa Học Máy Tính. </p>");
            body.AppendLine("</div>");
            body.AppendLine("</footer>");

            body.AppendLine("</body></html>");

            // Gửi email
            MailMessage mail = new MailMessage();
            //mail.To.Add(customer.Email.ToString());
            mail.To.Add("minhnguyen20020524@gmail.com"); // email người nhận 

            mail.From = new MailAddress("duatreodaiduongden@gmail.com");// email người gửi 
            mail.Subject = $"{title} - CHI TIẾT ĐƠN HÀNG";
            mail.Body = body.ToString();
            mail.IsBodyHtml = true; // Bật chế độ HTML

            // SmtpClient smtp = new SmtpClient("sandbox.smtp.mailtrap.io");
            // smtp.EnableSsl = true;
            // smtp.Port = 2525;
            // smtp.DeliveryMethod = SmtpDeliveryMethod.Network;
            // smtp.Credentials = new NetworkCredential("f53ec0c5d129dd", "647d8437d3d40c");

            SmtpClient smtp = new SmtpClient("smtp.gmail.com"); // máy chủ smtp của google
            smtp.EnableSsl = true;
            smtp.Port = 587; // port client mặc định hầu như máy nào cũng vậy
            smtp.DeliveryMethod = SmtpDeliveryMethod.Network;
            smtp.Credentials = new NetworkCredential("duatreodaiduongden@gmail.com", "aiyt kzuj xpbq ygda"); // từ năm 2022 trở đi dùng mật khẩu do gmail cấp 

            try
            {
                smtp.Send(mail);
            }
            catch (Exception ex)
            {
                // Xử lý nếu có lỗi khi gửi mail
            }
        }
        void SendMail(string title, InvoiceAndOrderMenusRequest request, Invoice invoiceRecv, List<OrderMenu> orderMenus, List<OrderService> orderServices)
        {
            var invoice = _context.Invoice.FirstOrDefault(x => x.InvoiceID == invoiceRecv.InvoiceID);
            var invoiceWithBranch = _context.Branch.FirstOrDefault(x => x.BranchId == request.BranchId);
            var invoiceWithHall = _context.Hall.FirstOrDefault(x => x.HallId == request.HallId);

            StringBuilder body = new StringBuilder();
            body.AppendLine("<html><head>");
            body.AppendLine("<style>");
            body.AppendLine("body { font-family: Arial, sans-serif; margin: 0; padding: 0; }");
            body.AppendLine(".container { width: 80%; margin: auto; overflow: hidden; }");
            body.AppendLine("header { background: white; color: white; padding-top: 30px; min-height: 70px; border-bottom: #D4BB72 4px solid; }");
            body.AppendLine("header a { color: white; text-decoration: none; text-transform: uppercase; font-size: 16px; }");
            body.AppendLine("header ul { padding: 0; margin: 0; float: right; margin-top: 20px; list-style: none; }");
            body.AppendLine("header #branding { float: left; margin: 0; padding: 0; }");
            body.AppendLine("header #branding img { height: 80px; }");
            body.AppendLine("header .highlight, header .current a { color: #E8BD72; font-weight: bold; }");
            body.AppendLine("header a:hover { color: #ffffff; font-weight: bold; }");
            body.AppendLine(".main { padding: 0; }");
            body.AppendLine(".main h2 { color: #333; }");
            body.AppendLine(".main p { font-size: 18px; color: #666; }");
            body.AppendLine("table { border-collapse: collapse; width: 100%; }");
            body.AppendLine("th, td { border: 1px solid #dddddd; text-align: left; padding: 12px; font-size: 16px; }");
            body.AppendLine("th { background-color: #f2f2f2; }");
            body.AppendLine("</style>");
            body.AppendLine("</head><body>");
            body.AppendLine("<header>");
            body.AppendLine("<div class=\"container\">");
            body.AppendLine("<div id=\"branding\">");
            // Thêm ảnh logo vào giữa header
            body.AppendLine("<h1><span class=\"highlight\">Nhà hàng tiệc cưới</span></h1>");
            body.AppendLine("</div>");
            body.AppendLine("</div>");
            body.AppendLine("</header>");
            body.AppendLine("<div class=\"container main\">");
            body.AppendLine("<h2>Chi tiết đơn hàng:</h2>");

            body.AppendLine($"<p><strong>Mã đơn hàng:</strong> {invoice.InvoiceID.ToString()}</p>");
            var customer = _context.ApplicationUser.FirstOrDefault(x => x.Id == request.UserId);

            body.AppendLine($"<p><strong>Email đặt hàng:</strong> {customer.Email}</p>");
            body.AppendLine($"<p><strong>Số điện thoại:</strong> {customer.PhoneNumber}</p>");

            body.AppendLine($"<p><strong>Ngày đặt hàng:</strong> {invoice.InvoiceDate?.ToString("dd/MM/yyyy")}</p>");
            body.AppendLine($"<p><strong>Ngày tham dự:</strong> {invoice.AttendanceDate?.ToString("dd/MM/yyyy")}</p>");
            body.AppendLine($"<p><strong>Ca đến:</strong> {invoice.TimeHall}</p>");
            body.AppendLine($"<p><strong>Chi nhánh đã đặt:</strong> {invoiceWithBranch.Name}</p>");
            body.AppendLine($"<p><strong>Sản phẩm:</strong></p>");


            body.AppendLine("<table>");
            body.AppendLine("<tr><th>Hình ảnh</th><th>Tên sản phẩm</th><th>Giá bán</th></tr>");

            body.AppendLine($"<tr>");
            body.AppendLine($"<td style='width: 150px'><img src='{invoiceWithHall.Image}' alt='Logo' style='width: 100%; height: 120px;' /></td>");
            body.AppendLine($"<td>{invoiceWithHall.Name}</td>");
            body.AppendLine($"<td>{invoiceWithHall.Price.Value.ToString("#,##0")} VND</td>");
            body.AppendLine($"</tr>");


            // danh sách món ăn đặt nhà hàng
            foreach (var orderMenu in orderMenus)
            {
                var item = _context.MenuEntity.Find(orderMenu.MenuId);
                body.AppendLine($"<tr>");
                body.AppendLine($"<td style='width: 150px'><img src='{item.Image}' alt='Logo' style='width: 100%; height: 120px;' /></td>");
                body.AppendLine($"<td>{item.Name}</td>");
                body.AppendLine($"<td>{item.Price.Value.ToString("#,##0")} VND</td>");
                body.AppendLine($"</tr>");
            }
            // danh sách dịch vụ đặt nhà hàng
            foreach (var orderService in orderServices)
            {
                var item = _context.ServiceEntity.Find(orderService.ServiceId);
                body.AppendLine($"<tr>");
                body.AppendLine($"<td style='width: 150px'><img src='{item.Image}' alt='Logo' style='width: 100%; height: 120px;' /></td>");
                body.AppendLine($"<td>{item.Name}</td>");
                body.AppendLine($"<td>{item.Price.Value.ToString("#,##0")} VND</td>");
                body.AppendLine($"</tr>");
            }
            body.AppendLine($"<tr><td colspan='2'><strong>Tổng tiền sau khi áp dụng mã giảm:</strong></td><td>{invoice.Total.Value.ToString("#,##0")} VND</td></tr>");


            body.AppendLine("</table>");
            body.AppendLine("</div>");

            body.AppendLine("<footer style=\"margin-top:20px;background: #262626; color: white; padding: 20px 0;\">");
            body.AppendLine("<div class=\"container\">");
            body.AppendLine("<p>&copy; 2024 Khóa luận Khoa Học Máy Tính. </p>");
            body.AppendLine("</div>");
            body.AppendLine("</footer>");

            body.AppendLine("</body></html>");

            // Gửi email
            MailMessage mail = new MailMessage();
            //mail.To.Add(customer.Email.ToString());
            mail.To.Add("minhnguyen20020524@gmail.com"); // email người nhận 

            mail.From = new MailAddress("duatreodaiduongden@gmail.com");// email người gửi 
            mail.Subject = $"{title} - CHI TIẾT ĐƠN HÀNG";
            mail.Body = body.ToString();
            mail.IsBodyHtml = true; // Bật chế độ HTML

            // SmtpClient smtp = new SmtpClient("sandbox.smtp.mailtrap.io");
            // smtp.EnableSsl = true;
            // smtp.Port = 2525;
            // smtp.DeliveryMethod = SmtpDeliveryMethod.Network;
            // smtp.Credentials = new NetworkCredential("f53ec0c5d129dd", "647d8437d3d40c");

            SmtpClient smtp = new SmtpClient("smtp.gmail.com"); // máy chủ smtp của google
            smtp.EnableSsl = true;
            smtp.Port = 587; // port client mặc định hầu như máy nào cũng vậy
            smtp.DeliveryMethod = SmtpDeliveryMethod.Network;
            smtp.Credentials = new NetworkCredential("duatreodaiduongden@gmail.com", "aiyt kzuj xpbq ygda"); // từ năm 2022 trở đi dùng mật khẩu do gmail cấp 

            try
            {
                smtp.Send(mail);
            }
            catch (Exception ex)
            {
                // Xử lý nếu có lỗi khi gửi mail
            }
        }

        [HttpGet("get-invoice/{userId}")]
        public IActionResult GetInvoicesByUser(string userId)
        {
            try
            {
                // Truy vấn danh sách hóa đơn dựa trên UserId và kèm theo thông tin OrderMenu và OrderService
                var invoices = _context.Invoice
                    .Where(i => i.UserId == userId)
                    .Include(i => i.Branch)
                    .Include(i => i.Hall)
                    .Include(i => i.OrderMenus) // Kèm thông tin OrderMenu
                        .ThenInclude(om => om.MenuEntity) // Kèm thông tin MenuEntity
                    .Include(i => i.OrderServices) // Kèm thông tin OrderService
                        .ThenInclude(os => os.ServiceEntity) // Kèm thông tin ServiceEntity
                    .ToList();

                return Ok(invoices);
            }
            catch (Exception ex)
            {
                // Xử lý lỗi nếu cần
                return StatusCode(500, new { message = "Lỗi server: " + ex.Message });
            }
        }
        [HttpGet("promo-code")]
        public async Task<ActionResult<IEnumerable<Code>>> GetPromoCodes()
        {
            var promoCodes = await _context.Code.ToListAsync();
            return Ok(promoCodes);
        }
        [HttpPost("use-promo-code")]
        public async Task<ActionResult> UsePromoCode(int codeId)
        {
            var code = await _context.Code.FindAsync(codeId);

            if (code != null && code.Quantity > 0)
            {
                code.Quantity--; // Giảm số lượng mã giảm giá
                if (code.Quantity <= 0)
                {
                    _context.Code.Remove(code); // Xóa mã nếu hết lượt sử dụng
                }
                await _context.SaveChangesAsync();
                return Ok("Mã giảm giá đã được sử dụng.");
            }

            return BadRequest("Mã giảm giá không hợp lệ hoặc đã hết lượt sử dụng.");
        }

        [HttpGet]
        public async Task<IActionResult> GetAllInvoices()
        {
            try
            {
                var invoices = await _context.Invoice
                    .Include(i => i.User)
                    .Include(i => i.Branch)
                    .Include(i => i.Hall)
                    .Include(i => i.OrderMenus)
                        .ThenInclude(om => om.MenuEntity)
                    .Include(i => i.OrderServices)
                        .ThenInclude(os => os.ServiceEntity)
                    .Select(i => new
                    {
                        i.InvoiceID,
                        i.InvoiceDate,
                        i.AttendanceDate,
                        i.TimeHall,
                        i.Total,
                        i.TotalBeforeDiscount,
                        i.PaymentStatus,
                        i.OrderStatus,
                        i.DepositPayment,
                        i.PaymentWallet,
                        i.PaymentCompleteWallet,
                        User = new
                        {
                            i.User.Id,
                            i.User.Email,
                            i.User.PhoneNumber,
                            FullName = $"{i.User.FirstName} {i.User.LastName}"
                        },
                        Branch = new
                        {
                            i.Branch.BranchId,
                            i.Branch.Name,
                            i.Branch.Address
                        },
                        Hall = new
                        {
                            i.Hall.HallId,
                            i.Hall.Name,
                            i.Hall.Price
                        },
                        OrderMenus = i.OrderMenus.Select(om => new
                        {
                            om.MenuEntity.MenuId,
                            om.MenuEntity.Name,
                            om.MenuEntity.Price
                        }),
                        OrderServices = i.OrderServices.Select(os => new
                        {
                            os.ServiceEntity.ServiceId,
                            os.ServiceEntity.Name,
                            os.ServiceEntity.Price
                        })
                    })
                    .OrderByDescending(i => i.InvoiceDate)
                    .ToListAsync();

                return Ok(invoices);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách hóa đơn", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetInvoiceById(int id)
        {
            try
            {
                var invoice = await _context.Invoice
                    .Include(i => i.User)
                    .Include(i => i.Branch)
                    .Include(i => i.Hall)
                    .Include(i => i.OrderMenus)
                        .ThenInclude(om => om.MenuEntity)
                    .Include(i => i.OrderServices)
                        .ThenInclude(os => os.ServiceEntity)
                    .Where(i => i.InvoiceID == id)
                    .Select(i => new
                    {
                        i.InvoiceID,
                        i.InvoiceDate,
                        i.AttendanceDate,
                        i.TimeHall,
                        i.Total,
                        i.TotalBeforeDiscount,
                        i.PaymentStatus,
                        i.OrderStatus,
                        i.DepositPayment,
                        i.PaymentWallet,
                        i.PaymentCompleteWallet,
                        User = new
                        {
                            i.User.Id,
                            i.User.Email,
                            i.User.PhoneNumber,
                            FullName = $"{i.User.FirstName} {i.User.LastName}"
                        },
                        Branch = new
                        {
                            i.Branch.BranchId,
                            i.Branch.Name,
                            i.Branch.Address
                        },
                        Hall = new
                        {
                            i.Hall.HallId,
                            i.Hall.Name,
                            i.Hall.Price
                        },
                        OrderMenus = i.OrderMenus.Select(om => new
                        {
                            om.MenuEntity.MenuId,
                            om.MenuEntity.Name,
                            om.MenuEntity.Price
                        }),
                        OrderServices = i.OrderServices.Select(os => new
                        {
                            os.ServiceEntity.ServiceId,
                            os.ServiceEntity.Name,
                            os.ServiceEntity.Price
                        })
                    })
                    .FirstOrDefaultAsync();

                if (invoice == null)
                {
                    return NotFound(new { message = "Không tìm thấy hóa đơn" });
                }

                return Ok(invoice);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy thông tin hóa đơn", error = ex.Message });
            }
        }

        [HttpPut("{id}/update-status")]
        public async Task<IActionResult> UpdateInvoiceStatus(int id, [FromBody] UpdateInvoiceStatusRequest request)
        {
            try
            {
                var invoice = await _context.Invoice.FindAsync(id);
                if (invoice == null)
                {
                    return NotFound(new { message = "Không tìm thấy hóa đơn" });
                }

                // Cập nhật trạng thái thanh toán
                if (request.PaymentStatus.HasValue)
                {
                    invoice.PaymentStatus = request.PaymentStatus.Value;
                }

                // Cập nhật trạng thái đơn hàng
                if (!string.IsNullOrEmpty(request.OrderStatus))
                {
                    invoice.OrderStatus = request.OrderStatus;

                    // Nếu hủy đơn, hoàn tiền vào ví
                    if (request.OrderStatus == "Đã hủy")
                    {
                        var existingWallet = await _context.Wallet
                            .FirstOrDefaultAsync(w => w.UserId == invoice.UserId);

                        var refundAmount = invoice.PaymentStatus == true ?
                            invoice.Total : invoice.DepositPayment;

                        if (existingWallet != null)
                        {
                            existingWallet.Coin = (existingWallet.Coin ?? 0) + refundAmount;
                            _context.Update(existingWallet);
                        }
                        else
                        {
                            var wallet = new Wallet
                            {
                                UserId = invoice.UserId,
                                Coin = refundAmount
                            };
                            _context.Add(wallet);
                        }
                    }
                }

                await _context.SaveChangesAsync();

                // Gửi email thông báo
                if (request.PaymentStatus == true)
                {
                    SendMailPayment("HOÀN TẤT THANH TOÁN", invoice);
                }

                return Ok(new { message = "Cập nhật trạng thái hóa đơn thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi cập nhật trạng thái hóa đơn", error = ex.Message });
            }
        }

        [HttpGet("statistics")]
        public async Task<IActionResult> GetInvoiceStatistics()
        {
            try
            {
                var today = DateTime.Today;
                var firstDayOfMonth = new DateTime(today.Year, today.Month, 1);
                var lastDayOfMonth = firstDayOfMonth.AddMonths(1).AddDays(-1);

                // Tổng số hóa đơn
                var totalInvoices = await _context.Invoice.CountAsync();

                // Tổng doanh thu
                var totalRevenue = await _context.Invoice
                    .Where(i => i.PaymentStatus == true)
                    .SumAsync(i => i.Total) ?? 0;

                // Doanh thu tháng hiện tại
                var currentMonthRevenue = await _context.Invoice
                    .Where(i => i.PaymentStatus == true &&
                           i.InvoiceDate >= firstDayOfMonth &&
                           i.InvoiceDate <= lastDayOfMonth)
                    .SumAsync(i => i.Total) ?? 0;

                // Số đơn chưa thanh toán
                var unpaidInvoices = await _context.Invoice
                    .CountAsync(i => i.PaymentStatus == false);

                // Số đơn đã hủy
                var cancelledInvoices = await _context.Invoice
                    .CountAsync(i => i.OrderStatus == "Đã hủy");

                // Doanh thu theo tháng trong năm hiện tại
                var revenueByMonth = await _context.Invoice
                    .Where(i => i.PaymentStatus == true &&
                           i.InvoiceDate.Value.Year == today.Year)
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
                    totalInvoices,
                    totalRevenue,
                    currentMonthRevenue,
                    unpaidInvoices,
                    cancelledInvoices,
                    revenueByMonth
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy thống kê hóa đơn", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateInvoice(int id, [FromBody] UpdateInvoiceRequest request)
        {
            try
            {
                var invoice = await _context.Invoice
                    .Include(i => i.OrderMenus)
                    .Include(i => i.OrderServices)
                    .FirstOrDefaultAsync(i => i.InvoiceID == id);

                if (invoice == null)
                {
                    return NotFound(new { message = "Không tìm thấy hóa đơn" });
                }

                // Lưu lại tiền cọc cũ
                var originalDeposit = invoice.DepositPayment;

                // Cập nhật thông tin cơ bản
                invoice.BranchId = request.BranchId;
                invoice.HallId = request.HallId;
                invoice.TimeHall = request.TimeHall;

                // Xóa các OrderMenu cũ
                _context.OrderMenu.RemoveRange(invoice.OrderMenus);

                // Thêm OrderMenu mới
                var newOrderMenus = request.OrderMenus.Select(om => new OrderMenu
                {
                    InvoiceID = invoice.InvoiceID,
                    MenuId = om.MenuId
                }).ToList();
                await _context.OrderMenu.AddRangeAsync(newOrderMenus);

                // Xóa các OrderService cũ
                _context.OrderService.RemoveRange(invoice.OrderServices);

                // Thêm OrderService mới
                var newOrderServices = request.OrderServices.Select(os => new OrderService
                {
                    InvoiceID = invoice.InvoiceID,
                    ServiceId = os.ServiceId
                }).ToList();
                await _context.OrderService.AddRangeAsync(newOrderServices);

                // Tính toán lại tổng tiền
                var hallPrice = await _context.Hall
                    .Where(h => h.HallId == request.HallId)
                    .Select(h => h.Price ?? 0)
                    .FirstOrDefaultAsync();

                var menuPrices = await _context.MenuEntity
                    .Where(m => request.OrderMenus.Select(om => om.MenuId).Contains(m.MenuId))
                    .SumAsync(m => m.Price ?? 0);

                var servicePrices = await _context.ServiceEntity
                    .Where(s => request.OrderServices.Select(os => os.ServiceId).Contains(s.ServiceId))
                    .SumAsync(s => s.Price ?? 0);

                invoice.TotalBeforeDiscount = hallPrice + menuPrices + servicePrices;
                invoice.Total = invoice.TotalBeforeDiscount;

                // Giữ nguyên tiền cọc ban đầu
                invoice.DepositPayment = originalDeposit;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Cập nhật hóa đơn thành công",
                    data = new
                    {
                        totalBeforeDiscount = invoice.TotalBeforeDiscount,
                        total = invoice.Total,
                        depositPayment = invoice.DepositPayment,
                        remainingPayment = invoice.Total - invoice.DepositPayment
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi cập nhật hóa đơn", error = ex.Message });
            }
        }
        [HttpPut("{id}/updateStatus")]
        public async Task<IActionResult> UpdateStatusInvoice(int id, string request)
        {
            try
            {
                var invoice = await _context.Invoice
                    .Include(i => i.OrderMenus)
                    .Include(i => i.OrderServices)
                    .FirstOrDefaultAsync(i => i.InvoiceID == id);

                if (invoice == null)
                {
                    return NotFound(new { message = "Không tìm thấy hóa đơn" });
                }
                invoice.OrderStatus = request;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Cập nhật hóa đơn thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi cập nhật hóa đơn", error = ex.Message });
            }
        }
        public class UpdateInvoiceStatusRequest
        {
            public bool? PaymentStatus { get; set; }
            public string OrderStatus { get; set; }
        }

        public class UpdateInvoiceRequest
        {
            [Required]
            public int BranchId { get; set; }
            
            [Required] 
            public int HallId { get; set; }
            
            [Required]
            public string TimeHall { get; set; }
            
            [Required]
            public List<OrderMenuRequest> OrderMenus { get; set; }
            
            [Required]
            public List<OrderServiceRequest> OrderServices { get; set; }
        }

        public class OrderMenuRequest
        {
            [Required]
            public int MenuId { get; set; }
        }

        public class OrderServiceRequest
        {
            [Required]
            public int ServiceId { get; set; }
        }
    }
}
