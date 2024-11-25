import './ListService.scss';
import { BsCartCheck } from 'react-icons/bs';
import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';
import Apis, { endpoint } from '../../../config/Apis';
import { useNavigate } from 'react-router-dom';
import { FaTag, FaMoneyBillWave, FaInfoCircle } from 'react-icons/fa';

const ListService = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchResult, setSearchResult] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const loadServices = async () => {
            try {
                let e = endpoint[`service`];
                let res = await Apis.get(e);
                setServices(res.data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        loadServices();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        const searchKeyword = e.target.kw.value.toLowerCase();
        const searchResults = services.filter(item =>
            item.name.toLowerCase().includes(searchKeyword)
        );
        setSearchResult(searchResults);
    };

    const formatPrice = (price) => {
        return price.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
        });
    };

    const openModal = () => {
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    return (
        <div className="page-container">
            <div className="header-section">
                <h1>DANH SÁCH DỊCH VỤ</h1>
                {loading && (
                    <div className="loading-overlay">
                        <Spinner animation="border" />
                    </div>
                )}
                <div className="search-section">
                    <Form className="search-form" onSubmit={handleSearch}>
                        <div className="search-input-wrapper">
                            <Form.Control
                                type="text"
                                placeholder="Tìm kiếm dịch vụ..."
                                name="kw"
                                className="search-input"
                            />
                            <Button type="submit" className="search-button">
                                Tìm Kiếm
                            </Button>
                        </div>
                    </Form>
                </div>
            </div>

            <div className="services-grid">
                <Row>
                    {(searchResult.length > 0 ? searchResult : services).map(service => (
                        <Col xs={12} md={4} lg={3} key={service.serviceId} className="service-item">
                            <div className="service-card">
                                <div className="image-wrapper">
                                    <img src={service.image} alt={service.name} className="service-image" />
                                    <div className="price-badge">
                                        <FaMoneyBillWave className="icon" />
                                        {formatPrice(service.price)}
                                    </div>
                                </div>
                                <div className="card-content">
                                    <h3 className="service-name">{service.name}</h3>
                                   
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
                                                setSelectedService(service);
                                                openModal();
                                            }}
                                        >
                                            <FaInfoCircle className="icon" style={{ marginRight: '5px' }} /> Chi Tiết
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
            </div>

            <Modal show={showModal} onHide={closeModal} className="service-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết dịch vụ</Modal.Title>
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
        </div>
    );
};

export default ListService;
