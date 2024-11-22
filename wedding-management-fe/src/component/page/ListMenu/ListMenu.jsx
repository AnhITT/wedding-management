import './ListMenu.scss';
import { BsCartCheck } from 'react-icons/bs';
import { MdDescription, MdFoodBank } from "react-icons/md";
import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Modal, Spinner, Row } from 'react-bootstrap';
import Apis, { endpoint } from '../../../config/Apis';
import { Link } from 'react-router-dom';

const ListMenu = () => {
    const [loading, setLoading] = useState(true);
    const [menus, setMenus] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchResult, setSearchResult] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const loadMenus = async () => {
            try {
                setLoading(true);
                const menuEndpoint = endpoint[`menu`];
                const categoryEndpoint = endpoint[`category`];
                let menuRes = await Apis.get(menuEndpoint);
                let categoryRes = await Apis.get(categoryEndpoint);
                setMenus(menuRes.data);
                setCategories(categoryRes.data);
                setLoading(false);
            } catch (error) {
                setLoading(false);
                console.error(error);
            }
        };
        loadMenus();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        const searchKeyword = e.target.kw.value.toLowerCase();
        const searchResults = menus.filter(item =>
            item.name.toLowerCase().includes(searchKeyword)
        );
        setSearchResult(searchResults);
    };

    const handleCategoryChange = async (e) => {
        const categoryId = e.target.value;
        setSelectedCategory(categoryId);
        if (categoryId) {
            setLoading(true);
            try {
                let res = await Apis.get(`${endpoint[`menu`]}/byCategory/${categoryId}`);
                setMenus(res.data);
                setLoading(false);
            } catch (error) {
                setLoading(false);
                console.error(error);
            }
        } else {
            // Reload all menus if no category is selected
            const res = await Apis.get(endpoint[`menu`]);
            setMenus(res.data);
        }
    };

    function formatPrice(price) {
        const formattedPrice = price.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND"
        });
        return formattedPrice;
    }

    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);

    return (
        <div className="page-container">
            <div className="header-section">
                <h1 >DANH SÁCH THỰC ĐƠN</h1>
                {loading && (
                    <div className="loading-overlay">
                        <Spinner animation="border" />
                    </div>
                )}
                
                <div className="search-filters">
                    <Form className="search-form" onSubmit={handleSearch}>
                        <div className="search-input-wrapper">
                            <Form.Control
                                type="text"
                                placeholder="Tìm kiếm món ăn..."
                                name="kw"
                                className="search-input"
                            />
                            <Button type="submit" className="search-button">
                                Tìm Kiếm
                            </Button>
                        </div>
                    </Form>
                    
                    <Form.Select 
                        className="category-select" 
                        onChange={handleCategoryChange}
                    >
                        <option value="">Tất cả món ăn</option>
                        {categories.map(category => (
                            <option key={category.categoryId} value={category.categoryId}>
                                {category.name}
                            </option>
                        ))}
                    </Form.Select>
                </div>
            </div>

            <div className="menu-grid">
                <Row>
                    {(searchResult.length > 0 ? searchResult : menus).map(menuItem => (
                        <Col xs={12} md={3} className="menu-item" key={menuItem.menuId}>
                            <div className="menu-card">
                                <div className="image-wrapper">
                                    <img src={menuItem.image} alt={menuItem.name} className="menu-image" />
                                    <div className="price-badge">
                                        {formatPrice(menuItem.price)}
                                    </div>
                                </div>
                                <div className="card-content">
                                    <h3 className="menu-name">{menuItem.name}</h3>
                                    <div className="menu-info">
                                        <p className="category">
                                            <MdFoodBank className="icon" />
                                            {menuItem.categoryName}
                                        </p>
                                    </div>
                                    <div className="button-group">
                                        <Button
                                            className="detail-button"
                                            onClick={() => {
                                                setSelectedService(menuItem);
                                                openModal();
                                            }}
                                        >
                                            <MdDescription className="icon" />
                                            Chi Tiết
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
            </div>

            <Modal 
                show={showModal} 
                onHide={closeModal} 
                className="menu-detail-modal"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết món ăn</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedService && (
                        <div className="modal-content-wrapper">
                            <img 
                                src={selectedService.image} 
                                className="modal-image" 
                                alt={selectedService.name} 
                            />
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

export default ListMenu;
