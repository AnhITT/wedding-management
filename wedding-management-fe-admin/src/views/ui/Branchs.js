import React, { useState, useEffect } from "react";
import { Row, Col, Table, Card, CardTitle, CardBody, Button } from "reactstrap";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import ReactPaginate from "react-paginate";
import { branchApi } from "../../api/branch";
import "../../assets/scss/paging.css";

const Branchs = () => {
    const [branches, setBranches] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [confirmationModal, setConfirmationModal] = useState(false);
    const [branchIdToDelete, setBranchIdToDelete] = useState(null);
    const [addBranchModal, setAddBranchModal] = useState(false);
    const [error, setError] = useState([]);
    const [loading, setLoading] = useState(false);
    const [successModal, setSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const [newBranch, setNewBranch] = useState({
        name: "",
        description: "",
        image: "",
        address: "",
        phone: "",
        isLocked: false
    });

    const [editBranch, setEditBranch] = useState({
        branchId: "",
        name: "",
        description: "",
        image: "",
        address: "",
        phone: "",
        isLocked: false
    });
    const [editBranchModal, setEditBranchModal] = useState(false);

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            setLoading(true);
            const data = await branchApi.getAll();
            setBranches(data);
        } catch (error) {
            console.error("Error fetching branches:", error);
            setError(["Lỗi khi tải danh sách chi nhánh"]);
        } finally {
            setLoading(false);
        }
    };

    const itemsPerPage = 5;
    const handlePageClick = (data) => {
        setCurrentPage(data.selected);
    };
    const pageCount = Math.ceil(branches.length / itemsPerPage);
    const offset = currentPage * itemsPerPage;
    const currentItems = branches.slice(offset, offset + itemsPerPage);

    const handleSearch = (event) => {
        const term = event.target.value.toLowerCase();
        setSearchTerm(term);
        const filteredResults = branches.filter(
            (branch) =>
                branch.name.toLowerCase().includes(term) ||
                branch.address.toLowerCase().includes(term)
        );
        setSearchResults(filteredResults);
    };

    const validate = () => {
        const errors = [];
        if (!newBranch.name) errors.push("Tên chi nhánh là bắt buộc");
        if (!newBranch.description) errors.push("Mô tả là bắt buộc");
        if (!newBranch.address) errors.push("Địa chỉ là bắt buộc");
        if (!newBranch.phone) errors.push("Số điện thoại là bắt buộc");

        setError(errors);
        return errors.length === 0;
    };

    const handleAddBranch = async () => {
        if (!validate()) return;

        try {
            setLoading(true);
            await branchApi.create(newBranch);
            setSuccessMessage("Thêm chi nhánh thành công!");
            setSuccessModal(true);
            setAddBranchModal(false);
            fetchBranches();
            setNewBranch({
                name: "",
                description: "",
                image: "",
                address: "",
                phone: "",
                isLocked: false
            });
        } catch (error) {
            setError([error.response?.data?.message || "Lỗi khi thêm chi nhánh"]);
        } finally {
            setLoading(false);
        }
    };

    const handleEditBranch = async (branchId) => {
        try {
            const branch = await branchApi.getById(branchId);
            setEditBranch({
                branchId: branch.branchId,
                name: branch.name,
                description: branch.description,
                image: branch.image,
                address: branch.address,
                phone: branch.phone,
                isLocked: branch.isLocked
            });
            setEditBranchModal(true);
        } catch (error) {
            console.error("Error fetching branch:", error);
        }
    };

    const handleUpdateBranch = async () => {
        try {
            setLoading(true);
            await branchApi.update(editBranch.branchId, editBranch);
            setSuccessMessage("Cập nhật chi nhánh thành công!");
            setSuccessModal(true);
            setEditBranchModal(false);
            fetchBranches();
        } catch (error) {
            setError([error.response?.data?.message || "Lỗi khi cập nhật chi nhánh"]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBranch = async () => {
        try {
            setLoading(true);
            await branchApi.delete(branchIdToDelete);
            setSuccessMessage("Xóa chi nhánh thành công!");
            setSuccessModal(true);
            setConfirmationModal(false);
            fetchBranches();
        } catch (error) {
            setError([error.response?.data?.message || "Lỗi khi xóa chi nhánh"]);
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
                        <CardTitle tag="h5">Quản lý chi nhánh</CardTitle>
                        <div className="d-flex justify-content-between mb-3">
                            <div className="col-4">
                                <input
                                    className="form-control"
                                    placeholder="Tìm kiếm theo tên hoặc địa chỉ"
                                    value={searchTerm}
                                    onChange={handleSearch}
                                />
                            </div>
                            <Button
                                color="primary"
                                onClick={() => setAddBranchModal(true)}
                            >
                                Thêm chi nhánh mới
                            </Button>
                        </div>

                        {loading ? (
                            <div className="text-center">Đang tải...</div>
                        ) : (
                            <Table responsive>
                                <thead>
                                    <tr>
                                        <th>Hình ảnh</th>
                                        <th>Tên chi nhánh</th>
                                        <th>Địa chỉ</th>
                                        <th>Số điện thoại</th>
                                        <th>Trạng thái</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayItems.map((branch) => (
                                        <tr key={branch.branchId}>
                                            <td>
                                                <img 
                                                    src={branch.image} 
                                                    alt={branch.name}
                                                    style={{ width: '100px', height: '60px', objectFit: 'cover' }}
                                                />
                                            </td>
                                            <td>{branch.name}</td>
                                            <td>{branch.address}</td>
                                            <td>{branch.phone}</td>
                                            <td>
                                                <span className={`badge ${branch.isLocked ? 'bg-danger' : 'bg-success'}`}>
                                                    {branch.isLocked ? 'Đã khóa' : 'Đang hoạt động'}
                                                </span>
                                            </td>
                                            <td>
                                                <Button
                                                    color="info"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => handleEditBranch(branch.branchId)}
                                                >
                                                    Sửa
                                                </Button>
                                                <Button
                                                    color="danger"
                                                    size="sm"
                                                    onClick={() => {
                                                        setBranchIdToDelete(branch.branchId);
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

                {/* Add Branch Modal */}
                <Modal isOpen={addBranchModal} toggle={() => setAddBranchModal(false)}>
                    <ModalHeader toggle={() => setAddBranchModal(false)}>
                        Thêm chi nhánh mới
                    </ModalHeader>
                    <ModalBody>
                        <div className="mb-3">
                            <label className="form-label">Tên chi nhánh</label>
                            <input
                                type="text"
                                className="form-control"
                                value={newBranch.name}
                                onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Mô tả</label>
                            <textarea
                                className="form-control"
                                value={newBranch.description}
                                onChange={(e) => setNewBranch({ ...newBranch, description: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">URL Hình ảnh</label>
                            <input
                                type="text"
                                className="form-control"
                                value={newBranch.image}
                                onChange={(e) => setNewBranch({ ...newBranch, image: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Địa chỉ</label>
                            <input
                                type="text"
                                className="form-control"
                                value={newBranch.address}
                                onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Số điện thoại</label>
                            <input
                                type="text"
                                className="form-control"
                                value={newBranch.phone}
                                onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })}
                            />
                        </div>
                        {error.map((err, index) => (
                            <div key={index} className="text-danger">{err}</div>
                        ))}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={handleAddBranch} disabled={loading}>
                            {loading ? "Đang xử lý..." : "Thêm"}
                        </Button>
                        <Button color="secondary" onClick={() => setAddBranchModal(false)}>
                            Hủy
                        </Button>
                    </ModalFooter>
                </Modal>

                {/* Edit Branch Modal */}
                <Modal isOpen={editBranchModal} toggle={() => setEditBranchModal(false)}>
                    <ModalHeader toggle={() => setEditBranchModal(false)}>
                        Chỉnh sửa chi nhánh
                    </ModalHeader>
                    <ModalBody>
                        <div className="mb-3">
                            <label className="form-label">Tên chi nhánh</label>
                            <input
                                type="text"
                                className="form-control"
                                value={editBranch.name}
                                onChange={(e) => setEditBranch({ ...editBranch, name: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Mô tả</label>
                            <textarea
                                className="form-control"
                                value={editBranch.description}
                                onChange={(e) => setEditBranch({ ...editBranch, description: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">URL Hình ảnh</label>
                            <input
                                type="text"
                                className="form-control"
                                value={editBranch.image}
                                onChange={(e) => setEditBranch({ ...editBranch, image: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Địa chỉ</label>
                            <input
                                type="text"
                                className="form-control"
                                value={editBranch.address}
                                onChange={(e) => setEditBranch({ ...editBranch, address: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Số điện thoại</label>
                            <input
                                type="text"
                                className="form-control"
                                value={editBranch.phone}
                                onChange={(e) => setEditBranch({ ...editBranch, phone: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Trạng thái</label>
                            <select
                                className="form-control"
                                value={editBranch.isLocked}
                                onChange={(e) => setEditBranch({ ...editBranch, isLocked: e.target.value === 'true' })}
                            >
                                <option value="false">Đang hoạt động</option>
                                <option value="true">Khóa</option>
                            </select>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={handleUpdateBranch} disabled={loading}>
                            {loading ? "Đang xử lý..." : "Cập nhật"}
                        </Button>
                        <Button color="secondary" onClick={() => setEditBranchModal(false)}>
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
                        Bạn có chắc chắn muốn xóa chi nhánh này?
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" onClick={handleDeleteBranch} disabled={loading}>
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

export default Branchs;
