import { useState } from "react";
import "./Register.scss";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaPhone } from 'react-icons/fa';

const Register = () => {
    const nav = useNavigate();

    const initFormValue = {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
    };

    const [formValue, setformValue] = useState(initFormValue);
    const [formError, setformError] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setformValue({ ...formValue, [name]: value });
    };

    const validateForm = () => {
        const error = {};

        if (isEmptyValue(formValue.firstName)) {
            error["firstName"] = "Vui lòng nhập họ";
        }

        if (isEmptyValue(formValue.lastName)) {
            error["lastName"] = "Vui lòng nhập tên";
        }

        if (isEmptyValue(formValue.email)) {
            error["email"] = "Vui lòng nhập email";
        } else if (!isEmailValid(formValue.email)) {
            error["email"] = "Email không hợp lệ";
        }

        if (isEmptyValue(formValue.password)) {
            error["password"] = "Vui lòng nhập mật khẩu";
        } else if (!isStrongPassword(formValue.password)) {
            error["password"] = 
                "Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt";
        }

        if (isEmptyValue(formValue.confirmPassword)) {
            error["confirmPassword"] = "Vui lòng xác nhận mật khẩu";
        } else if (formValue.confirmPassword !== formValue.password) {
            error["confirmPassword"] = "Mật khẩu xác nhận không khớp";
        }

        if (isEmptyValue(formValue.phoneNumber)) {
            error["phoneNumber"] = "Vui lòng nhập số điện thoại";
        } else if (!isPhoneValid(formValue.phoneNumber)) {
            error["phoneNumber"] = "Số điện thoại không hợp lệ";
        }

        setformError(error);
        return Object.keys(error).length === 0;
    };

    const isEmptyValue = (value) => {
        return !value || value.trim().length < 1;
    };

    const isEmailValid = (email) => {
        return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email);
    };

    const isPhoneValid = (phone) => {
        return /^[0-9]{10}$/.test(phone);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            try {
                const response = await fetch("https://localhost:7296/api/account/SignUp", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formValue),
                });

                if (response.ok) {
                    toast.success("Đăng ký thành công!");
                    nav("/login");
                } else if (response.status === 401) {
                    toast.error(
                        "Mật khẩu phải đáp ứng các yêu cầu sau:\n" +
                        "- Ít nhất 6 ký tự\n" +
                        "- Ít nhất 1 chữ hoa (A-Z)\n" +
                        "- Ít nhất 1 chữ thường (a-z)\n" +
                        "- Ít nhất 1 số (0-9)\n" +
                        "- Ít nhất 1 ký tự đặc biệt (!@#$%^&*)",
                        {
                            position: "top-center",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            style: {
                                whiteSpace: 'pre-line'
                            }
                        }
                    );
                } else {
                    toast.error("Đăng ký thất bại!");
                }
            } catch (error) {
                console.error("Lỗi:", error);
                toast.error("Đã xảy ra lỗi khi đăng ký!");
            }
        }
    };

    const isStrongPassword = (password) => {
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
        return strongPasswordRegex.test(password);
    };

    return (
        <div className="register-page">
            <div className="register-form-container">
                <h2 className="title">Đăng Ký Tài Khoản</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Họ</label>
                        <div className="input-group">
                            <FaUser className="input-icon" />
                            <input
                                type="text"
                                className="form-control"
                                name="firstName"
                                value={formValue.firstName}
                                onChange={handleChange}
                                placeholder="Nhập họ"
                            />
                        </div>
                        {formError.firstName && (
                            <div className="error">{formError.firstName}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Tên</label>
                        <div className="input-group">
                            <FaUser className="input-icon" />
                            <input
                                type="text"
                                className="form-control"
                                name="lastName"
                                value={formValue.lastName}
                                onChange={handleChange}
                                placeholder="Nhập tên"
                            />
                        </div>
                        {formError.lastName && (
                            <div className="error">{formError.lastName}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <div className="input-group">
                            <FaEnvelope className="input-icon" />
                            <input
                                type="email"
                                className="form-control"
                                name="email"
                                value={formValue.email}
                                onChange={handleChange}
                                placeholder="Nhập email"
                            />
                        </div>
                        {formError.email && (
                            <div className="error">{formError.email}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Mật khẩu</label>
                        <div className="input-group">
                            <FaLock className="input-icon" />
                            <input
                                type="password"
                                className="form-control"
                                name="password"
                                value={formValue.password}
                                onChange={handleChange}
                                placeholder="Nhập mật khẩu"
                            />
                        </div>
                        {formError.password && (
                            <div className="error">{formError.password}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Xác nhận mật khẩu</label>
                        <div className="input-group">
                            <FaLock className="input-icon" />
                            <input
                                type="password"
                                className="form-control"
                                name="confirmPassword"
                                value={formValue.confirmPassword}
                                onChange={handleChange}
                                placeholder="Xác nhận mật khẩu"
                            />
                        </div>
                        {formError.confirmPassword && (
                            <div className="error">{formError.confirmPassword}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Số điện thoại</label>
                        <div className="input-group">
                            <FaPhone className="input-icon" />
                            <input
                                type="tel"
                                className="form-control"
                                name="phoneNumber"
                                value={formValue.phoneNumber}
                                onChange={handleChange}
                                placeholder="Nhập số điện thoại"
                            />
                        </div>
                        {formError.phoneNumber && (
                            <div className="error">{formError.phoneNumber}</div>
                        )}
                    </div>

                    <button type="submit" className="register-button">
                        Đăng Ký
                    </button>

                    <div className="login-link">
                        Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
