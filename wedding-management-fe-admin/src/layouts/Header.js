import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthService from "../service/auth-service";
import "@fortawesome/fontawesome-free/css/all.min.css";
import CustomDropdownItem from "./loader/CustomDropdownItem";
import {
    Badge,
    Navbar,
    Collapse,
    Nav,
    NavItem,
    NavbarBrand,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Dropdown,
    Button,
} from "reactstrap";
import { ReactComponent as LogoWhite } from "../assets/images/logos/xtremelogowhite.svg";
import user1 from "../assets/images/users/user1.jpg";

const Header = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [dropdownOpen, setDropdownOpen] = React.useState(false);
    const navigate = useNavigate();
    const [notificationDropdownOpen, setNotificationDropdownOpen] =
        useState(false);

    const toggle = () => setDropdownOpen((prevState) => !prevState);
    const Handletoggle = () => {
        setIsOpen(!isOpen);
    };
    const showMobilemenu = () => {
        document.getElementById("sidebarArea").classList.toggle("showSidebar");
    };
    const handleLogout = () => {
        AuthService.logout();
    };
    const toggleNotificationDropdown = () =>
        setNotificationDropdownOpen((prevState) => !prevState);
    useEffect(() => {
        if (!AuthService.checkRoleUser()) {
            handleLogout();
        }
    }, []);
    return (
        <Navbar color="primary" dark expand="md">
            <div className="d-flex align-items-center">
                <NavbarBrand href="/" className="d-lg-none">
                    <LogoWhite />
                </NavbarBrand>
                <Button
                    color="primary"
                    className="d-lg-none"
                    onClick={() => showMobilemenu()}
                >
                    <i className="bi bi-list"></i>
                </Button>
            </div>
            <div className="hstack gap-2">
                <Button
                    color="primary"
                    size="sm"
                    className="d-sm-block d-md-none"
                    onClick={Handletoggle}
                >
                    {isOpen ? (
                        <i className="bi bi-x"></i>
                    ) : (
                        <i className="bi bi-three-dots-vertical"></i>
                    )}
                </Button>
            </div>
            <div className="ml-auto d-flex align-items-center gap-3">
                {" "}
                <Collapse navbar isOpen={isOpen}>
                    <Nav className="me-auto" navbar></Nav>
                    <Dropdown isOpen={dropdownOpen} toggle={toggle}>
                        <DropdownToggle color="primary">
                            <img
                                src={user1}
                                alt="profile"
                                className="rounded-circle"
                                width="30"
                            ></img>
                        </DropdownToggle>
                        <DropdownMenu>
                            <DropdownItem header>Info</DropdownItem>
                            <DropdownItem>My Account</DropdownItem>
                            <DropdownItem>Edit Profile</DropdownItem>
                            <DropdownItem divider />
                            <DropdownItem>My Balance</DropdownItem>
                            <DropdownItem>Inbox</DropdownItem>
                            <DropdownItem onClick={handleLogout}>
                                Logout
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </Collapse>
            </div>
        </Navbar>
    );
};

export default Header;
