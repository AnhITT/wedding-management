import Cookies from 'js-cookie';
import './Header.scss'
import { useEffect, useState } from "react";
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { Container, Nav, NavDropdown, Navbar } from "react-bootstrap";
import jwt_decode from 'jwt-decode';
import axios from 'axios';
import { BsClipboardFill, BsFillPersonFill,BsCartCheck } from 'react-icons/bs';
import { useAuth } from "../../component/Context/AuthProvider";
import { MdRoomService } from "react-icons/md";
const Header = () => {
    const { token, firstName, email, logout, login, avatar } = useAuth(); // lưu trạng thái hoạt động
    const [userInfo, setUserInfo] = useState(null);
    const navigate = useNavigate(); // Sử dụng useNavigate

    useEffect(() => {
        const tokenFromCookie = Cookies.get('token_user');

        if (tokenFromCookie) {
            const decodedToken = jwt_decode(tokenFromCookie);
            const email = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
            const firstName = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
            const lastName = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/Surname'];

            login(tokenFromCookie, firstName, email, avatar);
        }
    }, [login]);

    const handleLogout = () => {
        logout(); // Gọi hàm logout từ context
        Cookies.remove('token_user'); // Xóa token khỏi cookie
        navigate('/'); // Điều hướng về trang home
    };
    return (
        <Navbar expand="lg" className="bg-body-tertiary fixed-top">
            <Container className="nav__container">
                <Link style={{marginRight:'6px'}} className="nav__logo" to="/">
                    Wedding
                </Link>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="nav__links mx-auto">
                        <Link className="nav-link text-black me-3 fw-bold mt-1" to="/">Trang chủ</Link>
                        <Link className="nav-link text-black me-3 fw-bold mt-1" to="/listhall">Sảnh cưới</Link>
                        <Link className="nav-link text-black me-3 fw-bold mt-1" to="/listbranch">Chi nhánh</Link>
                        <Link className="nav-link text-black me-3 fw-bold mt-1" to="/listmenu">Thực đơn</Link>
                        <Link className="nav-link text-black me-3 fw-bold mt-1" to="/listservice">Dịch vụ</Link>
                    </Nav>
                    <Nav className="nav__user-links">
                        {token ? (
                            <>
                                <Link to='/profile' className="nav-link text-black me-3 fw-bold mt-1" title="Thông tin cá nhân">
                                    <BsFillPersonFill className='header' />
                                </Link>
                                <Link to='/history' className="nav-link text-black fw-bold mt-1" title="Lịch sử đặt tiệc">
                                    <BsClipboardFill className='header' />
                                </Link>
                                <Link to='/bill' style={{marginLeft:'15px'}} className="nav-link text-black fw-bold mt-1" title="Đặt tiệc">
                                    <MdRoomService className='header' />
                                </Link>
                                <button style={{width:'100px',marginLeft:'-6px'}} onClick={handleLogout} className="nav-link text-black me-3 fw-bold mt-1">Đăng Xuất</button>
                            </>
                        ) : (
                            <Link className="nav-link text-black me-3 fw-bold mt-1" to="/login">
                                Đăng Nhập
                            </Link>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default Header;
