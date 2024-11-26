import React, { useState, useEffect } from "react";
import { Row, Col, Table, Card, CardTitle, CardBody, Button } from "reactstrap";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import ReactPaginate from "react-paginate";
import { hallApi } from "../../api/hall";
import { branchApi } from "../../api/branch";
import "../../assets/scss/paging.css";

const Halls = () => {
    const [halls, setHalls] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [confirmationModal, setConfirmationModal] = useState(false);
    const [hallIdToDelete, setHallIdToDelete] = useState(null);
    const [addHallModal, setAddHallModal] = useState(false);
    const [error, setError] = useState([]);
    const [loading, setLoading] = useState(false);
    const [successModal, setSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [branches, setBranches] = useState([]);

    const [newHall, setNewHall] = useState({
        name: "",
        description: "",
        image: "",
        branchId: "",
        capacity: 0,
        price: 0
    });

    const [editHall, setEditHall] = useState({
        hallId: "",
        name: "",
        description: "",
        image: "",
        branchId: "",
        capacity: 0,
        price: 0
    });
    const [editHallModal, setEditHallModal] = useState(false);

    useEffect(() => {
        fetchHalls();
        fetchBranches();
    }, []);

    const fetchHalls = async () => {
        try {
            setLoading(true);
            const data = await hallApi.getAll();
            setHalls(data);
        } catch (error) {
            console.error("Error fetching halls:", error);
            setError(["Lỗi khi tải danh sách sảnh"]);
        } finally {
            setLoading(false);
        }
    };

    const fetchBranches = async () => {
        try {
            const data = await branchApi.getAll();
            setBranches(data);
        } catch (error) {
            console.error("Error fetching branches:", error);
        }
    };

    const itemsPerPage = 5;
    const handlePageClick = (data) => {
        setCurrentPage(data.selected);
    };
    const pageCount = Math.ceil(halls.length / itemsPerPage);
    const offset = currentPage * itemsPerPage;
    const currentItems = halls.slice(offset, offset + itemsPerPage);

    const handleSearch = (event) => {
        const term = event.target.value.toLowerCase();
        setSearchTerm(term);
        const filteredResults = halls.filter(
            (hall) =>
                hall.name.toLowerCase().includes(term) ||
                hall.description.toLowerCase().includes(term)
        );
        setSearchResults(filteredResults);
    };

    const validate = () => {
        const errors = [];
        if (!newHall.name) errors.push("Tên sảnh là bắt buộc");
        if (!newHall.description) errors.push("Mô tả là bắt buộc");
        if (!newHall.branchId) errors.push("Chi nhánh là bắt buộc");
        if (newHall.capacity <= 0) errors.push("Sức chứa phải lớn hơn 0");
        if (newHall.price <= 0) errors.push("Giá phải lớn hơn 0");

        setError(errors);
        return errors.length === 0;
    };

    const handleAddHall = async () => {
        if (!validate()) return;

        try {
            setLoading(true);
            await hallApi.create(newHall);
            setSuccessMessage("Thêm sảnh thành công!");
            setSuccessModal(true);
            setAddHallModal(false);
            fetchHalls();
            setNewHall({
                name: "",
                description: "",
                image: "",
                branchId: "",
                capacity: 0,
                price: 0
            });
        } catch (error) {
            setError([error.response?.data?.message || "Lỗi khi thêm sảnh"]);
        } finally {
            setLoading(false);
        }
    };

    const handleEditHall = async (hallId) => {
        try {
            const hall = await hallApi.getById(hallId);
            setEditHall({
                hallId: hall.hallId,
                name: hall.name,
                description: hall.description,
                image: hall.image,
                branchId: hall.branchId,
                capacity: hall.capacity,
                price: hall.price
            });
            setEditHallModal(true);
        } catch (error) {
            console.error("Error fetching hall:", error);
        }
    };

    const handleUpdateHall = async () => {
        try {
            setLoading(true);
            await hallApi.update(editHall.hallId, editHall);
            setSuccessMessage("Cập nhật sảnh thành công!");
            setSuccessModal(true);
            setEditHallModal(false);
            fetchHalls();
        } catch (error) {
            setError([error.response?.data?.message || "Lỗi khi cập nhật sảnh"]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteHall = async () => {
        try {
            setLoading(true);
            await hallApi.delete(hallIdToDelete);
            setSuccessMessage("Xóa sảnh thành công!");
            setSuccessModal(true);
            setConfirmationModal(false);
            fetchHalls();
        } catch (error) {
            setError([error.response?.data?.message || "Lỗi khi xóa sảnh"]);
        } finally {
            setLoading(false);
        }
    };

    const displayItems = searchTerm ? searchResults : currentItems;

    return (
        <Row>
            <Col lg="12">
                <Card>
                    <CardBody>
                        <CardTitle tag="h5">Quản lý sảnh</CardTitle>
                        <div className="d-flex justify-content-between mb-3">
                            <div className="col-4">
                                <input
                                    className="form-control"
                                    placeholder="Tìm kiếm theo tên sảnh"
                                    value={searchTerm}
                                    onChange={handleSearch}
                                />
                            </div>
                            <Button
                                color="primary"
                                onClick={() => setAddHallModal(true)}
                            >
                                Thêm sảnh mới
                            </Button>
                        </div>

                        {loading ? (
                            <div className="text-center">Đang tải...</div>
                        ) : (
                            <Table responsive>
                                <thead>
                                    <tr>
                                        <th>Hình ảnh</th>
                                        <th>Tên sảnh</th>
                                        <th>Chi nhánh</th>
                                        <th>Sức chứa</th>
                                        <th>Giá</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayItems.map((hall) => (
                                        <tr key={hall.hallId}>
                                            <td>
                                                <img 
                                                    src={hall.image} 
                                                    alt={hall.name}
                                                    style={{ width: '100px', height: '60px', objectFit: 'cover' }}
                                                />
                                            </td>
                                            <td>{hall.name}</td>
                                            <td>{hall.branchName}</td>
                                            <td>{hall.capacity} bàn</td>
                                            <td>{hall.price.toLocaleString()} VND</td>
                                            <td>
                                                <Button
                                                    color="info"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => handleEditHall(hall.hallId)}
                                                >
                                                    Sửa
                                                </Button>
                                                <Button
                                                    color="danger"
                                                    size="sm"
                                                    onClick={() => {
                                                        setHallIdToDelete(hall.hallId);
                                                        setConfirmationModal(true);
                                                    }}
                                                >
                                                    Xóa
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
                            containerClassName={"pagination justify-content-center"}
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

                {/* Add Hall Modal */}
                <Modal isOpen={addHallModal} toggle={() => setAddHallModal(false)}>
                    <ModalHeader toggle={() => setAddHallModal(false)}>
                        Thêm sảnh mới
                    </ModalHeader>
                    <ModalBody>
                        <div className="mb-3">
                            <label className="form-label">Tên sảnh</label>
                            <input
                                type="text"
                                className="form-control"
                                value={newHall.name}
                                onChange={(e) => setNewHall({ ...newHall, name: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Mô tả</label>
                            <textarea
                                className="form-control"
                                value={newHall.description}
                                onChange={(e) => setNewHall({ ...newHall, description: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">URL Hình ảnh</label>
                            <input
                                type="text"
                                className="form-control"
                                value={newHall.image}
                                onChange={(e) => setNewHall({ ...newHall, image: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Chi nhánh</label>
                            <select
                                className="form-control"
                                value={newHall.branchId}
                                onChange={(e) => setNewHall({ ...newHall, branchId: parseInt(e.target.value) })}
                            >
                                <option value="">Chọn chi nhánh</option>
                                {branches.map((branch) => (
                                    <option key={branch.branchId} value={branch.branchId}>
                                        {branch.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Sức chứa (số bàn)</label>
                            <input
                                type="number"
                                className="form-control"
                                value={newHall.capacity}
                                onChange={(e) => setNewHall({ ...newHall, capacity: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Giá</label>
                            <input
                                type="number"
                                className="form-control"
                                value={newHall.price}
                                onChange={(e) => setNewHall({ ...newHall, price: parseFloat(e.target.value) })}
                            />
                        </div>
                        {error.map((err, index) => (
                            <div key={index} className="text-danger">{err}</div>
                        ))}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={handleAddHall} disabled={loading}>
                            {loading ? "Đang xử lý..." : "Thêm"}
                        </Button>
                        <Button color="secondary" onClick={() => setAddHallModal(false)}>
                            Hủy
                        </Button>
                    </ModalFooter>
                </Modal>

                {/* Edit Hall Modal */}
                <Modal isOpen={editHallModal} toggle={() => setEditHallModal(false)}>
                    <ModalHeader toggle={() => setEditHallModal(false)}>
                        Chỉnh sửa sảnh
                    </ModalHeader>
                    <ModalBody>
                        <div className="mb-3">
                            <label className="form-label">Tên sảnh</label>
                            <input
                                type="text"
                                className="form-control"
                                value={editHall.name}
                                onChange={(e) => setEditHall({ ...editHall, name: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Mô tả</label>
                            <textarea
                                className="form-control"
                                value={editHall.description}
                                onChange={(e) => setEditHall({ ...editHall, description: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">URL Hình ảnh</label>
                            <input
                                type="text"
                                className="form-control"
                                value={editHall.image}
                                onChange={(e) => setEditHall({ ...editHall, image: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Chi nhánh</label>
                            <select
                                className="form-control"
                                value={editHall.branchId}
                                onChange={(e) => setEditHall({ ...editHall, branchId: parseInt(e.target.value) })}
                            >
                                <option value="">Chọn chi nhánh</option>
                                {branches.map((branch) => (
                                    <option key={branch.branchId} value={branch.branchId}>
                                        {branch.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Sức chứa (số bàn)</label>
                            <input
                                type="number"
                                className="form-control"
                                value={editHall.capacity}
                                onChange={(e) => setEditHall({ ...editHall, capacity: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Giá</label>
                            <input
                                type="number"
                                className="form-control"
                                value={editHall.price}
                                onChange={(e) => setEditHall({ ...editHall, price: parseFloat(e.target.value) })}
                            />
                        </div>
                        {error.map((err, index) => (
                            <div key={index} className="text-danger">{err}</div>
                        ))}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={handleUpdateHall} disabled={loading}>
                            {loading ? "Đang xử lý..." : "Cập nhật"}
                        </Button>
                        <Button color="secondary" onClick={() => setEditHallModal(false)}>
                            Hủy
                        </Button>
                    </ModalFooter>
                </Modal>

                {/* Confirmation Modal */}
                <Modal isOpen={confirmationModal} toggle={() => setConfirmationModal(false)}>
                    <ModalHeader toggle={() => setConfirmationModal(false)}>
                        Xác nhận xóa
                    </ModalHeader>
                    <ModalBody>
                        Bạn có chắc chắn muốn xóa sảnh này?
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" onClick={handleDeleteHall} disabled={loading}>
                            {loading ? "Đang xử lý..." : "Xóa"}
                        </Button>
                        <Button color="secondary" onClick={() => setConfirmationModal(false)}>
                            Hủy
                        </Button>
                    </ModalFooter>
                </Modal>

                {/* Success Modal */}
                <Modal isOpen={successModal} toggle={() => setSuccessModal(false)}>
                    <ModalBody>
                        <div className="text-center text-success">
                            <i className="bi bi-check-circle-fill fs-1"></i>
                            <p className="mt-2">{successMessage}</p>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={() => setSuccessModal(false)}>
                            Đóng
                        </Button>
                    </ModalFooter>
                </Modal>
            </Col>
        </Row>
    );
};

export default Halls;
