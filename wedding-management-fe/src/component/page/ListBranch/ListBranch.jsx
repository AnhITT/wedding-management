import React, { useState, useEffect } from "react";
import { Button, Card, Col, Row, Modal, Spinner } from "react-bootstrap";
import "./ListBranch.scss";
import { FaMapMarkerAlt, FaPhone, FaComment, FaStar } from "react-icons/fa";
import Cookies from "js-cookie";
import jwt_decode from "jwt-decode";
import { ToastContainer, toast } from "react-toastify";
import Rating from "react-rating";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faStarHalfAlt } from "@fortawesome/free-solid-svg-icons";
import 'bootstrap-icons/font/bootstrap-icons.css';

const ListBranch = () => {
    const [branches, setBranches] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [feedbackData, setFeedbackData] = useState([]);
    const [userFeedback, setUserFeedback] = useState("");
    const [rating, setRating] = useState(0);
    const [currentModalBranchId, setCurrentModalBranchId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch("https://localhost:7296/api/ApiBranch")
            .then((response) => response.json())
            .then((data) => {
                setBranches(data);
                setLoading(false);
            })
            .catch((error) => {
                setLoading(false);
                console.error("Lỗi khi tải danh sách chi nhánh:", error);
            });
    }, []);

    const openModal = (branchId) => {
        setCurrentModalBranchId(branchId);
        fetchFeedbacksByBranch(branchId);
        setShowModal(true);
    };

    const fetchFeedbacksByBranch = (branchId) => {
        fetch(`https://localhost:7296/api/feedback/${branchId}`)
            .then((response) => response.json())
            .then((data) => {
                setFeedbackData(data);
        console.log("zx: ",  feedbackData);

            })
            .catch((error) => {
                console.error("Lỗi khi tải danh sách phản hồi của chi nhánh:", error);
            });
    };

    const submitFeedback = () => {
        const tokenFromCookie = Cookies.get("token_user");
        const decodedToken = jwt_decode(tokenFromCookie);
        const userId = decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

        const feedbackData = {
            userId: userId,
            content: userFeedback,
            rating: rating,
            branchId: currentModalBranchId,
        };

        fetch("https://localhost:7296/api/feedback", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${tokenFromCookie}`,
            },
            body: JSON.stringify(feedbackData),
        }).then((response) => {
            if (response.ok) {
                toast.success("Đã gửi phản hồi!", {
                    position: "top-right",
                    autoClose: 3000,
                });
                setShowModal(false);
            } else {
                toast.error("Đã xảy ra lỗi khi gửi phản hồi!", {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        });
    };

    return (
        <div className="page-container">
            <div className="header-section">
                <h1>DANH SÁCH CHI NHÁNH</h1>
                {loading && (
                    <div className="loading-overlay">
                        <Spinner animation="border" />
                    </div>
                )}
            </div>

            <div className="branches-grid">
                <Row>
                    {branches.map((branch) => (
                        <Col xs={12} md={4} key={branch.branchId}>
                            <div className="branch-card">
                                <div className="image-wrapper">
                                    <img src={branch.image} alt={branch.name} className="branch-image" />
                                    <div className="overlay"></div>
                                </div>
                                <div className="card-content">
                                    <h3 className="branch-name">{branch.name}</h3>
                                    <div className="branch-info">
                                        <p className="address">
                                            <FaMapMarkerAlt className="icon" />
                                            {branch.address}
                                        </p>
                                        <p className="description">{branch.description}</p>
                                    </div>
                                    <div className="button-group">
                                        <Button 
                                            className="feedback-button"
                                            onClick={() => openModal(branch.branchId)}
                                        >
                                            <FaComment className="icon" />
                                            Phản hồi
                                        </Button>
                                        <Button className="detail-button">
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
                onHide={() => setShowModal(false)} 
                size="lg"
                className="feedback-modal"
            >
                <Modal.Header closeButton className="modal-header">
                    <Modal.Title>Phản Hồi Chi Nhánh</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-body">
                    <div className="feedback-list">
                        {feedbackData.map((feedback) => (
                            <div key={feedback.feedbackId} className="feedback-item">
                                <div className="feedback-header">
                                    <div className="user-info">
                                        <span className="user-name">{`${feedback.user.firstName} ${feedback.user.lastName}`}</span>
                                        <div className="text-warning">
                                            {Array(Math.round(feedback.rating || 0))
                                                .fill()
                                                .map((_, i) => (
                                                    <i key={i} className="bi bi-star-fill me-1"></i>
                                                ))}
                                        </div>
                                    </div>
                                    <span className="feedback-date">
                                        {new Date(feedback.feedbackDate).toLocaleString()}
                                    </span>
                                </div>
                                <div className="feedback-content">
                                    <span className="content-text">{feedback.content}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="feedback-input-section">
                        <h4>Viết phản hồi của bạn</h4>
                        <input
                            type="text"
                            placeholder="Nhập phản hồi của bạn..."
                            value={userFeedback}
                            onChange={(e) => setUserFeedback(e.target.value)}
                            className="feedback-input"
                        />
                        <div className="rating-section">
                            <Rating
                                initialRating={rating}
                                emptySymbol={<FaStar className="star empty" />}
                                fullSymbol={<FaStar className="star full" />}
                                onChange={(value) => setRating(value)}
                            />
                            <Button 
                                className="submit-button"
                                onClick={submitFeedback}
                            >
                                Gửi phản hồi
                            </Button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
            <ToastContainer />
        </div>
    );
};

export default ListBranch;
