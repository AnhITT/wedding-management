import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import AuthService from "../../service/auth-service";
import { Button, Form, FormGroup, Label, Input, Alert } from "reactstrap";
import "./login.css";
import { setAuthToken } from "../../service/auth-header";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Kiểm tra nếu đã có token thì chuyển hướng về trang chủ
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
        <div className="login-container">
            <div className="login-box">
                <h1 className="text-center mb-4">Đăng nhập quản trị</h1>
                {error && <Alert color="danger">{error}</Alert>}
                <Form onSubmit={handleLogin}>
                    <FormGroup>
                        <Label for="username">Email</Label>
                        <Input
                            type="email"
                            name="username"
                            id="username"
                            placeholder="Nhập email của bạn"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={loading}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label for="password">Mật khẩu</Label>
                        <Input
                            type="password"
                            name="password"
                            id="password"
                            placeholder="Nhập mật khẩu của bạn"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                    </FormGroup>

                    <Button
                        color="primary"
                        className="w-100"
                        disabled={loading}
                    >
                        {loading ? (
                            <span>
                                <i className="fas fa-spinner fa-spin me-2"></i>
                                Đang xử lý...
                            </span>
                        ) : (
                            "Đăng nhập"
                        )}
                    </Button>
                </Form>
            </div>
        </div>
    );
};

export default Login;
