import React, { useEffect, useState } from "react";
import { Button, Card, Modal, Table, Spinner } from "react-bootstrap";
import { format } from "date-fns";
import Cookies from "js-cookie";
import jwt_decode from "jwt-decode";
import { ToastContainer, toast } from "react-toastify";

import "./History.scss";
const History = () => {
  const [invoices, setInvoices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const tokenFromCookie = Cookies.get("token_user");
  const [isProcessingPaymentWallet, setIsProcessingPaymentWallet] =
    useState(false);

  let id = null;
  if (tokenFromCookie) {
    const decodedToken = jwt_decode(tokenFromCookie);
    id =
      decodedToken[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ];
  }

  const fetchInvoicesByUser = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `https://localhost:7296/api/invoice/get-invoice/${id}`
      );
      if (response.ok) {
        const data = await response.json();
        const sortedData = data.sort(
          (a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate)
        );
        setInvoices(sortedData);
        setLoading(false);
      } else {
        console.error("Lỗi khi lấy lịch sử đơn hàng");
      }
    } catch (error) {
      console.error("Lỗi server:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoicesByUser();
  }, []);

  function formatPrice(price) {
    const formattedPrice = price.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
    return formattedPrice;
  }

  const openModal = (invoice) => {
    setSelectedInvoice(invoice);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const repaymentInvoiceCoin = async (invoiceId) => {
    localStorage.setItem("invoiceId", invoiceId);

    try {
      const response = await fetch(
        `https://localhost:7296/api/invoice/check-repayment/${invoiceId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ invoiceId: invoiceId }),
        }
      );
      if (response.ok) {
        afterPaymentCoint();
        openModalPaymentCoin();
        // Cập nhật trạng thái của component sau khi hủy đơn hàng thành công
      } else {
        // Hóa đơn trùng lặp
        const data = await response.json();
        toast.error(data.message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        localStorage.removeItem("invoiceId");
      }
    } catch (error) {}
  };

  const repaymentInvoice = async (invoiceId) => {
    localStorage.setItem("invoiceId", invoiceId);

    try {
      const response = await fetch(
        `https://localhost:7296/api/invoice/check-repayment/${invoiceId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ invoiceId: invoiceId }),
        }
      );
      if (response.ok) {
        demoPayment();
        // Cập nhật trạng thái của component sau khi hủy đơn hàng thành công
      } else {
        // Hóa đơn trùng lặp
        const data = await response.json();
        toast.error(data.message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        localStorage.removeItem("invoiceId");
      }
    } catch (error) {}
  };
  const demoPayment = async (e) => {
    try {
      localStorage.removeItem("orderData");
      const paymentCompelete =
        selectedInvoice.total - selectedInvoice.depositPayment;
      const amount = paymentCompelete + "00";
      const response = await fetch(
        `https://localhost:7296/api/Payment?amount=${amount}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch payment URL");
      }
      const paymentUrl = await response.text(); // URL thanh toán từ API
      window.location.href = paymentUrl; // Chuyển hướng người dùng đến URL thanh toán
    } catch (error) {
      console.error("Error creating payment URL: ", error);
    }
  };
  const cancelInvoice = async (invoiceId) => {
    try {
      const response = await fetch(
        `https://localhost:7296/api/invoice/cancel/${invoiceId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ invoiceId: invoiceId }),
        }
      );
      if (response.ok) {
        setInvoices((prevInvoices) =>
          prevInvoices.map((invoice) =>
            invoice.invoiceID === invoiceId
              ? { ...invoice, orderStatus: "Đã hủy đơn hàng" }
              : invoice
          )
        );
        alert("Đơn hàng đã được hủy thành công.");
        closeModal();
      } else {
        alert("Có lỗi xảy ra khi hủy đơn hàng.");
      }
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error);
    }
  };

  const [wallet, setWallet] = useState(null);

  const [paymentCoin, setPaymentCoin] = useState([]);
  const afterPaymentCoint = async () => {
    if (wallet != null) {
      var coin = wallet.coin;
      var orderTolal = selectedInvoice.total / 2;
      if (coin - orderTolal < 0) {
        setPaymentCoin("Không đủ số dư");
      } else {
        setPaymentCoin(coin - orderTolal);
      }
    }
  };
  const [showModalPaymentWallet, setShowModalPaymentWallet] = useState(false);

  const openModalPaymentCoin = () => {
    closeModal();
    setShowModalPaymentWallet(true);
    fetchWallet();
    afterPaymentCoint();
  };
  const closeModalPaymentCoin = () => {
    afterPaymentCoint();

    fetchWallet();
    setShowModalPaymentWallet(false);
  };

  const fetchWallet = async () => {
    try {
      const response = await fetch(
        `https://localhost:7296/api/wallet/${id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch wallet info");
      }
      const data = await response.json();
      setWallet(data);
    } catch (error) {
      console.error("Error fetching wallet info:", error);
    }
  };
  const handlePaymentWalletOrderData = () => {
    paymentCompeleteWallet();
  };

  const paymentCompeleteWallet = () => {
    setIsProcessingPaymentWallet(true);

    setTimeout(() => {
      const storedInvoiceId = localStorage.getItem("invoiceId");

      if (storedInvoiceId) {
        const invoiceId = JSON.parse(storedInvoiceId);

        fetch(
          `https://localhost:7296/api/invoice/repayment-compelete-wallet/${invoiceId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(invoiceId),
          }
        )
          .then((response) => {
            if (!response.ok) {
              throw new Error("Bad Request");
            }
            return response.json();
          })
          .then((data) => {
            setIsProcessingPaymentWallet(false);
            closeModalPaymentCoin();
            fetchInvoicesByUser();
            localStorage.removeItem("invoiceId"); // Xóa d liệu đơn hàng trong localStorage
            toast.success("Thanh toán bằng ví thành công", {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
          })
          .catch((error) => {
            setIsProcessingPaymentWallet(false);

            if (error.message === "Bad Request") {
              console.error("số dư không đủ:", error);
              toast.error("Thanh toán thất bại. Vui lòng thử lại sau.", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              });
            } else {
              console.error("Lỗi không xác định:", error);
            }
            localStorage.removeItem("invoiceId"); // Xóa dữ liệu đơn hàng trong localStorage khi gặp lỗi
          });
      } else {
        setIsProcessingPaymentWallet(false);
        toast.error("Thanh toán thất bại. Vui lòng thử lại sau.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        console.error("Không có dữ liệu đơn hàng trong localStorage");
      }
    }, 2000);
  };

  return (
    <div className="history-container">
      <div className="title">
        <h1>Lịch sử đặt nhà hàng</h1>
      </div>
      {loading ? (
        <div className="overlay">
          <Spinner animation="border" />
        </div>
      ) : invoices.length > 0 ? (
        <div className="invoice-list">
          {invoices.map((invoice) => (
            <div className="invoice-item" key={invoice.invoiceID} onClick={() => openModal(invoice)}>
              <div className="invoice-header">
                <div className="invoice-id">Mã hóa đơn: {invoice.invoiceID}</div>
                <div className={`status ${invoice.orderStatus === "Đã hủy đơn hàng" ? "cancelled" : ""}`}>
                  {invoice.orderStatus}
                </div>
              </div>
              
              <div className="invoice-content">
                <div className="info-row">
                  <span className="label">Họ và tên:</span>
                  <span className="value">{invoice.fullName}</span>
                </div>
                <div className="info-row">
                  <span className="label">Số điện thoại:</span>
                  <span className="value">{invoice.phoneNumber}</span>
                </div>
                <div className="info-row">
                  <span className="label">Chi nhánh:</span>
                  <span className="value">{invoice.branch.name}</span>
                </div>
                <div className="info-row">
                  <span className="label">Sảnh cưới:</span>
                  <span className="value">{invoice.hall.name}</span>
                </div>
                <div className="info-row">
                  <span className="label">Thời gian đã đặt:</span>
                  <span className="value">{format(new Date(invoice.invoiceDate), "dd/MM/yyyy")}</span>
                </div>
                <div className="info-row">
                  <span className="label">Ngày tham dự:</span>
                  <span className="value">{format(new Date(invoice.attendanceDate), "dd/MM/yyyy")}</span>
                </div>
                <div className="info-row">
                  <span className="label">Ca:</span>
                  <span className="value">{invoice.timeHall}</span>
                </div>
                <div className="info-row">
                  <span className="label">Tổng tiền:</span>
                  <span className="value price">{formatPrice(invoice.total)}</span>
                </div>
                <div className="info-row">
                  <span className="label">Đã đặt cọc:</span>
                  <span className="value price">{formatPrice(invoice.depositPayment)}</span>
                </div>
              </div>

              <div className="payment-status">
                {invoice.paymentStatus === false ? (
                  <div className="status-badge deposit">
                    {invoice?.paymentWallet ? "Đã đặt cọc bằng ví" : "Đã đặt cọc bằng VNPAY"}
                  </div>
                ) : (
                  <div className="status-badge completed">
                    <i className="checkmark">✓</i>
                    {invoice?.paymentCompleteWallet ? "Đã hoàn tất thanh toán bằng ví" : "Đã hoàn tất thanh toán bằng VNPAY"}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>Không có hóa đơn nào</p>
        </div>
      )}

      {/* Modal */}
      <Modal scrollable size="lg" centered show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết hóa đơn</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedInvoice && (
            <div>
              <h5>Mã hóa đơn: {selectedInvoice.invoiceID}</h5>
              
              <div className="invoice-details">
                <div className="detail-item">
                  <div className="label">Họ và tên</div>
                  <div className="value">{selectedInvoice.fullName}</div>
                </div>
                <div className="detail-item">
                  <div className="label">Số điện thoại</div>
                  <div className="value">{selectedInvoice.phoneNumber}</div>
                </div>
                <div className="detail-item">
                  <div className="label">Chi nhánh</div>
                  <div className="value">{selectedInvoice.branch.name}</div>
                </div>
                <div className="detail-item">
                  <div className="label">Sảnh cưới</div>
                  <div className="value">{selectedInvoice.hall.name}</div>
                </div>
                <div className="detail-item">
                  <div className="label">Thời gian đã đặt</div>
                  <div className="value">
                    {format(new Date(selectedInvoice.invoiceDate), "dd/MM/yyyy")}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="label">Ngày tham dự</div>
                  <div className="value">
                    {format(new Date(selectedInvoice.attendanceDate), "dd/MM/yyyy")}
                  </div>
                </div>
              </div>

              <div className="section-title">Danh sách thực đơn</div>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th style={{ width: "150px" }}>Hình</th>
                    <th style={{ width: "300px" }}>Tên</th>
                    <th>Giá</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.orderMenus.map((orderMenu) => (
                    <tr key={orderMenu.orderMenuId}>
                      <td style={{
                        width: "150px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}>
                        <img
                          style={{
                            borderRadius: "7px",
                            maxWidth: "120px",
                            maxHeight: "120px",
                            objectFit: "cover",
                          }}
                          src={orderMenu.menuEntity.image}
                          alt={orderMenu.menuEntity.name}
                        />
                      </td>
                      <td>{orderMenu.menuEntity.name}</td>
                      <td>
                        <span className="price">
                          {formatPrice(orderMenu.menuEntity.price)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <div className="section-title">Danh sách dịch vụ</div>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th style={{ width: "150px" }}>Hình</th>
                    <th style={{ width: "300px" }}>Tên</th>
                    <th>Giá</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.orderServices.map((orderService) => (
                    <tr key={orderService.orderServiceId}>
                      <td style={{
                        width: "150px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}>
                        <img
                          style={{
                            borderRadius: "7px",
                            maxWidth: "120px",
                            maxHeight: "120px",
                            objectFit: "cover",
                          }}
                          src={orderService.serviceEntity.image}
                          alt={orderService.serviceEntity.name}
                        />
                      </td>
                      <td>{orderService.serviceEntity.name}</td>
                      <td>
                        <span className="price">
                          {formatPrice(orderService.serviceEntity.price)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <div className="total-section">
                <div className="total-row">
                  <span className="label">Tổng tiền thanh toán:</span>
                  <span className="value">{formatPrice(selectedInvoice.total)}</span>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <div className="left-buttons">
            <Button variant="danger" onClick={() => {
              if (selectedInvoice?.orderStatus === "Đã hủy đơn hàng") {
                alert("Đơn hàng đã bị hủy trước đó");
              } else if (window.confirm("Xác nhận hủy đơn hàng?")) {
                cancelInvoice(selectedInvoice?.invoiceID);
              }
            }}>
              Hủy đơn
            </Button>
          </div>
          <div className="right-buttons">
            <Button 
              className="btn btn-success" 
              onClick={() => repaymentInvoice(selectedInvoice?.invoiceID)}
              disabled={selectedInvoice?.paymentStatus === true}
            >
              Thanh toán với VNPAY
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      <Modal
        scrollable
        size="lg"
        centered
        show={showModalPaymentWallet}
        onHide={closeModalPaymentCoin}
      >
        <Modal.Header closeButton>
          <Modal.Title>Thanh toán bằng wallet coin</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ height: "200px" }}>
          {wallet ? (
            <>
              <h2>
                Số coin trong wallet:{" "}
                <b style={{ color: "red" }}>
                  {wallet.coin ? formatPrice(wallet.coin) : "0đ"}
                </b>
              </h2>
              <h2>
                Đơn hàng có giá trị: {formatPrice(selectedInvoice.total / 2)}
              </h2>
              <h2>
                Số coin sau khi thanh toán:
                {wallet.coin >= selectedInvoice.total / 2
                  ? formatPrice(wallet.coin - selectedInvoice.total / 2)
                  : " Không đủ coin"}
              </h2>
            </>
          ) : (
            <h2>
              <b style={{ color: "red" }}>
                Không thể thanh toán do không có wallet
              </b>
            </h2>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button onClick={closeModalPaymentCoin} className="btn btn-secondary">
            Đóng
          </button>
          <Button
            className="btn btn-primary"
            onClick={handlePaymentWalletOrderData}
            disabled={isProcessingPaymentWallet}
          >
            {isProcessingPaymentWallet ? (
              <>
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Đang thanh toán...</span>
                </div>
                <span className="ms-2">Thanh toán...</span>
              </>
            ) : (
              "Xác nhận thanh toán"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default History;
