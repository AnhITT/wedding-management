import "./ListHall.scss";
import { BsCartCheck } from "react-icons/bs";
import React, { useEffect, useState } from "react";
import { Button, Card, Col, Form, Modal, Row, Spinner } from "react-bootstrap";
import Apis, { endpoint } from "../../../config/Apis";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaInfoCircle } from 'react-icons/fa';
import { FaSearch } from 'react-icons/fa'; 

const ListHall = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHalls = async () => {
      try {
        let e = endpoint[`hall`];

        let res = await Apis.get(e);
        setHallData(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    loadHalls();
  }, []);

  const [hallData, setHallData] = useState([]);
  // ======
  const [searchResult, setSearchResult] = useState([]);

  const handleSearch = (e) => {
    e.preventDefault(); // Ngăn chặn sự kiện gửi form mặc định

    // Lấy giá trị từ input tìm kiếm
    const searchKeyword = e.target.kw.value.toLowerCase();

    // Sử dụng hàm filter để tìm kiếm trong danh sách menu
    const searchResults = hallData.filter((item) =>
      item.name.toLowerCase().includes(searchKeyword)
    );

    // Cập nhật trạng thái searchResult với kết quả tìm kiếm
    setSearchResult(searchResults);
  };
  function formatPrice(price) {
    const formattedPrice = price.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
    return formattedPrice;
  }

  const [bookedHalls, setBookedHalls] = useState([]);
  const fetchBookedHalls = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://localhost:7296/api/invoice/booked-hall`
      );
      if (response.ok) {
        const data = await response.json();

        // Sắp xếp danh sách theo BookingDate tăng dần
        data.sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate));

        setBookedHalls(data);
        setLoading(false);
      } else {
        setLoading(false);
        console.error("Lỗi khi lấy danh sách sảnh đã đặt");
      }
    } catch (error) {
      console.error("Lỗi server:", error);
    }
  };

  useEffect(() => {
    fetchBookedHalls();
  }, []);
  const [selectedService, setSelectedService] = useState(null);

  const [showModal, setShowModal] = useState(false);

  // mở modal
  const openModal = () => {
    console.log("Opening modal with:", selectedService);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
  };

  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const filteredHalls = bookedHalls.filter((hall) => {
    if (!selectedDate) {
      return true;
    }
    const bookingDate = new Date(hall.bookingDate);
    return (
      bookingDate.getFullYear() === selectedDate.getFullYear() &&
      bookingDate.getMonth() === selectedDate.getMonth() &&
      bookingDate.getDate() === selectedDate.getDate()
    );
  });

  return (
    <div className="page-container">
      <div className="header-section">
        <h1>DANH SÁCH SẢNH CƯỚI</h1>
        {loading && (
          <div className="loading-overlay">
            <Spinner animation="border" />
          </div>
        )}
        <Form className="search-form" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <Form.Control
              type="text"
              placeholder="Tìm kiếm sảnh cưới..."
              name="kw"
              className="search-input"
            />
            <Button type="submit" className="search-button">
              Tìm Kiếm
            </Button>
          </div>
        </Form>
      </div>

      <div className="halls-section">
        <Row>
          {(searchResult.length > 0 ? searchResult : hallData).map((hallItem) => (
            <Col xs={12} md={4} lg={3} key={hallItem.hallId} className="hall-item">
              <Card className="hall-card">
                <div className="image-wrapper">
                  <Card.Img variant="top" src={hallItem.image} className="hall-image" />
                  <div className="price-badge">
                    {formatPrice(hallItem.price)}
                  </div>
                </div>
                <Card.Body>
                  <Card.Title className="hall-title">{hallItem.name}</Card.Title>
                  <div className="hall-capacity">
                    <i className="fas fa-users"></i>
                    <span>Sức chứa: {hallItem.capacity} khách</span>
                  </div>
                  <div className="button-group">
                    <Button
                      className="book-button"
                      onClick={() => navigate("/bill")}
                    >
                      <BsCartCheck className="icon" style={{ marginRight: '5px' }} /> Đặt Ngay
                    </Button>
                    <Button
                      className="detail-button"
                      onClick={() => {
                        setSelectedService(hallItem);
                        openModal();
                      }}
                    >
                      <FaInfoCircle className="icon" style={{ marginRight: '5px' }} /> Xem Chi Tiết
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <Modal show={showModal} onHide={closeModal} className="detail-modal">
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết sảnh cưới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedService && (
            <div className="modal-content-wrapper">
              <img src={selectedService.image} className="modal-image" alt={selectedService.name} />
              <h3 className="modal-title">{selectedService.name}</h3>
              <div className="modal-info">
                <p className="price">Giá: {formatPrice(selectedService.price)}</p>
                <p className="description">{selectedService.description}</p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      <div className="booked-halls-section">
        <div className="section-header">
          <h2 className="section-title">Danh Sách Sảnh Đã Có Người Đặt</h2>
          <div className="date-picker-wrapper">
            <FaCalendarAlt className="calendar-icon" />
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy"
              className="date-input"
              placeholderText="Chọn ngày"
              isClearable
            />
          </div>
        </div>

        <div className="booked-halls-grid">
          {filteredHalls.map((hall) => (
            <div key={hall.HallId} className="booked-hall-card">
              <div className="card-header">
                <h3>{hall.hallName}</h3>
              </div>
              <div className="card-content">
                <div className="info-item">
                  <FaMapMarkerAlt />
                  <span>{hall.branchName}</span>
                </div>
                <div className="info-item">
                  <FaCalendarAlt />
                  <span>{format(new Date(hall.bookingDate), "dd/MM/yyyy")}</span>
                </div>
                <div className="time-badge">
                  <FaClock />
                  <span>{hall.timeHall}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ListHall;