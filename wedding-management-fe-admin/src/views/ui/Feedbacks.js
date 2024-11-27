import React, { useState, useEffect } from "react";
import { Row, Col, Table, Card, CardTitle, CardBody, Button } from "reactstrap";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import ReactPaginate from "react-paginate";
import { feedbackApi } from "../../api/feedback";
import { branchApi } from "../../api/branch";

const Feedbacks = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [branches, setBranches] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedBranch, setSelectedBranch] = useState("");
    const [confirmationModal, setConfirmationModal] = useState(false);
    const [feedbackIdToDelete, setFeedbackIdToDelete] = useState(null);
    const [successModal, setSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        fetchBranches();
    }, []);

    useEffect(() => {
        if (selectedBranch) {
            fetchFeedbacks(selectedBranch);
        }
    }, [selectedBranch]);

    const fetchBranches = async () => {
        try {
            const data = await branchApi.getAll();
            setBranches(data);
            if (data.length > 0) {
                setSelectedBranch(data[0].branchId);
            }
        } catch (error) {
            console.error("Error fetching branches:", error);
            setError("Lỗi khi tải danh sách chi nhánh");
        }
    };

    const fetchFeedbacks = async (branchId) => {
        try {
            setLoading(true);
            const data = await feedbackApi.getByBranch(branchId);
            setFeedbacks(data);
        } catch (error) {
            console.error("Error fetching feedbacks:", error);
            setError("Lỗi khi tải danh sách đánh giá");
        } finally {
            setLoading(false);
        }
    };

    const itemsPerPage = 5;
    const handlePageClick = (data) => {
        setCurrentPage(data.selected);
    };
    const pageCount = Math.ceil(feedbacks.length / itemsPerPage);
    const offset = currentPage * itemsPerPage;
    const currentItems = feedbacks.slice(offset, offset + itemsPerPage);

    const handleSearch = (event) => {
        const term = event.target.value.toLowerCase();
        setSearchTerm(term);
        const filteredResults = feedbacks.filter(
            (feedback) =>
                feedback.content?.toLowerCase().includes(term) ||
                feedback.user?.email?.toLowerCase().includes(term)
        );
        setSearchResults(filteredResults);
    };

    const handleDeleteFeedback = async () => {
        try {
            setLoading(true);
            await feedbackApi.delete(feedbackIdToDelete);
            setSuccessMessage("Ẩn đánh giá thành công!");
            setSuccessModal(true);
            setConfirmationModal(false);
            fetchFeedbacks(selectedBranch);
        } catch (error) {
            setError(error.response?.data?.message || "Lỗi khi ẩn đánh giá");
        } finally {
            setLoading(false);
        }
    };

    const displayItems = searchTerm ? searchResults : currentItems;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString("vi-VN");
    };

    return (
        <Row>
            <Col lg="12">
                <Card>
                    <CardBody>
                        <CardTitle tag="h5">Quản lý đánh giá</CardTitle>
                        <div className="d-flex justify-content-between mb-3">
                            <div className="col-4">
                                <input
                                    className="form-control"
                                    placeholder="Tìm kiếm theo nội dung hoặc email"
                                    value={searchTerm}
                                    onChange={handleSearch}
                                />
                            </div>
                            <div className="col-4">
                                <select
                                    className="form-control"
                                    value={selectedBranch}
                                    onChange={(e) =>
                                        setSelectedBranch(e.target.value)
                                    }
                                >
                                    {branches.map((branch) => (
                                        <option
                                            key={branch.branchId}
                                            value={branch.branchId}
                                        >
                                            {branch.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center">Đang tải...</div>
                        ) : (
                            <Table responsive>
                                <thead>
                                    <tr>
                                        <th>Người đánh giá</th>
                                        <th>Thời gian</th>
                                        <th>Nội dung</th>
                                        <th>Đánh giá</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayItems.map((feedback) => (
                                        <tr key={feedback.feedbackId}>
                                            <td>{feedback.user?.email}</td>
                                            <td>
                                                {formatDate(
                                                    feedback.feedbackDate
                                                )}
                                            </td>
                                            <td>{feedback.content}</td>
                                            <td>
                                                <div className="text-warning">
                                                    {Array(
                                                        Math.round(
                                                            feedback.rating || 0
                                                        )
                                                    )
                                                        .fill()
                                                        .map((_, i) => (
                                                            <i
                                                                key={i}
                                                                className="bi bi-star-fill me-1"
                                                            ></i>
                                                        ))}
                                                </div>
                                            </td>
                                            <td>
                                                <Button
                                                    color="danger"
                                                    size="sm"
                                                    onClick={() => {
                                                        setFeedbackIdToDelete(
                                                            feedback.feedbackId
                                                        );
                                                        setConfirmationModal(
                                                            true
                                                        );
                                                    }}
                                                >
                                                    Ẩn
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}

                        <ReactPaginate
                            previousLabel={"Trước"}
                            nextLabel={"Sau"}
                            breakLabel={"..."}
                            pageCount={pageCount}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={5}
                            onPageChange={handlePageClick}
                            containerClassName={
                                "pagination justify-content-center"
                            }
                            pageClassName={"page-item"}
                            pageLinkClassName={"page-link"}
                            previousClassName={"page-item"}
                            previousLinkClassName={"page-link"}
                            nextClassName={"page-item"}
                            nextLinkClassName={"page-link"}
                            breakClassName={"page-item"}
                            breakLinkClassName={"page-link"}
                            activeClassName={"active"}
                        />
                    </CardBody>
                </Card>

                {/* Confirmation Modal */}
                <Modal
                    isOpen={confirmationModal}
                    toggle={() => setConfirmationModal(false)}
                >
                    <ModalHeader toggle={() => setConfirmationModal(false)}>
                        Xác nhận ẩn
                    </ModalHeader>
                    <ModalBody>
                        Bạn có chắc chắn muốn ẩn đánh giá này?
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            color="danger"
                            onClick={handleDeleteFeedback}
                            disabled={loading}
                        >
                            {loading ? "Đang xử lý..." : "Ẩn"}
                        </Button>
                        <Button
                            color="secondary"
                            onClick={() => setConfirmationModal(false)}
                        >
                            Hủy
                        </Button>
                    </ModalFooter>
                </Modal>

                {/* Success Modal */}
                <Modal
                    isOpen={successModal}
                    toggle={() => setSuccessModal(false)}
                >
                    <ModalBody>
                        <div className="text-center text-success">
                            <i className="bi bi-check-circle-fill fs-1"></i>
                            <p className="mt-2">{successMessage}</p>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            color="primary"
                            onClick={() => setSuccessModal(false)}
                        >
                            Đóng
                        </Button>
                    </ModalFooter>
                </Modal>
            </Col>
        </Row>
    );
};

export default Feedbacks;
