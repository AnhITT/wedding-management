import Button from '../../component/Button/button'
import './Home.scss'
import Hall from '../../component/Hall/Hall'
import Branch from '../../component/Branch/Branch'
import Menu from '../../component/Menu/Menu'
import Service from '../../component/Service/Service'
import { Link } from 'react-router-dom'

const Home = () => {
    return (
        <>
            <div className="home" id="home">
                <div className="home__container container">
                    <div className="home__left">
                        <div className="content-wrapper">
                            <span className="elegant-text">Nhà Hàng Tiệc Cưới</span>
                            <h1>
                                KHÔNG GIAN SANG TRỌNG<br/>
                                CHO NGÀY HẠNH PHÚC
                            </h1>
                            <p className="description">
                                Chào mừng bạn đến với trung tâm tiệc cưới đẳng cấp. 
                                Chúng tôi tự hào mang đến những trải nghiệm hoàn hảo và độc đáo, 
                                nơi mỗi chi tiết được chăm chút tỉ mỉ để tạo nên không gian 
                                lý tưởng cho ngày trọng đại của bạn.
                            </p>
                            <div className="home__buttons">
                                <Link to="/bill">
                                    <Button className="primary-btn">ĐẶT TIỆC NGAY</Button>
                                </Link>
                                <Link to="/listbranch">
                                    <Button className="secondary-btn">XEM CHI NHÁNH</Button>
                                </Link>
                            </div>
                            <div className="highlights">
                                <div className="highlight-item">
                                    <span className="number">1000+</span>
                                    <span className="label">Tiệc cưới</span>
                                </div>
                                <div className="highlight-item">
                                    <span className="number">10+</span>
                                    <span className="label">Chi nhánh</span>
                                </div>
                                <div className="highlight-item">
                                    <span className="number">98%</span>
                                    <span className="label">Khách hài lòng</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="home__right">
                        <div className="image-wrapper">
                            <img 
                                src={require("../../assets/assets/img_1.png")} 
                                alt="Wedding Venue" 
                                className="main-image"
                            />
                            <div className="overlay"></div>
                            <div className="floating-card">
                                <div className="card-content">
                                    <h3>Đặt Tiệc Ngay</h3>
                                    <p>Nhận ưu đãi đặc biệt</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Branch />
            <Hall />
            <Menu />
            <Service />
        </>
    )
}

export default Home;
