import { Link } from 'react-router-dom';
import Button from '../Button/button';
import './Service.scss'

const Service = () => {
    return (
        <div className="service" id="service">
            <div className="service__container container">
                <div className="service__left">
                    <span className='elegant-text'>Dịch Vụ Hoàn Hảo</span>
                    <h1>TRỌN GÓI DỊCH VỤ<br/>ĐẲNG CẤP 5 SAO</h1>
                    <p>
                        Chúng tôi cung cấp đầy đủ các dịch vụ cao cấp từ trang trí, 
                        âm thanh ánh sáng đến quay phim, chụp ảnh chuyên nghiệp. 
                        Đội ngũ nhân viên giàu kinh nghiệm sẽ đảm bảo mọi chi tiết 
                        được thực hiện hoàn hảo, mang đến cho bạn một đám cưới 
                        trong mơ không thể quên.
                    </p>
                    <div className="service__right">
                        <img src={require("../../assets/assets/Untitled.png")} alt="Premium Services" />
                    </div>
                    <Link to="/listservice">
                        <Button>Khám Phá Dịch Vụ</Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
export default Service;