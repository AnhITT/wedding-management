import React, { useState, useEffect } from "react";
import { Row, Col, Table, Card, CardTitle, CardBody, Button } from "reactstrap";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import ReactPaginate from "react-paginate";
import { menuApi } from "../../api/menu";
import { menuCategoryApi } from "../../api/menuCategory";
import "../../assets/scss/paging.css";

const Menus = () => {
    const [menus, setMenus] = useState([]);
    const [categories, setCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [confirmationModal, setConfirmationModal] = useState(false);
    const [menuIdToDelete, setMenuIdToDelete] = useState(null);
    const [addMenuModal, setAddMenuModal] = useState(false);
    const [error, setError] = useState([]);
    const [loading, setLoading] = useState(false);
    const [successModal, setSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const [newMenu, setNewMenu] = useState({
        name: "",
        description: "",
        price: 0,
        categoryId: "",
        image: ""
    });

    const [editMenu, setEditMenu] = useState({
        menuId: "",
        name: "",
        description: "",
        price: 0,
        categoryId: "",
        image: ""
    });
    const [editMenuModal, setEditMenuModal] = useState(false);

    useEffect(() => {
        fetchMenus();
        fetchCategories();
    }, []);

    const fetchMenus = async () => {
        try {
            setLoading(true);
            const data = await menuApi.getAll();
            setMenus(data);
        } catch (error) {
            console.error("Error fetching menus:", error);
            setError(["Lỗi khi tải danh sách món ăn"]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await menuApi.getCategories();
            setCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const itemsPerPage = 5;
    const handlePageClick = (data) => {
        setCurrentPage(data.selected);
    };
    const pageCount = Math.ceil(menus.length / itemsPerPage);
    const offset = currentPage * itemsPerPage;
    const currentItems = menus.slice(offset, offset + itemsPerPage);

    const handleSearch = (event) => {
        const term = event.target.value.toLowerCase();
        setSearchTerm(term);
        const filteredResults = menus.filter(
            (menu) =>
                menu.name.toLowerCase().includes(term) ||
                menu.description.toLowerCase().includes(term)
        );
        setSearchResults(filteredResults);
    };

    const validate = () => {
        const errors = [];
        if (!newMenu.name) errors.push("Tên món ăn là bắt buộc");
        if (!newMenu.description) errors.push("Mô tả là bắt buộc");
        if (!newMenu.categoryId) errors.push("Danh mục là bắt buộc");
        if (newMenu.price <= 0) errors.push("Giá phải lớn hơn 0");

        setError(errors);
        return errors.length === 0;
    };

    const handleAddMenu = async () => {
        if (!validate()) return;

        try {
            setLoading(true);
            await menuApi.create(newMenu);
            setSuccessMessage("Thêm món ăn thành công!");
            setSuccessModal(true);
            setAddMenuModal(false);
            fetchMenus();
            setNewMenu({
                name: "",
                description: "",
                price: 0,
                categoryId: "",
                image: ""
            });
        } catch (error) {
            setError([error.response?.data?.message || "Lỗi khi thêm món ăn"]);
        } finally {
            setLoading(false);
        }
    };

    const handleEditMenu = async (menuId) => {
        try {
            const menu = await menuApi.getById(menuId);
            setEditMenu({
                menuId: menu.menuId,
                name: menu.name,
                description: menu.description,
                price: menu.price,
                categoryId: menu.categoryId,
                image: menu.image
            });
            setEditMenuModal(true);
        } catch (error) {
            console.error("Error fetching menu:", error);
        }
    };

    const handleUpdateMenu = async () => {
        try {
            setLoading(true);
            await menuApi.update(editMenu.menuId, editMenu);
            setSuccessMessage("Cập nhật món ăn thành công!");
            setSuccessModal(true);
            setEditMenuModal(false);
            fetchMenus();
        } catch (error) {
            setError([error.response?.data?.message || "Lỗi khi cập nhật món ăn"]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMenu = async () => {
        try {
            setLoading(true);
            await menuApi.delete(menuIdToDelete);
            setSuccessMessage("Xóa món ăn thành công!");
            setSuccessModal(true);
            setConfirmationModal(false);
            fetchMenus();
        } catch (error) {
            setError([error.response?.data?.message || "Lỗi khi xóa món ăn"]);
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
                        <CardTitle tag="h5">Quản lý món ăn</CardTitle>
                        <div className="d-flex justify-content-between mb-3">
                            <div className="col-4">
                                <input
                                    className="form-control"
                                    placeholder="Tìm kiếm theo tên món ăn"
                                    value={searchTerm}
                                    onChange={handleSearch}
                                />
                            </div>
                            <Button
                                color="primary"
                                onClick={() => setAddMenuModal(true)}
                            >
                                Thêm món ăn mới
                            </Button>
                        </div>

                        {loading ? (
                            <div className="text-center">Đang tải...</div>
                        ) : (
                            <Table responsive>
                                <thead>
                                    <tr>
                                        <th>Hình ảnh</th>
                                        <th>Tên món ăn</th>
                                        <th>Danh mục</th>
                                        <th>Giá</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayItems.map((menu) => (
                                        <tr key={menu.menuId}>
                                            <td>
                                                <img 
                                                    src={menu.image} 
                                                    alt={menu.name}
                                                    style={{ width: '100px', height: '60px', objectFit: 'cover' }}
                                                />
                                            </td>
                                            <td>{menu.name}</td>
                                            <td>{menu.categoryName}</td>
                                            <td>{menu.price.toLocaleString()} VND</td>
                                            <td>
                                                <Button
                                                    color="info"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => handleEditMenu(menu.menuId)}
                                                >
                                                    Sửa
                                                </Button>
                                                <Button
                                                    color="danger"
                                                    size="sm"
                                                    onClick={() => {
                                                        setMenuIdToDelete(menu.menuId);
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

                {/* Add Menu Modal */}
                <Modal isOpen={addMenuModal} toggle={() => setAddMenuModal(false)}>
                    <ModalHeader toggle={() => setAddMenuModal(false)}>
                        Thêm món ăn mới
                    </ModalHeader>
                    <ModalBody>
                        <div className="mb-3">
                            <label className="form-label">Tên món ăn</label>
                            <input
                                type="text"
                                className="form-control"
                                value={newMenu.name}
                                onChange={(e) => setNewMenu({ ...newMenu, name: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Mô tả</label>
                            <textarea
                                className="form-control"
                                value={newMenu.description}
                                onChange={(e) => setNewMenu({ ...newMenu, description: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">URL Hình ảnh</label>
                            <input
                                type="text"
                                className="form-control"
                                value={newMenu.image}
                                onChange={(e) => setNewMenu({ ...newMenu, image: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Danh mục</label>
                            <select
                                className="form-control"
                                value={newMenu.categoryId}
                                onChange={(e) => setNewMenu({ ...newMenu, categoryId: parseInt(e.target.value) })}
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
                                value={newMenu.price}
                                onChange={(e) => setNewMenu({ ...newMenu, price: parseFloat(e.target.value) })}
                            />
                        </div>
                        {error.map((err, index) => (
                            <div key={index} className="text-danger">{err}</div>
                        ))}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={handleAddMenu} disabled={loading}>
                            {loading ? "Đang xử lý..." : "Thêm"}
                        </Button>
                        <Button color="secondary" onClick={() => setAddMenuModal(false)}>
                            Hủy
                        </Button>
                    </ModalFooter>
                </Modal>

                {/* Edit Menu Modal */}
                <Modal isOpen={editMenuModal} toggle={() => setEditMenuModal(false)}>
                    <ModalHeader toggle={() => setEditMenuModal(false)}>
                        Chỉnh sửa món ăn
                    </ModalHeader>
                    <ModalBody>
                        <div className="mb-3">
                            <label className="form-label">Tên món ăn</label>
                            <input
                                type="text"
                                className="form-control"
                                value={editMenu.name}
                                onChange={(e) => setEditMenu({ ...editMenu, name: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Mô tả</label>
                            <textarea
                                className="form-control"
                                value={editMenu.description}
                                onChange={(e) => setEditMenu({ ...editMenu, description: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">URL Hình ảnh</label>
                            <input
                                type="text"
                                className="form-control"
                                value={editMenu.image}
                                onChange={(e) => setEditMenu({ ...editMenu, image: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Danh mục</label>
                            <select
                                className="form-control"
                                value={editMenu.categoryId}
                                onChange={(e) => setEditMenu({ ...editMenu, categoryId: parseInt(e.target.value) })}
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
                                value={editMenu.price}
                                onChange={(e) => setEditMenu({ ...editMenu, price: parseFloat(e.target.value) })}
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={handleUpdateMenu} disabled={loading}>
                            {loading ? "Đang xử lý..." : "Cập nhật"}
                        </Button>
                        <Button color="secondary" onClick={() => setEditMenuModal(false)}>
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
                        Bạn có chắc chắn muốn xóa món ăn này?
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" onClick={handleDeleteMenu} disabled={loading}>
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

export default Menus; 