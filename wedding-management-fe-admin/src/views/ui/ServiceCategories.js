import React, { useState, useEffect } from "react";
import { Row, Col, Table, Card, CardTitle, CardBody, Button } from "reactstrap";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import ReactPaginate from "react-paginate";
import { serviceCategoryApi } from "../../api/serviceCategory";

const ServiceCategories = () => {
    const [categories, setCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [confirmationModal, setConfirmationModal] = useState(false);
    const [categoryIdToDelete, setCategoryIdToDelete] = useState(null);
    const [addCategoryModal, setAddCategoryModal] = useState(false);
    const [error, setError] = useState([]);
    const [loading, setLoading] = useState(false);
    const [successModal, setSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const [newCategory, setNewCategory] = useState({
        name: "",
        description: "",
    });

    const [editCategory, setEditCategory] = useState({
        id: "",
        name: "",
        description: "",
    });
    const [editCategoryModal, setEditCategoryModal] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await serviceCategoryApi.getAll();
            setCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
            setError(["Lỗi khi tải danh sách danh mục"]);
        } finally {
            setLoading(false);
        }
    };

    const itemsPerPage = 5;
    const handlePageClick = (data) => {
        setCurrentPage(data.selected);
    };
    const pageCount = Math.ceil(categories.length / itemsPerPage);
    const offset = currentPage * itemsPerPage;
    const currentItems = categories.slice(offset, offset + itemsPerPage);

    const handleSearch = (event) => {
        const term = event.target.value.toLowerCase();
        setSearchTerm(term);
        const filteredResults = categories.filter(
            (category) =>
                category.name.toLowerCase().includes(term) ||
                category.description.toLowerCase().includes(term)
        );
        setSearchResults(filteredResults);
    };

    const validate = () => {
        const errors = [];
        if (!newCategory.name) errors.push("Tên danh mục là bắt buộc");
        if (!newCategory.description) errors.push("Mô tả là bắt buộc");

        setError(errors);
        return errors.length === 0;
    };

    const handleAddCategory = async () => {
        if (!validate()) return;

        try {
            setLoading(true);
            await serviceCategoryApi.create(newCategory);
            setSuccessMessage("Thêm danh mục thành công!");
            setSuccessModal(true);
            setAddCategoryModal(false);
            fetchCategories();
            setNewCategory({
                name: "",
                description: "",
            });
        } catch (error) {
            setError([
                error.response?.data?.message || "Lỗi khi thêm danh mục",
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleEditCategory = async (categoryId) => {
        try {
            const category = await serviceCategoryApi.getById(categoryId);
            setEditCategory({
                id: category.categoryId,
                name: category.name,
                description: category.description,
            });
            setEditCategoryModal(true);
        } catch (error) {
            console.error("Error fetching category:", error);
        }
    };

    const handleUpdateCategory = async () => {
        try {
            setLoading(true);
            await serviceCategoryApi.update(editCategory.id, {
                categoryId: editCategory.id,
                name: editCategory.name,
                description: editCategory.description,
            });
            setSuccessMessage("Cập nhật danh mục thành công!");
            setSuccessModal(true);
            setEditCategoryModal(false);
            fetchCategories();
        } catch (error) {
            setError([
                error.response?.data?.message || "Lỗi khi cập nhật danh mục",
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCategory = async () => {
        try {
            setLoading(true);
            await serviceCategoryApi.delete(categoryIdToDelete);
            setSuccessMessage("Xóa danh mục thành công!");
            setSuccessModal(true);
            setConfirmationModal(false);
            fetchCategories();
        } catch (error) {
            setError([error.response?.data?.message || "Lỗi khi xóa danh mục"]);
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
                        <CardTitle tag="h5">Quản lý danh mục dịch vụ</CardTitle>
                        <div className="d-flex justify-content-between mb-3">
                            <div className="col-4">
                                <input
                                    className="form-control"
                                    placeholder="Tìm kiếm theo tên danh mục"
                                    value={searchTerm}
                                    onChange={handleSearch}
                                />
                            </div>
                            <Button
                                color="primary"
                                onClick={() => setAddCategoryModal(true)}
                            >
                                Thêm danh mục mới
                            </Button>
                        </div>

                        {loading ? (
                            <div className="text-center">Đang tải...</div>
                        ) : (
                            <Table responsive>
                                <thead>
                                    <tr>
                                        <th>Tên danh mục</th>
                                        <th>Mô tả</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayItems.map((category) => (
                                        <tr key={category.categoryId}>
                                            <td>{category.name}</td>
                                            <td>{category.description}</td>
                                            <td>
                                                <Button
                                                    color="info"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() =>
                                                        handleEditCategory(
                                                            category.categoryId
                                                        )
                                                    }
                                                >
                                                    Sửa
                                                </Button>
                                                <Button
                                                    color="danger"
                                                    size="sm"
                                                    onClick={() => {
                                                        setCategoryIdToDelete(
                                                            category.categoryId
                                                        );
                                                        setConfirmationModal(
                                                            true
                                                        );
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

                {/* Add Category Modal */}
                <Modal
                    isOpen={addCategoryModal}
                    toggle={() => setAddCategoryModal(false)}
                >
                    <ModalHeader toggle={() => setAddCategoryModal(false)}>
                        Thêm danh mục mới
                    </ModalHeader>
                    <ModalBody>
                        <div className="mb-3">
                            <label className="form-label">Tên danh mục</label>
                            <input
                                type="text"
                                className="form-control"
                                value={newCategory.name}
                                onChange={(e) =>
                                    setNewCategory({
                                        ...newCategory,
                                        name: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Mô tả</label>
                            <textarea
                                className="form-control"
                                value={newCategory.description}
                                onChange={(e) =>
                                    setNewCategory({
                                        ...newCategory,
                                        description: e.target.value,
                                    })
                                }
                            />
                        </div>
                        {error.map((err, index) => (
                            <div key={index} className="text-danger">
                                {err}
                            </div>
                        ))}
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            color="primary"
                            onClick={handleAddCategory}
                            disabled={loading}
                        >
                            {loading ? "Đang xử lý..." : "Thêm"}
                        </Button>
                        <Button
                            color="secondary"
                            onClick={() => setAddCategoryModal(false)}
                        >
                            Hủy
                        </Button>
                    </ModalFooter>
                </Modal>

                {/* Edit Category Modal */}
                <Modal
                    isOpen={editCategoryModal}
                    toggle={() => setEditCategoryModal(false)}
                >
                    <ModalHeader toggle={() => setEditCategoryModal(false)}>
                        Chỉnh sửa danh mục
                    </ModalHeader>
                    <ModalBody>
                        <div className="mb-3">
                            <label className="form-label">Tên danh mục</label>
                            <input
                                type="text"
                                className="form-control"
                                value={editCategory.name}
                                onChange={(e) =>
                                    setEditCategory({
                                        ...editCategory,
                                        name: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Mô tả</label>
                            <textarea
                                className="form-control"
                                value={editCategory.description}
                                onChange={(e) =>
                                    setEditCategory({
                                        ...editCategory,
                                        description: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            color="primary"
                            onClick={handleUpdateCategory}
                            disabled={loading}
                        >
                            {loading ? "Đang xử lý..." : "Cập nhật"}
                        </Button>
                        <Button
                            color="secondary"
                            onClick={() => setEditCategoryModal(false)}
                        >
                            Hủy
                        </Button>
                    </ModalFooter>
                </Modal>

                {/* Confirmation Modal */}
                <Modal
                    isOpen={confirmationModal}
                    toggle={() => setConfirmationModal(false)}
                >
                    <ModalHeader toggle={() => setConfirmationModal(false)}>
                        Xác nhận xóa
                    </ModalHeader>
                    <ModalBody>
                        Bạn có chắc chắn muốn xóa danh mục này?
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            color="danger"
                            onClick={handleDeleteCategory}
                            disabled={loading}
                        >
                            {loading ? "Đang xử lý..." : "Xóa"}
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

export default ServiceCategories;
