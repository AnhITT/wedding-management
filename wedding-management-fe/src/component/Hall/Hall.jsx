import './Hall.scss'
import Button from '../Button/button';
import { Link } from 'react-router-dom';

const Hall = () => {
    return (
        <div className='hall' id='hall'>
            <div className='hall__container container'>
                <div className='hall__left'>
                    <img src={require("../../assets/assets/img_5.png")} alt="Sảnh cưới" />
                </div>
                <div className='hall__right'>
                    <span className='elegant-text'>Sảnh Cưới Đẳng Cấp</span>
                    <h1>KHÔNG GIAN TIỆC CƯỚI<br />SANG TRỌNG & ẤM CÚNG</h1>
                    <p>
                        Mỗi sảnh cưới của chúng tôi là một tác phẩm nghệ thuật, được thiết kế tỉ mỉ 
                        với những chi tiết sang trọng và hiện đại. Từ ánh sáng lung linh đến không gian 
                        rộng rãi, mọi yếu tố đều được chăm chút để tạo nên khung cảnh hoàn hảo cho 
                        ngày trọng đại của bạn.
                    </p>
                    <Link to="/listhall">
                        <Button>Khám Phá Sảnh Cưới</Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
export default Hall;