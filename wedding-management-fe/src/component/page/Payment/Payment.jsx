import React, { useEffect, useState } from "react";
import "./Payment.scss";
import { Spinner } from "react-bootstrap";
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const Payment = () => {
  const [orderSent, setOrderSent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!orderSent) {
      const storedInvoiceId = localStorage.getItem("invoiceId");
      if (storedInvoiceId != null) {
        paymentCompelete();
      } else {
        sendOrderData();
      }
    }
  }, [orderSent]);

  const paymentCompelete = () => {
    const storedInvoiceId = localStorage.getItem("invoiceId");

    if (storedInvoiceId) {
      const invoiceId = JSON.parse(storedInvoiceId);

      fetch(
        `https://localhost:7296/api/invoice/repayment-compelete/${invoiceId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(invoiceId),
        }
      )
        .then((response) => response.json())
        .then((data) => {
          console.log("Đã gửi đơn hàng thành công:", data);
          setOrderSent(true);
          setLoading(false);
          localStorage.removeItem("invoiceId");
        })
        .catch((error) => {
          console.error("Lỗi khi gửi đơn hàng:", error);
          setLoading(false);
          setError(true);
          localStorage.removeItem("invoiceId");
        });
    } else {
      console.error("Không có dữ liệu đơn hàng trong localStorage");
      setLoading(false);
      setError(true);
    }
  };

  const sendOrderData = () => {
    const storedOrderData = localStorage.getItem("orderData");
    if (storedOrderData) {
      const orderData = JSON.parse(storedOrderData);

      fetch("https://localhost:7296/api/invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Đã gửi đơn hàng thành công:", data);
          setOrderSent(true);
          setLoading(false);
          localStorage.removeItem("orderData");
        })
        .catch((error) => {
          console.error("Lỗi khi gửi đơn hàng:", error);
          setLoading(false);
          setError(true);
          localStorage.removeItem("orderData");
        });
    } else {
      console.error("Không có dữ liệu đơn hàng trong localStorage");
      setLoading(false);
      setError(true);
    }
  };

  return (
    <div className="payment-container">
      <div className="payment-card">
        {loading ? (
          <div className="loading-state">
            <Spinner animation="border" variant="primary" />
            <h3>Đang xử lý thanh toán</h3>
            <p>Vui lòng đợi trong giây lát...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <div className="status-icon error">
              <FaTimesCircle />
            </div>
            <h2>Thanh toán thất bại</h2>
            <p>Đã xảy ra lỗi trong quá trình xử lý. Vui lòng thử lại sau.</p>
            <button className="retry-button" onClick={() => window.location.href = '/bill'}>
              Thử lại
            </button>
          </div>
        ) : (
          <div className="success-state">
            <div className="status-icon success">
              <FaCheckCircle />
            </div>
            <h2>Thanh toán thành công</h2>
            <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
            <div className="success-actions">
              <button className="home-button" onClick={() => window.location.href = '/'}>
                Về trang chủ
              </button>
              <button className="new-order-button" onClick={() => window.location.href = '/bill'}>
                Đặt đơn mới
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;
