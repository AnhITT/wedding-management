import './Menu.scss'
import Button from '../Button/button'
import { Link } from 'react-router-dom'
import { FaUtensils } from 'react-icons/fa'

const Menu = () => {
    const initalFood = [
        {
            title: "Gỏi Hải Sản Premium",
            img_url: require("../../assets/assets/img_6.png"),
            desc: "Tinh hoa ẩm thực biển kết hợp với nghệ thuật trang trí hiện đại"
        },
        {
            title: "Súp Hải Sản Hoàng Đế",
            img_url: require("../../assets/assets/img_5.png"),
            desc: "Hương vị đậm đà với nguyên liệu cao cấp tuyển chọn"
        },
        {
            title: "Bò Wagyu Nướng",
            img_url: require("../../assets/assets/img_4.png"),
            desc: "Thịt bò Wagyu thượng hạng kết hợp với công thức độc quyền"
        }
    ];

    return (
        <div className='menu' id='menu'>
            <div className='menu__container container'>
                <div className="menu__header">
                    <span className='elegant-text'>
                        <FaUtensils className="icon" />
                        Ẩm Thực Tinh Tế
                    </span>
                    <h1>THỰC ĐƠN ĐẶC SẮC</h1>
                    <p className="menu-description">
                        Trải nghiệm ẩm thực đỉnh cao với những món ăn được chế biến bởi 
                        đội ngũ đầu bếp tài năng, kết hợp giữa hương vị truyền thống và 
                        phong cách hiện đại.
                    </p>
                    <Link to="/listmenu">
                        <Button>Khám Phá Thực Đơn</Button>
                    </Link>
                </div>

                <div className="menu__content">
                    <ul className='menu__list'>
                        {initalFood.map((item, index) => (
                            <li className='menu__item' key={item.title}>
                                <div className='menu__item--img'>
                                    <img src={item.img_url} alt={item.title} />
                                    <div className="overlay">
                                        <span className="number">0{index + 1}</span>
                                    </div>
                                </div>
                                <div className='menu__item--content'>
                                    <h3>{item.title}</h3>
                                    <p>{item.desc}</p>
                                    <div className="tags">
                                        <span className="tag">Đặc sắc</span>
                                        <span className="tag">Cao cấp</span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}
export default Menu;