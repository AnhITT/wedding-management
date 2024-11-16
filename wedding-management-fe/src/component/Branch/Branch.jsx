import { Link } from 'react-router-dom';
import Button from '../Button/button'
import './Branch.scss'

const Branch = () => {
    return (
        <div className='branch' id='branch'>
            <div className='branch__container container'>
                <div className='branch__left'>
                    <div className="image-wrapper">
                        <img src={require("../../assets/assets/img_2.png")} alt="Chi nhánh" />
                        <div className="image-overlay"></div>
                    </div>
                </div>
                <div className='branch__right'>
                    <div className="content-wrapper">
                        <span className='elegant-text'>Hệ Thống Chi Nhánh</span>
                        <h1>TIỆC CƯỚI SANG TRỌNG<br />KHẮP MỌI MIỀN</h1>
                        <div className="description">
                            <p className="main-desc">
                                Hệ thống nhà hàng tiệc cưới của chúng tôi tự hào hiện diện tại nhiều 
                                vị trí đắc địa trên toàn quốc, mang đến sự thuận tiện tối đa cho quý khách.
                            </p>
                            <div className="feature-list">
                                <div className="feature-item">
                                    <i className="fas fa-map-marker-alt"></i>
                                    <span>Vị trí đắc địa, dễ dàng tiếp cận</span>
                                </div>
                                <div className="feature-item">
                                    <i className="fas fa-building"></i>
                                    <span>Không gian rộng rãi, thiết kế hiện đại</span>
                                </div>
                                <div className="feature-item">
                                    <i className="fas fa-car"></i>
                                    <span>Bãi đỗ xe rộng rãi, an toàn</span>
                                </div>
                            </div>
                        </div>
                        <div className="cta-wrapper">
                            <Link to="/listbranch">
                                <Button className="explore-btn">KHÁM PHÁ CHI NHÁNH</Button>
                            </Link>
                            <div className="stats">
                                <div className="stat-item">
                                    <span className="number">10+</span>
                                    <span className="label">Chi Nhánh</span>
                                </div>
                                <div className="stat-item">
                                    <span className="number">1000+</span>
                                    <span className="label">Tiệc Cưới</span>
                                </div>
                                <div className="stat-item">
                                    <span className="number">98%</span>
                                    <span className="label">Hài Lòng</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Branch;