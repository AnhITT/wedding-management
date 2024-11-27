import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import AuthService from "../../service/auth-service";
import { Button, Form, FormGroup, Label, Input, Alert } from "reactstrap";
import "./login.css";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/");
        }
    }, [navigate]);

    const validate = () => {
        if (!username.trim()) {
            setError("Vui lòng nhập email!");
            return false;
        }
        if (!password) {
            setError("Vui lòng nhập mật khẩu!");
            return false;
        }
        if (!isValidEmail(username)) {
            setError("Email không hợp lệ!");
            return false;
        }
        return true;
    };

    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setError("");

        try {
            const response = await axios.post(
                "https://localhost:7296/api/account/SignInAdmin",
                { email: username, password },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200 && response.data.token) {
                const { token, roles } = response.data;
                localStorage.setItem("token", token);
                localStorage.setItem("roles", JSON.stringify(roles));
                
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                
                if (AuthService.checkRoleUser()) {
                    navigate("/");
                } else {
                    setError("Tài khoản không có quyền truy cập!");
                    localStorage.removeItem("token");
                    localStorage.removeItem("roles");
                }
            }
        } catch (error) {
            if (error.response) {
                setError(error.response.data.message || "Đăng nhập thất bại!");
            } else {
                setError("Lỗi kết nối server!");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-box">
                    <div className="login-header">
                        <h2 className="text-center">Wedding Management</h2>
                        <p className="text-center text-muted">Đăng nhập vào hệ thống quản trị</p>
                    </div>

                    {error && (
                        <Alert color="danger" className="mb-4">
                            <i className="bi bi-exclamation-circle me-2"></i>
                            {error}
                        </Alert>
                    )}

                    <Form onSubmit={handleLogin}>
                        <FormGroup className="mb-4">
                            <Label for="username" className="form-label-custom">
                                <i className="bi bi-envelope me-2"></i>
                                Email
                            </Label>
                            <Input
                                type="email"
                                name="username"
                                id="username"
                                placeholder="Nhập email của bạn"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={loading}
                                className="form-input-custom"
                            />
                        </FormGroup>

                        <FormGroup className="mb-4">
                            <Label for="password" className="form-label-custom">
                                <i className="bi bi-lock me-2"></i>
                                Mật khẩu
                            </Label>
                            <Input
                                type="password"
                                name="password"
                                id="password"
                                placeholder="Nhập mật khẩu của bạn"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                className="form-input-custom"
                            />
                        </FormGroup>

                        <Button
                            color="primary"
                            className="w-100 btn-custom"
                            disabled={loading}
                        >
                            {loading ? (
                                <span>
                                    <i className="bi bi-arrow-clockwise spin me-2"></i>
                                    Đang xử lý...
                                </span>
                            ) : (
                                <span>
                                    <i className="bi bi-box-arrow-in-right me-2"></i>
                                    Đăng nhập
                                </span>
                            )}
                        </Button>
                    </Form>

                    <div className="text-center mt-4">
                        <p className="text-muted">
                            © 2024 Wedding Management. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
