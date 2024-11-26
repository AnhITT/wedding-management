import { Button, Nav, NavItem } from "reactstrap";
import Logo from "./Logo";
import { Link, useLocation } from "react-router-dom";

const navigation = [
    {
        title: "Dashboard",
        href: "/",
        icon: "bi bi-speedometer2",
    },
    {
        title: "Quản lý tài khoản",
        href: "/accounts",
        icon: "bi bi-people",
    },
    {
        title: "Quản lý chi nhánh",
        href: "/branches",
        icon: "bi bi-building",
    },
    {
        title: "Quản lý sảnh cưới",
        href: "/halls",
        icon: "bi bi-door-open",
    },
    {
        title: "Quản lý menu món ăn",
        href: "/menu-categories",
        icon: "bi bi-list-nested",
    },
    {
        title: "Quản lý món ăn",
        href: "/menus",
        icon: "bi bi-cup-hot",
    },
    {
        title: "Quản lý menu dịch vụ",
        href: "/service-categories",
        icon: "bi bi-tags",
    },
    {
        title: "Quản lý dịch vụ",
        href: "/services",
        icon: "bi bi-gear",
    },
    {
        title: "Quản lý hoá đơn",
        href: "/invoices",
        icon: "bi bi-receipt",
    },
    {
        title: "Quản lý đánh giá",
        href: "/feedbacks",
        icon: "bi bi-star",
    },
];

const Sidebar = () => {
    const showMobilemenu = () => {
        document.getElementById("sidebarArea").classList.toggle("showSidebar");
    };
    let location = useLocation();

    return (
        <div className="p-3">
            <div className="d-flex align-items-center">
                <Logo />
                <span className="ms-auto d-lg-none">
                    <Button
                        close
                        size="sm"
                        onClick={() => showMobilemenu()}
                    ></Button>
                </span>
            </div>
            <div className="pt-4 mt-2">
                <Nav vertical className="sidebarNav">
                    {navigation.map((navi, index) => (
                        <NavItem key={index} className="sidenav-bg">
                            <Link
                                to={navi.href}
                                className={
                                    location.pathname === navi.href
                                        ? "text-primary nav-link py-3"
                                        : "nav-link text-secondary py-3"
                                }
                            >
                                <i className={navi.icon}></i>
                                <span className="ms-3 d-inline-block">
                                    {navi.title}
                                </span>
                            </Link>
                        </NavItem>
                    ))}
                </Nav>
            </div>
        </div>
    );
};

export default Sidebar;
