import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import './Footer.scss';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3 className="footer-title">Nhà Hàng Tiệc Cưới VIP</h3>
                        <p className="footer-description">
                            Nơi tạo nên những kỷ niệm đẹp và trọn vẹn cho ngày trọng đại của bạn.
                            Với không gian sang trọng và dịch vụ chuyên nghiệp, chúng tôi cam kết
                            mang đến trải nghiệm hoàn hảo nhất.
                        </p>
                    </div>

                    <div className="footer-section">
                        <h3 className="footer-title">Liên Hệ</h3>
                        <ul className="footer-contact">
                            <li>
                                <FaPhone className="icon" />
                                <span>Hotline: 1900 xxxx</span>
                            </li>
                            <li>
                                <FaEnvelope className="icon" />
                                <span>Email: contact@wedding.com</span>
                            </li>
                            <li>
                                <FaMapMarkerAlt className="icon" />
                                <span>Địa chỉ: TP.HCM</span>
                            </li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h3 className="footer-title">Dịch Vụ</h3>
                        <ul className="footer-links">
                            <li><Link to="/listhall">Sảnh Cưới</Link></li>
                            <li><Link to="/listmenu">Thực Đơn</Link></li>
                            <li><Link to="/listservice">Dịch Vụ Cưới</Link></li>
                            <li><Link to="/listbranch">Chi Nhánh</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h3 className="footer-title">Theo Dõi</h3>
                        <div className="social-links">
                            <a href="#" className="social-link">
                                <FaFacebook className="icon" />
                            </a>
                            <a href="#" className="social-link">
                                <FaTwitter className="icon" />
                            </a>
                            <a href="#" className="social-link">
                                <FaInstagram className="icon" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="copyright">
                        © 2024 Nhà Hàng Tiệc Cưới VIP.
                    </div>
                    <div className="footer-bottom-links">
                        <a href="#">Điều khoản sử dụng</a>
                        <a href="#">Chính sách bảo mật</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;