import { Card, CardBody, CardTitle, Button, Table } from "reactstrap";
import React, { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import "../../assets/scss/paging.css";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { accountApi } from "../../api/account";

const AccountManage = () => {
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [confirmationModal, setConfirmationModal] = useState(false);
    const [userIdToDelete, setUserIdToDelete] = useState(null);
    const [addUserModal, setAddUserModal] = useState(false);
    const [error, setError] = useState([]);
    const [loading, setLoading] = useState(false);
    const [successModal, setSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const [newUser, setNewUser] = useState({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        roles: []
    });

    const [editUser, setEditUser] = useState({
        id: "",
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        roles: []
    });
    const [editUserModal, setEditUserModal] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await accountApi.getAll();
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
            setError(["Lỗi khi tải danh sách người dùng"]);
        } finally {
            setLoading(false);
        }
    };

    const itemsPerPage = 5;
    const handlePageClick = (data) => {
        setCurrentPage(data.selected);
    };
    const pageCount = Math.ceil(users.length / itemsPerPage);
    const offset = currentPage * itemsPerPage;
    const currentItems = users.slice(offset, offset + itemsPerPage);

    const handleSearch = (event) => {
        const term = event.target.value.toLowerCase();
        setSearchTerm(term);
        const filteredResults = users.filter(
            (user) =>
                user.email.toLowerCase().includes(term) ||
                `${user.firstName} ${user.lastName}`.toLowerCase().includes(term)
        );
        setSearchResults(filteredResults);
    };

    const validate = () => {
        const errors = [];
        if (!newUser.email) {
            errors.push("Email là bắt buộc");
        } else if (!isValidEmail(newUser.email)) {
            errors.push("Email không hợp lệ");
        }

        if (!newUser.password) {
            errors.push("Mật khẩu là bắt buộc");
        } else if (!isValidPassword(newUser.password)) {
            errors.push("Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt");
        }

        if (!newUser.firstName) errors.push("Họ là bắt buộc");
        if (!newUser.lastName) errors.push("Tên là bắt buộc");
        if (!newUser.phoneNumber) errors.push("Số điện thoại là bắt buộc");

        setError(errors);
        return errors.length === 0;
    };

    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const isValidPassword = (password) => {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(password);
    };

    const handleAddUser = async () => {
        if (!validate()) return;

        try {
            setLoading(true);
            await accountApi.create(newUser);
            setSuccessMessage("Thêm người dùng thành công!");
            setSuccessModal(true);
            setAddUserModal(false);
            fetchUsers();
            setNewUser({
                email: "",
                password: "",
                firstName: "",
                lastName: "",
                phoneNumber: "",
                roles: []
            });
        } catch (error) {
            setError([error.response?.data?.message || "Lỗi khi thêm người dùng"]);
        } finally {
            setLoading(false);
        }
    };

    const handleEditUser = async (userId) => {
        try {
            const user = await accountApi.getById(userId);
            setEditUser({
                id: userId,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                roles: user.roles
            });
            setEditUserModal(true);
        } catch (error) {
            console.error("Error fetching user:", error);
        }
    };

    const handleUpdateUser = async () => {
        try {
            setLoading(true);
            await accountApi.update(editUser.id, editUser);
            setSuccessMessage("Cập nhật thông tin thành công!");
            setSuccessModal(true);
            setEditUserModal(false);
            fetchUsers();
        } catch (error) {
            setError([error.response?.data?.message || "Lỗi khi cập nhật thông tin"]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        try {
            setLoading(true);
            await accountApi.delete(userIdToDelete);
            setSuccessMessage("Xóa người dùng thành công!");
            setSuccessModal(true);
            setConfirmationModal(false);
            fetchUsers();
        } catch (error) {
            setError([error.response?.data?.message || "Lỗi khi xóa người dùng"]);
        } finally {
            setLoading(false);
        }
    };

    const displayItems = searchTerm ? searchResults : currentItems;

    const getRoleBadgeColor = (role) => {
        switch (role.toLowerCase()) {
            case 'admin':
                return 'danger';
            case 'employee':
                return 'success';
            case 'administrator system':
                return 'primary';
            default:
                return 'secondary';
        }
    };

    const formatRoleName = (role) => {
        switch (role.toLowerCase()) {
            case 'admin':
                return 'Quản trị viên';
            case 'employee':
                return 'Nhân viên';
            case 'administrator system':
                return 'Quản trị hệ thống';
            default:
                return role;
        }
    };

    return (
        <div>
            <Card>
                <CardBody>
                    <CardTitle tag="h5">Quản lý tài khoản</CardTitle>
                    <div className="d-flex justify-content-between mb-3">
                        <div className="col-4">
                            <input
                                className="form-control"
                                placeholder="Tìm kiếm theo email hoặc tên"
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>
                        <Button
                            color="primary"
                            onClick={() => setAddUserModal(true)}
                        >
                            Thêm người dùng
                        </Button>
                    </div>

                    {loading ? (
                        <div className="text-center">Đang tải...</div>
                    ) : (
                        <Table responsive>
                            <thead>
                                <tr>
                                    <th>Email</th>
                                    <th>Họ và tên</th>
                                    <th>Số điện thoại</th>
                                    <th>Vai trò</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayItems.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.email}</td>
                                        <td>{`${user.firstName} ${user.lastName}`}</td>
                                        <td>{user.phoneNumber}</td>
                                        <td>
                                            {user.roles?.map((role, index) => (
                                                <span 
                                                    key={index} 
                                                    className={`badge bg-${getRoleBadgeColor(role)} me-1`}
                                                >
                                                    {formatRoleName(role)}
                                                </span>
                                            ))}
                                        </td>
                                        <td>
                                            <Button
                                                color="info"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => handleEditUser(user.id)}
                                            >
                                                Sửa
                                            </Button>
                                            <Button
                                                color="danger"
                                                size="sm"
                                                onClick={() => {
                                                    setUserIdToDelete(user.id);
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

            {/* Add User Modal */}
            <Modal isOpen={addUserModal} toggle={() => setAddUserModal(false)}>
                <ModalHeader toggle={() => setAddUserModal(false)}>
                    Thêm người dùng mới
                </ModalHeader>
                <ModalBody>
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Mật khẩu</label>
                        <input
                            type="password"
                            className="form-control"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Họ</label>
                        <input
                            type="text"
                            className="form-control"
                            value={newUser.firstName}
                            onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Tên</label>
                        <input
                            type="text"
                            className="form-control"
                            value={newUser.lastName}
                            onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Số điện thoại</label>
                        <input
                            type="text"
                            className="form-control"
                            value={newUser.phoneNumber}
                            onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Vai trò</label>
                        <select
                            className="form-control"
                            multiple
                            value={newUser.roles}
                            onChange={(e) => {
                                const selectedRoles = Array.from(e.target.selectedOptions, option => option.value);
                                setNewUser({ ...newUser, roles: selectedRoles });
                            }}
                        >
                            <option value="admin">Quản trị viên</option>
                            <option value="employee">Nhân viên</option>
                            <option value="administrator system">Quản trị hệ thống</option>
                        </select>
                    </div>
                    {error.map((err, index) => (
                        <div key={index} className="text-danger">{err}</div>
                    ))}
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={handleAddUser} disabled={loading}>
                        {loading ? "Đang xử lý..." : "Thêm"}
                    </Button>
                    <Button color="secondary" onClick={() => setAddUserModal(false)}>
                        Hủy
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Edit User Modal */}
            <Modal isOpen={editUserModal} toggle={() => setEditUserModal(false)}>
                <ModalHeader toggle={() => setEditUserModal(false)}>
                    Chỉnh sửa thông tin người dùng
                </ModalHeader>
                <ModalBody>
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            value={editUser.email}
                            onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Họ</label>
                        <input
                            type="text"
                            className="form-control"
                            value={editUser.firstName}
                            onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Tên</label>
                        <input
                            type="text"
                            className="form-control"
                            value={editUser.lastName}
                            onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Số điện thoại</label>
                        <input
                            type="text"
                            className="form-control"
                            value={editUser.phoneNumber}
                            onChange={(e) => setEditUser({ ...editUser, phoneNumber: e.target.value })}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Vai trò</label>
                        <select
                            className="form-control"
                            multiple
                            value={editUser.roles}
                            onChange={(e) => {
                                const selectedRoles = Array.from(e.target.selectedOptions, option => option.value);
                                setEditUser({ ...editUser, roles: selectedRoles });
                            }}
                        >
                            <option value="admin">Quản trị viên</option>
                            <option value="employee">Nhân viên</option>
                            <option value="administrator system">Quản trị hệ thống</option>
                        </select>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={handleUpdateUser} disabled={loading}>
                        {loading ? "Đang xử lý..." : "Cập nhật"}
                    </Button>
                    <Button color="secondary" onClick={() => setEditUserModal(false)}>
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
                    Bạn có chắc chắn muốn xóa người dùng này?
                </ModalBody>
                <ModalFooter>
                    <Button color="danger" onClick={handleDeleteUser} disabled={loading}>
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
        </div>
    );
};

export default AccountManage;
