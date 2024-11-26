import jwt from "jwt-decode";
import axios from "axios";

const logout = () => {
    // Xóa token và roles
    localStorage.removeItem("token");
    localStorage.removeItem("roles");
    // Xóa header Authorization
    delete axios.defaults.headers.common['Authorization'];
    // Chuyển hướng về trang login
    window.location.href = "/login";
};

const checkRoleUser = () => {
    try {
        const token = localStorage.getItem("token");
        const roles = JSON.parse(localStorage.getItem("roles") || "[]");

        if (!token || !roles.length) {
            return false;
        }

        const decodedToken = jwt(token);
        // Kiểm tra token hết hạn
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp < currentTime) {
            logout(); // Gọi hàm logout nếu token hết hạn
            return false;
        }

        // Kiểm tra xem người dùng có một trong các role được phép không
        const allowedRoles = ["employee", "administrator system", "admin"];
        const hasValidRole = roles.some(role => allowedRoles.includes(role));

        if (!hasValidRole) {
            logout(); // Gọi hàm logout nếu không có quyền
            return false;
        }

        return true;
    } catch (error) {
        console.error("Lỗi khi kiểm tra quyền:", error);
        return false;
    }
};

const getCurrentUser = () => {
    try {
        const token = localStorage.getItem("token");
        if (token) {
            const decodedToken = jwt(token);
            // Kiểm tra token hết hạn
            const currentTime = Date.now() / 1000;
            if (decodedToken.exp < currentTime) {
                logout(); // Gọi hàm logout nếu token hết hạn
                return null;
            }
            return decodedToken;
        }
        return null;
    } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
        return null;
    }
};

const authService = {
    checkRoleUser,
    logout,
    getCurrentUser,
};

export default authService;
