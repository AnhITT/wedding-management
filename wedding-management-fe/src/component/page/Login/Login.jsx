import { Link, useNavigate } from "react-router-dom";
import "./login.scss";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import jwt_decode from "jwt-decode";
import { useAuth } from "../../Context/AuthProvider";
import { ToastContainer, toast } from "react-toastify";
import { FaEnvelope, FaLock, FaUserPlus } from 'react-icons/fa';

const Login = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { setToken, setFirstName, setEmail, setId } = useAuth();
    const nav = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    useEffect(() => {
        const token = Cookies.get("token_user");
        if (token) {
            try {
                redirectHome();
            } catch (error) {
                console.error("Invalid token:", error);
            }
        }
    }, []);

    const redirectHome = () => {
        nav("/");
    };

    const handleLoginSuccess = (token) => {
        setToken(token);
        toast.success("Đăng nhập thành công!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        });
        nav("/");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(
                "https://localhost:7296/api/account/SignIn",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );

            if (response.ok) {
                const data = await response.json();
                const token = data.token;
                Cookies.set("token_user", token, { expires: 7 });
                handleLoginSuccess(token);
            } else {
                toast.error("Đăng nhập thất bại!", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
        } catch (error) {
            console.error("Lỗi khi đăng nhập:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-content">
                    <div className="login-header">
                        <h2>Đăng Nhập</h2>
                        <p>Chào mừng bạn trở lại</p>
                    </div>
                    <form onSubmit={handleLogin} className="login-form">
                        <div className="form-group">
                            <div className="input-icon">
                                <FaEnvelope className="icon" />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="input-icon">
                                <FaLock className="icon" />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Mật khẩu"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-options">
                            <label className="remember-me">
                                <input type="checkbox" />
                                <span>Ghi nhớ đăng nhập</span>
                            </label>
                            <Link to="/forgot-password" className="forgot-password">
                                Quên mật khẩu?
                            </Link>
                        </div>
                        <button
                            type="submit"
                            className="login-button"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="spinner"></span>
                            ) : (
                                "Đăng Nhập"
                            )}
                        </button>
                        <div className="register-link">
                            <p>Chưa có tài khoản?</p>
                            <Link to="register" className="register-button">
                                <FaUserPlus className="icon" />
                                Đăng Ký Ngay
                            </Link>
                        </div>
                    </form>
                </div>
                <div className="login-image">
                    <img src={require("../../../assets/assets/login.png")} alt="Login" />
                </div>
            </div>
        </div>
    );
};

export default Login;
