import React, { useState, useEffect } from "react";
import { Button, Card, Col, Form, Modal, Row, Spinner } from "react-bootstrap";
import Cookies from "js-cookie";
import jwt_decode from "jwt-decode";
import "./Profile.scss";
import avatar from "../../../assets/assets/img_6.png";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState("");
  const [id, setId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [firstNameUpdate, setFirstNameUpdate] = useState("");
  const [lastNameUpdate, setLastNameUpdate] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    const tokenFromCookie = Cookies.get("token_user");
    let decodedToken = null;

    if (tokenFromCookie) {
      decodedToken = jwt_decode(tokenFromCookie);
      setIsLoggedIn(true);
    }

    if (!decodedToken) {
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }

    const userId =
      decodedToken[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ];
    setId(userId);
    setFirstName(
      decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]
    );
    setLastName(
      decodedToken[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"
      ]
    );
    setEmail(
      decodedToken[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
      ]
    );
    setPhoneNumber(
      decodedToken[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/mobilephone"
      ]
    );

    if (userId !== "") {

      const fetchInfo = async () => {
        try {
          const response = await fetch(
            `https://localhost:7296/api/account/GetInFoUserById?id=${userId}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch user info");
          }
          const data = await response.json();
          setFirstName(data.firstName);
          setPhoneNumber(data.phone);
          setLastName(data.lastName);
        } catch (error) {
          console.error("Error fetching user info:", error);
          setError(error.message);
        }
      };

      const fetchWallet = async () => {
        try {
          const response = await fetch(
            `https://localhost:7296/api/wallet/${userId}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch wallet info");
          }
          const data = await response.json();
          setWallet(data);
        } catch (error) {
          console.error("Error fetching wallet info:", error);
          setError(error.message);
        }
      };

      fetchInfo();
      fetchWallet();
    }

    setLoading(false);
  }, [id]);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleSubmit = async () => {
    const profileData = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      phoneNumber: phoneNumber,
      avatar: avatar,
    };
    try {
      // Send the updated profile information to the server using fetch
      const response = await fetch(
        "https://localhost:7296/api/account/Update",
        {
          method: "POST", // Specify the method
          headers: {
            "Content-Type": "application/json", // Set the content type to JSON
            // Include any necessary authentication headers here
          },
          body: JSON.stringify(profileData), // Convert the profileData object to a JSON string
        }
      );

      // Check if the request was successful
      if (!response.ok) {
        throw new Error(`HTTP error status: ${response.status}`);
      }

      // Parse the response body as JSON
      const data = await response.json();
      toast.success("Cập nhật thành công!", {
        position: "top-right",
        autoClose: 3000, // Thời gian hiển thị toast (3 giây)
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Update the state with the new data from the server
      setId(data.id); // Assuming the server response includes the updated id
      setFirstName(data.firstName);
      setLastName(data.lastName);
      setEmail(data.email);
      setPhoneNumber(data.phoneNumber);
      setAvatar(data.avatar); // Update the avatar if the server response includes it

      // Close the modal after successful update
      closeModal();
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0]; // Lấy tệp đầu tiên trong danh sách tệp đã chọn

    if (file) {
      // Đọc tệp hình ảnh và chuyển đổi nó thành đường dẫn dạng URL
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageURL = event.target.result;
        setAvatar(imageURL);
      };
      reader.readAsDataURL(file); // Đọc tệp dưới dạng URL

      // Bạn có thể thêm logic xử lý tệp ở đây, ví dụ: tải lên máy chủ
    }
  };
  function formatPrice(price) {
    const formattedPrice = price.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
    return formattedPrice;
  }

  return (
    <div className="profile">
      {loading ? (
        <div className="overlay">
          <Spinner animation="border" />
        </div>
      ) : isLoggedIn ? (
        <div className="container emp-profile">
          <form method="">
            <Row className="profile_avatar">
              <Col md={8} className="profile_detail">
                <div>
                  <label htmlFor="first-name" className="form-label"><b>Tên</b></label>
                  <p>{firstName}</p>
                </div>
                <div>
                  <label htmlFor="last-name" className="form-label"><b>Họ</b></label>
                  <p>{lastName}</p>
                </div>
                <div>
                  <label htmlFor="email" className="form-label"><b>Email</b></label>
                  <p>{email}</p>
                </div>
                <div>
                  <label htmlFor="phone-number" className="form-label"><b>Số điện thoại</b></label>
                  <p>{phoneNumber || "Chưa nhập số điện thoại"}</p>
                </div>
                <div>
                  <label htmlFor="wallet" className="form-label"><b>Ví điện tử</b></label>
                  <p>Coin: <b style={{ color: "red" }}>{wallet?.coin ? formatPrice(wallet.coin) : "Chưa có ví"}</b></p>
                </div>
                <Button variant="dark" onClick={openModal}>Cập nhật thông tin</Button>
              </Col>
            </Row>
          </form>
        </div>
      ) : (
        <div className="container emp-profile">
          <p className="text-center mt-3">Người dùng chưa đăng nhập.</p>
        </div>
      )}
      <Modal show={showModal} onHide={closeModal} backdrop="true" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Cập nhật thông tin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <Form.Group>
              <Form.Label>Tên</Form.Label>
              <Form.Control type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Họ</Form.Label>
              <Form.Control type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Số điện thoại</Form.Label>
              <Form.Control type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
            </Form.Group>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>Đóng</Button>
          <Button variant="primary" onClick={handleSubmit}>Cập nhật</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Profile;
