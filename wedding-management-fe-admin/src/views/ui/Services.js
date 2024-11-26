import React, { useState, useEffect } from "react";
import { Row, Col, Table, Card, CardTitle, CardBody, Button } from "reactstrap";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import ReactPaginate from "react-paginate";
import { serviceApi } from "../../api/service";
import { serviceCategoryApi } from "../../api/serviceCategory";
import "../../assets/scss/paging.css";

const Services = () => {
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [confirmationModal, setConfirmationModal] = useState(false);
    const [serviceIdToDelete, setServiceIdToDelete] = useState(null);
    const [addServiceModal, setAddServiceModal] = useState(false);
    const [error, setError] = useState([]);
    const [loading, setLoading] = useState(false);
    const [successModal, setSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const [newService, setNewService] = useState({
        name: "",
        description: "",
        price: 0,
        categoryId: "",
        image: ""
    });

    const [editService, setEditService] = useState({
        serviceId: "",
        name: "",
        description: "",
        price: 0,
        categoryId: "",
        image: ""
    });
    const [editServiceModal, setEditServiceModal] = useState(false);

    useEffect(() => {
        fetchServices();
        fetchCategories();
    }, []);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const data = await serviceApi.getAll();
            setServices(data);
        } catch (error) {
            console.error("Error fetching services:", error);
            setError(["Lỗi khi tải danh sách dịch vụ"]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await serviceCategoryApi.getAll();
            setCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const itemsPerPage = 5;
    const handlePageClick = (data) => {
        setCurrentPage(data.selected);
    };
    const pageCount = Math.ceil(services.length / itemsPerPage);
    const offset = currentPage * itemsPerPage;
    const currentItems = services.slice(offset, offset + itemsPerPage);

    const handleSearch = (event) => {
        const term = event.target.value.toLowerCase();
        setSearchTerm(term);
        const filteredResults = services.filter(
            (service) =>
                service.name.toLowerCase().includes(term) ||
                service.description.toLowerCase().includes(term)
        );
        setSearchResults(filteredResults);
    };

    const validate = () => {
        const errors = [];
        if (!newService.name) errors.push("Tên dịch vụ là bắt buộc");
        if (!newService.description) errors.push("Mô tả là bắt buộc");
        if (!newService.categoryId) errors.push("Danh mục là bắt buộc");
        if (newService.price <= 0) errors.push("Giá phải lớn hơn 0");

        setError(errors);
        return errors.length === 0;
    };

    const handleAddService = async () => {
        if (!validate()) return;

        try {
            setLoading(true);
            await serviceApi.create(newService);
            setSuccessMessage("Thêm dịch vụ thành công!");
            setSuccessModal(true);
            setAddServiceModal(false);
            fetchServices();
            setNewService({
                name: "",
                description: "",
                price: 0,
                categoryId: "",
                image: ""
            });
        } catch (error) {
            setError([error.response?.data?.message || "Lỗi khi thêm dịch vụ"]);
        } finally {
            setLoading(false);
        }
    };

    const handleEditService = async (serviceId) => {
        try {
            const service = await serviceApi.getById(serviceId);
            setEditService({
                serviceId: service.serviceId,
                name: service.name,
                description: service.description,
                price: service.price,
                categoryId: service.categoryId,
                image: service.image
            });
            setEditServiceModal(true);
        } catch (error) {
            console.error("Error fetching service:", error);
        }
    };

    const handleUpdateService = async () => {
        try {
            setLoading(true);
            await serviceApi.update(editService.serviceId, editService);
            setSuccessMessage("Cập nhật dịch vụ thành công!");
            setSuccessModal(true);
            setEditServiceModal(false);
            fetchServices();
        } catch (error) {
            setError([error.response?.data?.message || "Lỗi khi cập nhật dịch vụ"]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteService = async () => {
        try {
            setLoading(true);
            await serviceApi.delete(serviceIdToDelete);
            setSuccessMessage("Xóa dịch vụ thành công!");
            setSuccessModal(true);
            setConfirmationModal(false);
            fetchServices();
        } catch (error) {
            setError([error.response?.data?.message || "Lỗi khi xóa dịch vụ"]);
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
                        <CardTitle tag="h5">Quản lý dịch vụ</CardTitle>
                        <div className="d-flex justify-content-between mb-3">
                            <div className="col-4">
                                <input
                                    className="form-control"
                                    placeholder="Tìm kiếm theo tên dịch vụ"
                                    value={searchTerm}
                                    onChange={handleSearch}
                                />
                            </div>
                            <Button
                                color="primary"
                                onClick={() => setAddServiceModal(true)}
                            >
                                Thêm dịch vụ mới
                            </Button>
                        </div>

                        {loading ? (
                            <div className="text-center">Đang tải...</div>
                        ) : (
                            <Table responsive>
                                <thead>
                                    <tr>
                                        <th>Hình ảnh</th>
                                        <th>Tên dịch vụ</th>
                                        <th>Danh mục</th>
                                        <th>Giá</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayItems.map((service) => (
                                        <tr key={service.serviceId}>
                                            <td>
                                                <img 
                                                    src={service.image} 
                                                    alt={service.name}
                                                    style={{ width: '100px', height: '60px', objectFit: 'cover' }}
                                                />
                                            </td>
                                            <td>{service.name}</td>
                                            <td>{service.categoryName}</td>
                                            <td>{service.price.toLocaleString()} VND</td>
                                            <td>
                                                <Button
                                                    color="info"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => handleEditService(service.serviceId)}
                                                >
                                                    Sửa
                                                </Button>
                                                <Button
                                                    color="danger"
                                                    size="sm"
                                                    onClick={() => {
                                                        setServiceIdToDelete(service.serviceId);
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

                {/* Add Service Modal */}
                <Modal isOpen={addServiceModal} toggle={() => setAddServiceModal(false)}>
                    <ModalHeader toggle={() => setAddServiceModal(false)}>
                        Thêm dịch vụ mới
                    </ModalHeader>
                    <ModalBody>
                        <div className="mb-3">
                            <label className="form-label">Tên dịch vụ</label>
                            <input
                                type="text"
                                className="form-control"
                                value={newService.name}
                                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Mô tả</label>
                            <textarea
                                className="form-control"
                                value={newService.description}
                                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">URL Hình ảnh</label>
                            <input
                                type="text"
                                className="form-control"
                                value={newService.image}
                                onChange={(e) => setNewService({ ...newService, image: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Danh mục</label>
                            <select
                                className="form-control"
                                value={newService.categoryId}
                                onChange={(e) => setNewService({ ...newService, categoryId: parseInt(e.target.value) })}
                            >
                                <option value="">Chọn danh mục</option>
                                {categories.map((category) => (
                                    <option key={category.categoryId} value={category.categoryId}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Giá</label>
                            <input
                                type="number"
                                className="form-control"
                                value={newService.price}
                                onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) })}
                            />
                        </div>
                        {error.map((err, index) => (
                            <div key={index} className="text-danger">{err}</div>
                        ))}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={handleAddService} disabled={loading}>
                            {loading ? "Đang xử lý..." : "Thêm"}
                        </Button>
                        <Button color="secondary" onClick={() => setAddServiceModal(false)}>
                            Hủy
                        </Button>
                    </ModalFooter>
                </Modal>

                {/* Edit Service Modal */}
                <Modal isOpen={editServiceModal} toggle={() => setEditServiceModal(false)}>
                    <ModalHeader toggle={() => setEditServiceModal(false)}>
                        Chỉnh sửa dịch vụ
                    </ModalHeader>
                    <ModalBody>
                        <div className="mb-3">
                            <label className="form-label">Tên dịch vụ</label>
                            <input
                                type="text"
                                className="form-control"
                                value={editService.name}
                                onChange={(e) => setEditService({ ...editService, name: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Mô tả</label>
                            <textarea
                                className="form-control"
                                value={editService.description}
                                onChange={(e) => setEditService({ ...editService, description: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">URL Hình ảnh</label>
                            <input
                                type="text"
                                className="form-control"
                                value={editService.image}
                                onChange={(e) => setEditService({ ...editService, image: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Danh mục</label>
                            <select
                                className="form-control"
                                value={editService.categoryId}
                                onChange={(e) => setEditService({ ...editService, categoryId: parseInt(e.target.value) })}
                            >
                                <option value="">Chọn danh mục</option>
                                {categories.map((category) => (
                                    <option key={category.categoryId} value={category.categoryId}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Giá</label>
                            <input
                                type="number"
                                className="form-control"
                                value={editService.price}
                                onChange={(e) => setEditService({ ...editService, price: parseFloat(e.target.value) })}
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={handleUpdateService} disabled={loading}>
                            {loading ? "Đang xử lý..." : "Cập nhật"}
                        </Button>
                        <Button color="secondary" onClick={() => setEditServiceModal(false)}>
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
                        Bạn có chắc chắn muốn xóa dịch vụ này?
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" onClick={handleDeleteService} disabled={loading}>
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

export default Services; 