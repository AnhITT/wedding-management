import "./Bill.scss";
import { Accordion, Button, Card, Modal, Spinner } from "react-bootstrap";
import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import Cookies from "js-cookie";
import jwt_decode from "jwt-decode";
import { useCookies } from "react-cookie";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { faL, faWallet } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import moment from "moment-timezone";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { FaLightbulb } from 'react-icons/fa';
const Bill = () => {
  const [cookies] = useCookies(["token_user"]);
  const [branchs, setBranchs] = useState([]);
  const [halls, setHalls] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [selectedHallId, setSelectedHallId] = useState(null);
  const [selectedHallIndex, setSelectedHallIndex] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedHalls, setSelectedHalls] = useState([]);
  const [scrollY, setScrollY] = useState(0);

  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [categorizedServices, setCategorizedServices] = useState({});
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedValue, setSelectedValue] = useState("");

  const [note, setNote] = useState("");
  const [phoneValid, setPhoneValid] = useState(true);
  const [isDuplicateInvoice, setIsDuplicateInvoice] = useState(false);
  const [promoCodes, setPromoCodes] = useState([]);
  const [selectedCodes, setSelectedCodes] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [cost, setCost] = useState(0);
  const [numberOfTables, setNumberOfTables] = useState(0);

  const handleSliderChange = (value) => {
    setCost(value);
    console.log(cost);
  };

  const [showModalSuggest, setShowModalSuggest] = useState(false);

  const openModalSuggest = () => {
    setShowModalSuggest(true);
  };

  const closeModalSuggest = () => {
    setShowModalSuggest(false);
  };

  // sdt phải đủ 10 số
  const isPhoneNumberValid = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  useEffect(() => {
    const slideTrigger = document.getElementById("slide-trigger");
    const contentElement = document.querySelector(".content");
    
    if (slideTrigger && contentElement) { // Kiểm tra xem elements có tồn tại không
      const handleSlideTriggerClick = function () {
        const isActive = contentElement.classList.toggle("active");
        if (isActive) {
          localStorage.setItem("openBill", "true");
        } else {
          localStorage.removeItem("openBill");
        }
      };

      slideTrigger.addEventListener("click", handleSlideTriggerClick);

      // Cleanup function
      return () => {
        slideTrigger.removeEventListener("click", handleSlideTriggerClick);
      };
    }
  }, []); // Chỉ chạy một lần khi component mount

  useEffect(() => {
    const contentElement = document.querySelector(".content");
    const closeIcon = document.querySelector(".close-icon");
    
    if (contentElement && closeIcon) { // Kiểm tra xem elements có tồn tại không
      const handleCloseIconClick = function () {
        contentElement.classList.remove("active");
        localStorage.removeItem("openBill");
      };

      closeIcon.addEventListener("click", handleCloseIconClick);

      // Cleanup function
      return () => {
        closeIcon.removeEventListener("click", handleCloseIconClick);
      };
    }
  }, []); // Chỉ chạy một lần khi component mount

  useEffect(() => {
    const contentElement = document.querySelector(".content");
    const openBill = localStorage.getItem("openBill");
    
    if (contentElement && openBill) {
      contentElement.classList.add("active");
    }
  }, []); // Chỉ chạy một lần khi component mount

  useEffect(() => {
    const storedFullName = localStorage.getItem("fullName");
    if (storedFullName) {
      setFullName(storedFullName);
    }
    const storedPhone = localStorage.getItem("phoneNumber");
    if (storedPhone) {
      setPhoneNumber(storedPhone);
    }
    const storedNote = localStorage.getItem("note");
    if (storedNote) {
      setNote(storedNote);
    }
  }, []);

  const handleFullNameChange = (e) => {
    const value = e.target.value;
    setFullName(value);
    localStorage.setItem("fullName", value);
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;
    setPhoneNumber(value);
    localStorage.setItem("phoneNumber", value);
  };

  const handleNoteChange = (e) => {
    const value = e.target.value;
    setNote(value);
    localStorage.setItem("note", value);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  const selectedItemsStyle = {
    top: `${scrollY + 20}px`, // 20px là khoảng cách ban đầu từ đỉnh cửa sổ
  };
  // Tải dữ liệu từ API khi component được render
  useEffect(() => {
    fetch("https://localhost:7296/api/ApiBranch")
      .then((response) => response.json())
      .then((data) => setBranchs(data))
      .catch((error) => console.error("Error fetching branch data:", error));
  }, []);

  useEffect(() => {
    fetch("https://localhost:7296/api/hall")
      .then((response) => response.json())
      .then((data) => setHalls(data))
      .catch((error) => console.error("Error fetching hall data:", error));
  }, []);

  useEffect(() => {
    const savedSelectedBranchId = localStorage.getItem("selectedBranchId");
    if (savedSelectedBranchId) {
      setSelectedBranchId(JSON.parse(savedSelectedBranchId));
    }
    const savedSelectedHallId = localStorage.getItem("selectedHallId");
    if (savedSelectedHallId) {
      setSelectedHallId(JSON.parse(savedSelectedHallId));
    }
    const savedSelectedHalls = localStorage.getItem("selectedHalls");
    if (savedSelectedHalls) {
      setSelectedHalls(JSON.parse(savedSelectedHalls));
    }
  }, []);

  const [hallsByBranch, setHallsByBranch] = useState([]);

  const handleBranchCheckboxChange = async (branchId) => {
    setSelectedBranchId(branchId);
    setSelectedHallId(null); // Đặt hội trường về null khi thay đổi chi nhánh
    setSelectedHallIndex(null); // Đặt lại lựa chọn của hall khi chọn branch khác
    setSelectedHalls([]); // Xóa danh sách hội trường đã chọn

    localStorage.setItem("selectedBranchId", JSON.stringify(branchId));
    
    try {
      // Gọi API để lấy danh sách sảnh theo chi nhánh
      const response = await fetch(
        `https://localhost:7296/api/get-hall-by-branchid/${branchId}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch halls");
      }
      
      const data = await response.json();
      setHallsByBranch(data); // Lưu danh sách sảnh vào state
      
      toast.success(
        `Đã chọn chi nhánh: ${branchs.find((branch) => branch.branchId === branchId).name}`,
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    } catch (error) {
      console.error("Error fetching halls:", error);
      toast.error("Không thể tải danh sách sảnh cưới", {
        position: "top-right", 
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleHallCheckboxChange = (hallId) => {
    setSelectedHallId(hallId);

    const selectedHall = halls.find((hall) => hall.hallId === hallId);

    if (selectedHall) {
      const isHallSelected = selectedHalls.some(
        (hall) => hall.hallId === selectedHall.hallId
      );

      if (isHallSelected) {
        const updatedHalls = selectedHalls.filter(
          (hall) => hall.hallId !== selectedHall.hallId
        );
        setSelectedHalls(updatedHalls);
      } else {
        const updatedHalls = [selectedHall];
        setSelectedHalls(updatedHalls);
        localStorage.setItem("selectedHalls", JSON.stringify(updatedHalls));

        localStorage.setItem("selectedHallId", JSON.stringify(hallId));
        toast.success(`Đã chọn sảnh: ${selectedHall.name}`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
  };
  const selectedBranch = branchs.find(
    (branch) => branch.branchId === selectedBranchId
  );
  const selectedItemHall = halls.filter(
    (hall) => hall.branchName === selectedBranch?.name
  );

  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessingPaymentWallet, setIsProcessingPaymentWallet] =
    useState(false);
  const [isCheckOrder, setIsCheckOrder] = useState(false);

  const demoPayment = async (e) => {
    localStorage.removeItem("invoiceId");
    setIsProcessing(true);
    try {
      if (checkOrder === true) {
        toast.info("Đang chuyển đến trang thanh toán", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        setTimeout(async () => {
          try {
            var payDeposit = total / 2; // thanh toan dat coc
            const amount = (payDeposit + "00").toString();
            const response = await fetch(
              `https://localhost:7296/api/Payment?amount=${amount}`
            );
            if (!response.ok) {
              throw new Error("Failed to fetch payment URL");
            }
            const paymentUrl = await response.text();
            window.location.href = paymentUrl;
          } catch (error) {
            console.error("Error creating payment URL: ", error);
          }
        }, 2000);
      } else {
        toast.error("Vui lòng kiểm tra đơn hàng!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Error creating payment URL: ", error);
    }
  };

  const [checkOrder, setCheckOrder] = useState(false);

  const handleFormSubmit = async () => {
    // Kiểm tra token_user trong cookie
    const tokenFromCookie = Cookies.get("token_user");
    let id = null;
    if (tokenFromCookie) {
      const decodedToken = jwt_decode(tokenFromCookie);
      id =
        decodedToken[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ];
    }

    if (!id) {
      // Người dùng chưa đăng nhập hoặc không có token hợp lệ
      toast.error("Bạn phải đăng nhập để đặt nhà hàng", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setCheckOrder(false);
      setIsCheckOrder(false);

      return;
    }
    const currentDate = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(currentDate.getFullYear() + 1);

    if (selectedDate > oneYearFromNow) {
      toast.error(
        "Ngày đến tham dự không được quá 1 năm kể từ ngày hiện tại.",
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
      setCheckOrder(false);
      setIsCheckOrder(false);

      return;
    }
    if (selectedBranch && selectedHalls.length > 0) {
      // Kiểm tra số lượng món ăn đã chọn
      if (selectedMenus.length < 3) {
        toast.error("Phải đặt ít nhất 3 món ăn", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setCheckOrder(false);
        setIsCheckOrder(false);

        return;
      }

      // Kiểm tra attendanceDate
      const currentDate = new Date();
      const twentyDaysFromNow = new Date();
      twentyDaysFromNow.setDate(currentDate.getDate() + 20);

      if (selectedDate <= twentyDaysFromNow) {
        toast.error(
          "Ngày đến tham dự phải cách ít nhất 20 ngày kể từ ngày hiện tại.",
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );
        setCheckOrder(false);
        setIsCheckOrder(false);

        return;
      }

      if (!fullName || !phoneNumber) {
        // Kiểm tra xem các trường dữ liệu đã nhập đủ hay chưa
        toast.error("Vui lòng điền đầy đủ thông tin!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        setCheckOrder(false);
        setIsCheckOrder(false);

        return;
      }

      if (!isPhoneNumberValid(phoneNumber)) {
        toast.error("Số điện thoại không hợp lệ - Phải đủ 10 số", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setCheckOrder(false);
        setIsCheckOrder(false);

        setPhoneValid(false);
        return;
      }

      const duplicateCheckRequest = {
        AttendanceDate: moment(selectedDate).format("YYYY-MM-DD"),
        BranchId: selectedBranch ? selectedBranch.branchId : null, // ID của chi nhánh đã chọn
        HallId: selectedHallIdDo,
        TimeHall: selectedValue,
      };

      const response = await fetch(
        "https://localhost:7296/api/invoice/checked",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(duplicateCheckRequest),
        }
      );
      if (response.status === 400) {
        // Hóa đơn trùng lặp
        const data = await response.json();
        setIsDuplicateInvoice(true);
        toast.error(data.message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setCheckOrder(false);
        setIsCheckOrder(false);

        return;
      }
      if (selectedValue === "") {
        toast.error("Chưa chọn buổi đến tham gia sảnh cưới", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }
      for (const promoCodeId of selectedCodes) {
        const usePromoCodeResponse = await fetch(
          `https://localhost:7296/api/invoice/use-promo-code?codeId=${promoCodeId}`,
          {
            method: "POST",
          }
        );
        if (usePromoCodeResponse.ok) {
          // Xử lý khi mã giảm giá được sử dụng thành công
          console.log(
            "Sử dụng mã giảm giá thành công cho mã có ID:",
            promoCodeId
          );
        } else {
          // Xử lý khi có lỗi khi s    dụng mã gi  m giá
          console.error(
            "Lỗi khi sử dụng mã giảm giá cho mã có ID:",
            promoCodeId
          );
        }
      }
      // Tất cả điều kiện đều đúng và người dùng đã đăng nhập
      console.log("Chi nhánh đã chọn:", selectedBranch.name);
      console.log(
        "Sảnh cưới đã chọn:",
        selectedHalls.map((hall) => hall.name).join(", ")
      );
      console.log(
        "Danh sách món ăn đã chọn:",
        selectedMenus
          .map((menuId) => {
            const selectedMenu = menus.find((menu) => menu.menuId === menuId);
            return selectedMenu ? selectedMenu.name : "";
          })
          .join(", ")
      );

      // Gửi đơn hàng
      console.log("orderData:", orderDataPaymentWallet);
      toast.success("Thông tin đặt hàng hợp lệ !", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      console.log("selectedValue", selectedValue);
      // sendOrderData();
      setCheckOrder(true);
      setIsCheckOrder(true);
      saveOrderDataToLocalStorage();
    } else {
      toast.error("Chi nhánh hoặc sảnh chưa được chọn !", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setCheckOrder(false);
      setIsCheckOrder(false);
    }
  };

  useEffect(() => {
    fetch("https://localhost:7296/api/service")
      .then((response) => response.json())
      .then((data) => {
        setServices(data);

        // Nhóm dịch vụ vào từng danh mục
        const categorized = data.reduce((categories, service) => {
          if (!categories[service.categoryName]) {
            categories[service.categoryName] = [];
          }
          categories[service.categoryName].push(service);
          return categories;
        }, {});

        setCategorizedServices(categorized);

        // Nạp danh sách đã chọn từ localStorage (nếu có)
        const storedSelectedServices = JSON.parse(
          localStorage.getItem("selectedServices")
        );
        if (storedSelectedServices) {
          setSelectedServices(storedSelectedServices);
        }
      })
      .catch((error) => console.error("Error fetching service data:", error));
  }, []);

  // Xử lý thay đổi checkbox của dịch vụ
  const handleServiceCheckboxChange = (serviceId) => {
    if (selectedServices.includes(serviceId)) {
      // Nu đã chọn, loại bỏ dịch vụ khỏi danh sách
      const updatedServices = selectedServices.filter((id) => id !== serviceId);
      setSelectedServices(updatedServices);
      localStorage.setItem("selectedServices", JSON.stringify(updatedServices));

      // Hiển thị toast thông báo hủy dịch vụ
      const selectedService = services.find(
        (service) => service.serviceId === serviceId
      );
      toast.error(`Đã hủy dịch vụ: ${selectedService.name}`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else {
      // Nếu chưa chọn, thêm dịch vụ vào danh sách
      const updatedServices = [...selectedServices, serviceId];
      setSelectedServices(updatedServices);
      localStorage.setItem("selectedServices", JSON.stringify(updatedServices));

      // Hiển thị toast thông báo đã chọn dịch vụ
      const selectedService = services.find(
        (service) => service.serviceId === serviceId
      );
      toast.success(`Đã chọn dịch vụ: ${selectedService.name}`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const [menus, setMenus] = useState([]);
  const [selectedMenus, setSelectedMenus] = useState([]);
  // Tải dữ liệu từ API khi component được render
  useEffect(() => {
    fetch("https://localhost:7296/api/menu")
      .then((response) => response.json())
      .then((data) => {
        setMenus(data);

        // Nạp danh sách đã chọn từ localStorage
        const storedSelectedMenus = JSON.parse(
          localStorage.getItem("selectedMenus")
        );
        if (storedSelectedMenus) {
          setSelectedMenus(storedSelectedMenus);
        }
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  // Sử dụng reduce để nhóm món ăn vào từng danh mục
  const categorizedMenus = menus.reduce((categories, menu) => {
    if (!categories[menu.categoryName]) {
      categories[menu.categoryName] = [];
    }
    categories[menu.categoryName].push(menu);
    return categories;
  }, {});

  const handleMenuCheckboxChange = (menuId) => {
    const selectedMenu = menus.find((menu) => menu.menuId === menuId);

    if (selectedMenus.includes(menuId)) {
      // Nếu đã chọn, loại bỏ món ăn khỏi danh sách
      const updatedMenus = selectedMenus.filter((id) => id !== menuId);
      setSelectedMenus(updatedMenus);
      localStorage.setItem("selectedMenus", JSON.stringify(updatedMenus));

      toast.error(`Đã hủy món: ${selectedMenu.name}`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else {
      // Nếu chưa chọn, thêm món ăn vào danh sách
      const updatedMenus = [...selectedMenus, menuId];
      setSelectedMenus(updatedMenus);
      localStorage.setItem("selectedMenus", JSON.stringify(updatedMenus));

      toast.success(`Đã chọn món: ${selectedMenu.name}`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  useEffect(() => {
    const fetchPromoCodes = async () => {
      try {
        const response = await fetch(
          "https://localhost:7296/api/invoice/promo-code"
        );
        if (response.ok) {
          const data = await response.json();
          // Lọc danh sách mã giảm giá để chỉ hiển thị những mã còn hiệu lực
          const validPromoCodes = data.filter((promoCode) => {
            // Giả sử promoCode có trường 'expiryDate' biểu diễn thời gian hết hạn
            // Chuyển đổi cả hai thời điểm sang dạng Date để so sánh
            const currentDate = new Date();
            const expiryDate = new Date(promoCode.expirationDate);
            return expiryDate > currentDate; // Trả về true nếu mã giảm giá chưa hết h���n
          });
          setPromoCodes(validPromoCodes);
        } else {
          console.error(
            "Lỗi khi lấy danh sách mã giảm giá:",
            response.statusText
          );
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách mã giảm giá:", error);
      }
    };

    // GET mỗi 5 giây
    const interval = setInterval(fetchPromoCodes, 5000);

    // Dừng polling khi component unmount
    return () => clearInterval(interval);

    // Khởi tạo ban đầu
    fetchPromoCodes();
  }, []);

  // Xử lý sự kiện khi người dùng chọn hoặc bỏ chọn mã giảm giá
  const handleCodeSelection = (codeId) => {
    if (selectedCodes.includes(codeId)) {
      setSelectedCodes(selectedCodes.filter((id) => id !== codeId));
      toast.error("Đã hủy bỏ mã giảm giá", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else {
      setSelectedCodes([...selectedCodes, codeId]);
      toast.success("Đã áp dụng mã giảm giá", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };
  useEffect(() => {
    // Tính toán giảm giá từ các mã giảm giá đã chọn
    const selectedCodesDiscount = selectedCodes.reduce((acc, codeId) => {
      const selectedCode = promoCodes.find((code) => code.codeId === codeId);
      if (selectedCode) {
        return acc + selectedCode.discount;
      }
      return acc;
    }, 0);

    // Cập nhật giá trị giảm giá
    setDiscount(selectedCodesDiscount);
  }, [selectedCodes, promoCodes]);
  let totalBeforeDiscount = 0;
  const calculateTotalPrice = () => {
    const menuTotal = selectedMenus.reduce((acc, menuId) => {
      const selectedMenu = menus.find((menu) => menu.menuId === menuId);
      return acc + selectedMenu.price;
    }, 0);

    const serviceTotal = selectedServices.reduce((acc, serviceId) => {
      const selectedService = services.find(
        (service) => service.serviceId === serviceId
      );
      return acc + selectedService.price;
    }, 0);

    // Tính giá cho sảnh cưới (hall.price) và định dạng nó bằng hàm formatPrice
    let hallTotal = 0;
    if (selectedHallId) {
      const selectedHall = halls.find((hall) => hall.hallId === selectedHallId);
      if (selectedHall) {
        hallTotal = selectedHall.price;
      }
    }

    // Tổng tiền trước khi áp dụng giảm giá
    totalBeforeDiscount = menuTotal + serviceTotal + hallTotal;
    const discountedAmount = (discount / 100) * totalBeforeDiscount;
    // Áp dụng giảm giá
    const total = totalBeforeDiscount - discountedAmount;

    return total;
  };

  const tokenFromCookie = Cookies.get("token_user");
  let id = null;
  if (tokenFromCookie) {
    const decodedToken = jwt_decode(tokenFromCookie);
    id =
      decodedToken[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ];
  }

  // Lấy ID của sảnh (hall) đã chọn
  const selectedHallIdDo =
    selectedHalls.length > 0 ? selectedHalls[0].hallId : null;

  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const storedDate = localStorage.getItem("selectedDate");
    let selectedDate = null;
    if (storedDate) {
      selectedDate = moment(storedDate, "YYYY-MM-DD").toDate();
    }

    // Đặt ngày đã lấy từ localStorage vào state
    setSelectedDate(selectedDate);
  }, []);

  const handleDateChange = (date) => {
    if (date) {
      const localDate = moment(date).tz("Asia/Ho_Chi_Minh").startOf("day");
      setSelectedDate(localDate.toDate());
      console.log("Ngày đã chọn:", localDate.format("DD/MM/YYYY"));

      // Lưu ngày đã chọn vào localStorage
      localStorage.setItem("selectedDate", localDate.format("YYYY-MM-DD"));
    } else {
      setSelectedDate(null);
      localStorage.removeItem("selectedDate");
    }
  };

  const total = calculateTotalPrice();
  const orderDataPaymentWallet = {
    UserId: id,
    BranchId: selectedBranch ? selectedBranch.branchId : null,
    HallId: selectedHallIdDo,
    OrderMenus: selectedMenus.map((menuId) => ({
      Quantity: 0,
      MenuID: menuId,
    })),
    OrderServices: selectedServices.map((serviceId) => ({
      Price: 0,
      Quantity: 0,
      ServiceID: serviceId,
    })),
    AttendanceDate: moment(selectedDate).format("YYYY-MM-DD"),
    Total: total, // tổng tiền cần thanh toán sau khi dùng mã giảm
    FullName: fullName,
    PhoneNumber: phoneNumber,
    Note: note,
    InvoiceCodeRequest: selectedCodes.map((codeId) => ({
      CodeId: codeId,
    })),
    TotalBeforeDiscount: totalBeforeDiscount, // tiền gốc khi chưa dùng mã giảm
    TimeHall: selectedValue,
    PaymentWallet: true,
    DepositPayment: total / 2,
  };

  const saveOrderDataToLocalStorage = () => {
    const orderData = {
      UserId: id, // ID người dùng đang đăng nhập
      BranchId: selectedBranch ? selectedBranch.branchId : null, // ID chi nhánh đã chọn
      HallId: selectedHallIdDo, // ID của sảnh đã chọn
      OrderMenus: selectedMenus.map((menuId) => ({
        Price: 0,
        Quantity: 0,
        MenuID: menuId,
      })),
      OrderServices: selectedServices.map((serviceId) => ({
        Price: 0,
        Quantity: 0,
        ServiceID: serviceId,
      })),
      AttendanceDate: moment(selectedDate).format("YYYY-MM-DD"),
      Total: total, // tổng tiền cần thanh toán đặt cọc sau khi có dùng mã giảm
      FullName: fullName,
      PhoneNumber: phoneNumber,
      Note: note,
      InvoiceCodeRequest: selectedCodes.map((codeId) => ({
        CodeId: codeId,
      })),
      TotalBeforeDiscount: totalBeforeDiscount,
      TimeHall: selectedValue,
      DepositPayment: total / 2,
    };

    localStorage.setItem("orderData", JSON.stringify(orderData));
  };

  const sendOrderData = () => {
    setIsProcessingPaymentWallet(true);
    fetch("https://localhost:7296/api/invoice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderDataPaymentWallet),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Đã gửi đơn hàng thành công:", data);
        toast.success("Thanh toán thành công!", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        afterPaymentCoint();
        closeModalPaymentCoin();
        setIsProcessingPaymentWallet(false);
        setIsCheckOrder(false);
        setCheckOrder(false);
      })
      .catch((error) => {
        console.error("Lỗi khi gửi đơn hàng:", error);
        toast.error("Thanh toán thất bại. Vui lòng thử lại sau.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setIsProcessingPaymentWallet(false);
        setIsCheckOrder(false);
        setCheckOrder(false);
      });
  };

  function formatPrice(price) {
    const formattedPrice = price.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
    return formattedPrice;
  }

  const [bookedHalls, setBookedHalls] = useState([]);
  const fetchBookedHalls = async () => {
    try {
      const response = await fetch(
        `https://localhost:7296/api/invoice/booked-hall`
      );
      if (response.ok) {
        const data = await response.json();

        // Sắp xếp danh sách theo BookingDate tăng dần
        data.sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate));

        setBookedHalls(data);
      } else {
        console.error("Lỗi khi lấy danh sách sảnh đã đặt");
      }
    } catch (error) {
      console.error("Lỗi server:", error);
    }
  };

  useEffect(() => {
    fetchBookedHalls();
  }, []);

  const [showModalConfirmOrder, setShowModalConfirmOrder] = useState(false);

  const openModalConfirmOrder = () => {
    setShowModalConfirmOrder(true);
  };
  const closeModalConfirmOrder = () => {
    setShowModalConfirmOrder(false);
    setCheckOrder(false);
    setIsCheckOrder(false);
  };
  const [showModal, setShowModal] = useState(false);

  // mở modal
  const openModal = () => {
    setShowModal(true);
  };

  const [searchDate, setSearchDate] = useState("");

  const handleSearchDateChange = (event) => {
    setSearchDate(event.target.value);
  };

  const filteredHalls = bookedHalls.filter((hall) => {
    const formattedDate = format(new Date(hall.bookingDate), "dd/MM/yyyy");
    return formattedDate.includes(searchDate);
  });

  const [timeOfDayList, setTimeOfDayList] = useState([]);
  useEffect(() => {
    if (selectedHallIdDo) {
      setLoading(true);
      fetch(
        `https://localhost:7296/api/time/get-hall-id?hallId=${selectedHallIdDo}`
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          setTimeOfDayList(data);
        })
        .catch((error) => { });
    }
  }, [selectedHallIdDo]);

  useEffect(() => {
    const storedSelectedValue = localStorage.getItem("selectedValue");
    if (storedSelectedValue) {
      setSelectedValue(storedSelectedValue);
    }
  }, []);

  const handleSelectChange = async (e) => {
    const value = e.target.value;
    setSelectedValue(value);
    localStorage.setItem("selectedValue", value);

    const duplicateCheckRequest = {
      AttendanceDate: moment(selectedDate).format("YYYY-MM-DD"),
      BranchId: selectedBranch ? selectedBranch.branchId : null, // ID của chi nhánh đã chọn
      HallId: selectedHallIdDo,
      TimeHall: value,
    };
    const response = await fetch(
      "https://localhost:7296/api/invoice/checked",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(duplicateCheckRequest),
      }
    );
    if (response.status === 400) {
      // Hóa đơn trùng lặp
      const data = await response.json();
      setIsDuplicateInvoice(true);
      toast.error(data.message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      setCheckOrder(false);
      setIsCheckOrder(false);
    } else {
      toast.success("Chọn buổi đến tham dự thành công", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const [branches, setBranches] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedBranchIdSuggest, setSelectedBranchIdSuggest] = useState(null);
  const [selectedHallIdSuggest, setSelectedHallIdSuggest] = useState(null);
  const [weddingHalls, setWeddingHalls] = useState([]);
  const [refresh, setRefresh] = useState(false);
  useEffect(() => {
    fetch("https://localhost:7296/api/ApiBranch")
      .then((response) => response.json())
      .then((data) => setBranches(data))
      .catch((error) =>
        console.error("Lỗi khi tải danh sách chi nhánh:", error)
      );
    fetchWallet();
  }, []);

  useEffect(() => {
    if (selectedBranchIdSuggest) {
      fetch(
        `https://localhost:7296/api/get-hall-by-branchid/${selectedBranchIdSuggest}`
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => setWeddingHalls(data))
        .catch((error) =>
          console.error("Lỗi khi tải danh sách sảnh cưới:", error)
        );
    } else {
      setWeddingHalls([]);
    }
  }, [selectedBranchIdSuggest]);

  const uniqueAddresses = [
    ...new Set(branches.map((branch) => branch.address)),
  ];

  const filteredBranches = selectedAddress
    ? branches.filter((branch) => branch.address === selectedAddress)
    : [];

  const handleAddressChange = (event) => {
    setSelectedAddress(event.target.value);
    setSelectedBranchIdSuggest(null);
  };

  const handleCheckboxChange = (branchId) => {
    setSelectedBranchIdSuggest(branchId);

    setSelectedHallId(null);
    setSelectedHallIndex(null);
    setSelectedHalls([]);
    setSelectedHallIdSuggest([]);
  };

  const handleHallSuggestCheckboxChange = (hallId) => {
    setSelectedHallIdSuggest(hallId);
    console.log("selectedHallIdSuggest:", selectedHallIdSuggest);
  };

  const handleNumberOfTablesChange = (event) => {
    setNumberOfTables(event.target.value);
  };

  const handleReset = () => {
    setCost(0);

    fetch(
      `https://localhost:7296/api/get-hall-by-branchid/${selectedBranchIdSuggest}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => setWeddingHalls(data))
      .catch((error) =>
        console.error("Lỗi khi tải danh sách sảnh cưới:", error)
      );
  };
  const submitSuggest = () => {
    // lọc
    if (selectedBranchIdSuggest && cost !== null) {
      const apiUrl = `https://localhost:7296/api/getsuggesthall/${selectedBranchIdSuggest}/${numberOfTables}/${cost}`;
      fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => setWeddingHalls(data))
        .catch((error) =>
          console.error("Error fetching wedding halls:", error)
        );
    }
  };

  const acceptSuggest = () => {
    // chấp nhận gợi ý
    if (selectedBranchIdSuggest && selectedHallIdSuggest != null) {
      setSelectedBranchId(selectedBranchIdSuggest);
      localStorage.setItem("selectedBranchId", selectedBranchIdSuggest);

      setSelectedHallId(selectedHallIdSuggest);
      localStorage.setItem("selectedHallId", selectedHallIdSuggest);
      const selectedHall = halls.find(
        (hall) => hall.hallId === selectedHallIdSuggest
      );

      if (selectedHall) {
        toast.info("Đã lưu đơn hàng dựa theo gợi ý khách hàng.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        const updatedHalls = [selectedHall];
        setSelectedHalls(updatedHalls);
        localStorage.setItem("selectedHalls", JSON.stringify(updatedHalls));
      }
    }
  };
  const [wallet, setWallet] = useState(null);

  const [showModalPaymentWallet, setShowModalPaymentWallet] = useState(false);

  const openModalPaymentCoin = () => {
    if (checkOrder) {
      setShowModalPaymentWallet(true);
      fetchWallet();
      afterPaymentCoint();
    } else {
      toast.error("Vui lòng kiểm tra đơn hàng!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };
  const closeModalPaymentCoin = () => {
    fetchWallet();
    setShowModalPaymentWallet(false);
  };

  const fetchWallet = async () => {
    try {
      const response = await fetch(
        `https://localhost:7296/api/wallet/${id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch wallet info");
      }
      const data = await response.json();
      setWallet(data);
    } catch (error) {
      console.error("Error fetching wallet info:", error);
    }
  };

  const [paymentCoin, setPaymentCoin] = useState([]);
  function afterPaymentCoint() {
    if (wallet != null) {
      var coin = wallet.coin;
      var orderTolal = total / 2;
      if (coin - orderTolal < 0) {
        setPaymentCoin("Không đủ số dư");
      } else {
        setPaymentCoin(coin - orderTolal);
      }
    }
  }

  const handlePaymentWalletOrderData = () => {
    sendOrderData();
  };

  const [showOrderModal, setShowOrderModal] = useState(false);

  return (
    <div className="bill">
      <div
        className="bill-page"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div className="bill-form-container display-flex justify-content-center align-items-center">
          <h1 className="title">Đơn Hàng</h1>
          <form>
            <Accordion>
              <Accordion.Item eventKey="0">
                <Accordion.Header>Chi Nhánh</Accordion.Header>
                <Accordion.Body className="body">
                  {branchs.map((branch, index) => (
                    <Card className="menu-card" key={index} style={{ width: "18rem" }}>
                      <Card.Img
                        className="image-fixed-height"
                        variant="top"
                        src={branch.image}
                      />
                      <Card.Body>
                        <Card.Title>{branch.name}</Card.Title>
                        <Card.Text>Mô tả: {branch.description}</Card.Text>
                        <Card.Text>Địa chỉ: {branch.address}</Card.Text>
                        <Card.Text>SDT: {branch.phone}</Card.Text>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            value=""
                            id={`flexCheckDefault-${index}`}
                            checked={branch.branchId === selectedBranchId}
                            onChange={() =>
                              handleBranchCheckboxChange(branch.branchId)
                            }
                          />
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </Accordion.Body>
              </Accordion.Item>
              {/* =================Sảnh Cưới=========== */}
              <Accordion.Item eventKey="1">
                <Accordion.Header>Sảnh Cưới</Accordion.Header>
                <Accordion.Body className="body">
                  {hallsByBranch.length > 0 ? (
                    hallsByBranch.map((hall, index) => (
                      <Card className="menu-card" key={index} style={{ width: "18rem" }}>
                        <Card.Img
                          className="image-fixed-height"
                          variant="top"
                          src={hall.image}
                        />
                        <Card.Body>
                          <Card.Title>{hall.name}</Card.Title>
                          <Card.Text>Sức chứa: {hall.capacity}</Card.Text>
                          <Card.Text>
                            Giá sảnh: {formatPrice(hall.price)}
                          </Card.Text>
                          <Card.Text>
                            Thuộc chi nhánh: {hall.branchName}
                          </Card.Text>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              value=""
                              id={`flexCheckHall-${index}`}
                              checked={hall.hallId === selectedHallId}
                              onChange={() =>
                                handleHallCheckboxChange(hall.hallId)
                              }
                            />
                          </div>
                        </Card.Body>
                      </Card>
                    ))
                  ) : (
                    <div className="no-halls-message">
                      <i className="fas fa-info-circle" style={{ fontSize: '24px', marginBottom: '10px', color: '#666' }}></i>
                      <p>Không có sảnh cưới nào trong chi nhánh này</p>
                    </div>
                  )}
                </Accordion.Body>
              </Accordion.Item>
              <h1 className="title section-title">Thực đơn</h1>

              {Object.entries(categorizedMenus).map(
                ([categoryName, categoryMenus]) => (
                  <Accordion.Item key={categoryName} eventKey={categoryName}>
                    <Accordion.Header>{categoryName}</Accordion.Header>
                    <Accordion.Body className="body">
                      {categoryMenus.map((menu) => (
                        <Card className="menu-card" key={menu.menuId} style={{ width: "18rem" }}>
                          <Card.Img
                            className="image-fixed-height"
                            variant="top"
                            src={menu.image}
                          />
                          <Card.Body>
                            <Card.Title>{menu.name}</Card.Title>
                            <Card.Text>{menu.description}</Card.Text>
                            <Card.Text>{menu.categoryName}</Card.Text>
                            <Card.Text>{formatPrice(menu.price)}</Card.Text>

                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                value=""
                                id={`flexCheckDefault-${menu.menuId}`}
                                checked={selectedMenus.includes(menu.menuId)}
                                onChange={() =>
                                  handleMenuCheckboxChange(menu.menuId)
                                }
                              />
                            </div>
                          </Card.Body>
                        </Card>
                      ))}
                    </Accordion.Body>
                  </Accordion.Item>
                )
              )}

              <h1 className="title section-title">Dịch vụ</h1>

              {Object.entries(categorizedServices).map(
                ([categoryName, categoryServices]) => (
                  <Accordion.Item key={categoryName} eventKey={categoryName}>
                    <Accordion.Header>{categoryName}</Accordion.Header>
                    <Accordion.Body className="body">
                      {categoryServices.map((service) => (
                        <Card className="menu-card" key={service.serviceId} style={{ width: "18rem" }}>
                          <Card.Img
                            className="image-fixed-height"
                            variant="top"
                            src={service.image}
                          />
                          <Card.Body>
                            <Card.Title>{service.name}</Card.Title>
                            <Card.Text>{formatPrice(service.price)}</Card.Text>

                            <Card.Text>{service.description}</Card.Text>

                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                value=""
                                id={`flexCheckDefault-${service.serviceId}`}
                                checked={selectedServices.includes(
                                  service.serviceId
                                )}
                                onChange={() =>
                                  handleServiceCheckboxChange(service.serviceId)
                                }
                              />
                            </div>
                          </Card.Body>
                        </Card>
                      ))}
                    </Accordion.Body>
                  </Accordion.Item>
                )
              )}
              <h1
                style={{ fontSize: "2rem", marginTop: "20px" }}
                className="title"
              >
                Thông tin người đặt
              </h1>
              <div style={{ marginTop: "20px" }} className="mb-2">
                <label>Họ và tên:</label>
                <input
                  className="form-control custom-input"
                  type="text"
                  value={fullName}
                  onChange={handleFullNameChange}
                  placeholder="Họ và tên"
                />
              </div>

              <div className="mb-2">
                <label>Số điện thoại:</label>
                <input
                  className="form-control custom-input"
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  placeholder="Số điện thoại"
                />
              </div>

              <div className="mb-2">
                <label>Ghi chú cho nhà hàng:</label>
                <textarea
                  className="form-control custom-input"
                  value={note}
                  onChange={handleNoteChange}
                  placeholder="Ghi chú nếu có"
                />
              </div>

              <div className="mb-2">
                <label>Ngày đến tham dự: </label>
                <DatePicker
                  className="custom-date-picker"
                  selected={selectedDate}
                  onChange={handleDateChange}
                  dateFormat="dd/MM/yyyy" // Định dạng ngày tháng
                  isClearable // Cho phép xóa ngày
                  showYearDropdown // Hiển thị dropdown năm
                  showMonthDropdown // Hiển thị dropdown tháng
                  dropdownMode="select" // Chế độ dropdown
                  placeholderText="Chọn ngày" // Văn bản mặc định
                />
              </div>
              <div className="mb-2 mt-3">
                <label htmlFor="selectTimeOfDay">Chọn ca: </label>
                <select
                  style={{
                    border: "1px solid #d4d4d4",
                    marginLeft: "8px",
                    borderRadius: "2px",
                    padding: "9px",
                  }}
                  id="selectTimeOfDay"
                  onChange={handleSelectChange}
                  value={selectedValue}
                >
                  <option value="" disabled>
                    -- Chọn ca --
                  </option>
                  {timeOfDayList.map((timeOfDay) => (
                    <React.Fragment key={timeOfDay.id}>
                      {timeOfDay.morning && (
                        <option value={`Ca sáng: ${timeOfDay.morning}`}>
                          Buổi sáng: {timeOfDay.morning}
                        </option>
                      )}
                      {timeOfDay.afternoon && (
                        <option value={`Ca chiều: ${timeOfDay.afternoon}`}>
                          Buổi chiều: {timeOfDay.afternoon}
                        </option>
                      )}
                      {timeOfDay.dinner && (
                        <option value={`Ca tối: ${timeOfDay.dinner}`}>
                          Buổi tối: {timeOfDay.dinner}
                        </option>
                      )}
                    </React.Fragment>
                  ))}
                </select>
              </div>
            </Accordion>
            <div>
            </div>

            <button
              type="button"
              style={{ marginTop: "20px" }}
              className="btn btn-success"
              onClick={() => openModalConfirmOrder()}
            >
              Xác nhận đặt nhà hàng
            </button>
            <button
              style={{ float: "right", marginTop: "20px" }}
              type="button"
              onClick={() => openModal()}
              className="btn btn-secondary"
            >
              Xem danh sách sảnh đã được đặt trước
            </button>
          </form>
        </div>

        <Modal
          scrollable
          show={showModal}
          onHide={() => setShowModal(false)}
          size="xl"
          dialogClassName="modal-100w"
        >
          <Modal.Header closeButton>
            <Modal.Title>Danh sách sảnh đã có người đặt</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div style={{ marginBottom: "20px" }}>
              <label htmlFor="searchDate">Tìm kiếm ngày:</label>
              <input
                type="text"
                id="searchDate"
                value={searchDate}
                onChange={handleSearchDateChange}
                className="form-control"
              />
            </div>
            <div className="row">
              {filteredHalls.map((hall) => (
                <div key={hall.HallId} className="col-md-4 mb-4">
                  <div className="card shadow-sm">
                    <div
                      className="card-header bg-primary text-white"
                      style={{
                        background:
                          "linear-gradient(90deg, #FE8E5C 0%, #F5576C 100%)",
                      }}
                    >
                      <h5 className="mb-0" style={{ textAlign: "center" }}>
                        {hall.hallName}
                      </h5>
                    </div>
                    <div className="card-body">
                      <h6 className="card-subtitle mb-2 text-muted">
                        Chi nhánh: {hall.branchName}
                      </h6>
                      <p className="card-text">
                        Ngày đặt:{" "}
                        {format(new Date(hall.bookingDate), "dd/MM/yyyy")}
                      </p>
                      <span
                        className="card-subtitle mb-2"
                        style={{
                          padding: "5px",
                          borderRadius: "4px",
                          backgroundColor: "#7ebc9a",
                          color: "white",
                        }}
                      >
                        {hall.timeHall}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Đóng
            </Button>
          </Modal.Footer>
        </Modal>
        <Button
          onClick={() => setShowOrderModal(true)}
          className="view-order-button"
          style={{ position: "fixed", bottom: "90px", right: "0", zIndex: 1000 }}
        >
          <i className="fas fa-shopping-cart" style={{ marginRight: '8px' }}></i>
          Xem đơn hàng
        </Button>

        <Modal 
          show={showOrderModal}
          onHide={() => setShowOrderModal(false)}
          dialogClassName="order-modal"
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title className="order-title">
              <i className="fas fa-shopping-cart" style={{ marginRight: '10px' }}></i>
              Chi tiết đơn hàng
            </Modal.Title>
          </Modal.Header>
          
          <Modal.Body className="order-content">
            {selectedBranch && (
              <div className="order-section">
                <h3 className="section-title">
                  <i className="fas fa-building" style={{ marginRight: '8px' }}></i>
                  Chi nhánh đã chọn
                </h3>
                <div className="branch-card">
                  <img src={selectedBranch.image} alt={selectedBranch.name} />
                  <h4>{selectedBranch.name}</h4>
                </div>
              </div>
            )}

            {selectedHalls.length > 0 && (
              <div className="order-section">
                <h3 className="section-title">
                  <i className="fas fa-home" style={{ marginRight: '8px' }}></i>
                  Sảnh cưới đã chọn
                </h3>
                {selectedHalls.map((hall, index) => (
                  <div className="hall-card" key={index}>
                    <img src={hall.image} alt={hall.name} />
                    <div className="hall-info">
                      <h4>{hall.name}</h4>
                      <p className="price">{formatPrice(hall.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="order-section">
              <h3 className="section-title">
                <i className="fas fa-utensils" style={{ marginRight: '8px' }}></i>
                Danh sách món ăn đã chọn
              </h3>
              {selectedMenus.length > 0 ? (
                <div className="menu-list">
                  {selectedMenus.map((menuId, index) => {
                    const selectedMenu = menus.find(menu => menu.menuId === menuId);
                    return (
                      <div className="menu-item" key={index}>
                        <img src={selectedMenu.image} alt={selectedMenu.name} />
                        <div className="menu-info">
                          <h4>{selectedMenu.name}</h4>
                          <p className="price">{formatPrice(selectedMenu.price)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="empty-message">Chưa chọn món ăn</p>
              )}
            </div>

            <div className="order-section">
              <h3 className="section-title">
                <i className="fas fa-concierge-bell" style={{ marginRight: '8px' }}></i>
                Dịch vụ đã chọn
              </h3>
              {selectedServices.length > 0 ? (
                <div className="service-list">
                  {selectedServices.map((serviceId) => {
                    const selectedService = services.find(service => service.serviceId === serviceId);
                    return (
                      <div className="service-item" key={serviceId}>
                        <img src={selectedService.image} alt={selectedService.name} />
                        <div className="service-info">
                          <h4>{selectedService.name}</h4>
                          <p className="price">{formatPrice(selectedService.price)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="empty-message">Chưa chọn dịch vụ</p>
              )}
            </div>

            <div className="order-total">
              <h3>Tổng tiền</h3>
              <p className="total-amount">{formatPrice(calculateTotalPrice())}</p>
            </div>
          </Modal.Body>
        </Modal>

        <Modal
          scrollable
          size="lg"
          centered
          show={showModalConfirmOrder}
          onHide={closeModalConfirmOrder}
          className="confirm-order-modal"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <i className="fas fa-clipboard-check" style={{ marginRight: '10px', color: '#27ae60' }}></i>
              Xác nhận đặt nhà hàng
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="confirm-order-content">
              <div className="order-check-section">
                <Button
                  onClick={handleFormSubmit}
                  className={`check-order-button ${isCheckOrder ? 'checked' : ''}`}
                >
                  {isCheckOrder ? (
                    <>
                      <FontAwesomeIcon icon={faCheckCircle} className="check-icon" />
                      <span>Kiểm tra thành công</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-search" style={{ marginRight: '8px' }}></i>
                      Kiểm tra đơn hàng
                    </>
                  )}
                </Button>
              </div>

              <div className="payment-section">
                <div className="payment-header">
                  <i className="fas fa-money-bill-wave"></i>
                  <h4>Thanh toán đặt cọc 50%</h4>
                </div>
                
                <div className="payment-methods">
                  <Button
                    className="payment-button online-payment"
                    onClick={demoPayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-credit-card"></i>
                        Thanh toán online
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModalConfirmOrder}>
              <i className="fas fa-times"></i> Đóng
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal
          scrollable
          size="lg"
          centered
          show={showModalPaymentWallet}
          onHide={closeModalPaymentCoin}
        >
          <Modal.Header closeButton>
            <Modal.Title>Thanh toán bằng wallet coin</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ height: "200px" }}>
            {wallet ? (
              <>
                <h2>
                  Số coin trong wallet:{" "}
                  <b style={{ color: "red" }}>
                    {wallet.coin ? formatPrice(wallet.coin) : "0đ"}
                  </b>
                </h2>
                <h2>Đơn hàng có giá trị : {formatPrice(total / 2)}</h2>
                <h2>Số coin sau khi thanh toán: {formatPrice(paymentCoin)}</h2>
              </>
            ) : (
              <h2>
                <b style={{ color: "red" }}>
                  Không thể thanh toán do không có wallet
                </b>
              </h2>
            )}
          </Modal.Body>
          <Modal.Footer>
            <button
              onClick={closeModalPaymentCoin}
              className="btn btn-secondary"
            >
              Đóng
            </button>
            <Button
              className="btn btn-primary"
              onClick={handlePaymentWalletOrderData}
              disabled={isProcessingPaymentWallet}
            >
              {isProcessingPaymentWallet ? (
                <>
                  <div
                    className="spinner-border spinner-border-sm"
                    role="status"
                  >
                    <span className="visually-hidden">Đang thanh toán...</span>
                  </div>
                  <span className="ms-2">Thanh toán...</span>
                </>
              ) : (
                "Xác nhận thanh toán"
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        <Button
          onClick={openModalSuggest}
          className="btn btn-dark suggest-button"
          style={{
            padding: "10px",
            position: "fixed",
            bottom: "150px",
            right: "0",
          }}
        >
          <FaLightbulb style={{ marginRight: '8px' }} /> Gợi ý nhà hàng
        </Button>

        <Modal
          scrollable
          size="xl"
          centered
          show={showModalSuggest}
          onHide={closeModalSuggest}
          className="suggest-modal"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <i className="fas fa-lightbulb" style={{ color: '#FFC107', marginRight: '10px' }}></i>
              Gợi ý nhà hàng phù hợp
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="suggest-container">
              {/* Phần chọn địa điểm */}
              <div className="location-section">
                <label htmlFor="addressSelect" className="form-label">
                  <i className="fas fa-map-marker-alt" style={{ marginRight: '8px' }}></i>
                  Chọn địa điểm:
                </label>
                <select
                  id="addressSelect"
                  value={selectedAddress}
                  onChange={handleAddressChange}
                  className="form-select custom-select"
                >
                  <option value="" disabled>-- Chọn địa điểm --</option>
                  {uniqueAddresses.map((address, index) => (
                    <option key={index} value={address}>{address}</option>
                  ))}
                </select>
              </div>

              {selectedAddress && (
                <>
                  {/* Phần hiển thị chi nhánh */}
                  <div className="branches-grid">
                    {filteredBranches.map((branch, index) => (
                      <div className="branch-card" key={index}>
                        <div className="branch-image">
                          <img src={branch.image} alt={branch.name} />
                          <div className="branch-checkbox">
                            <input
                              type="checkbox"
                              checked={branch.branchId === selectedBranchIdSuggest}
                              onChange={() => handleCheckboxChange(branch.branchId)}
                              id={`branch-${branch.branchId}`}
                            />
                            <label htmlFor={`branch-${branch.branchId}`}></label>
                          </div>
                        </div>
                        <div className="branch-content">
                          <h4>{branch.name}</h4>
                          <p><i className="fas fa-map-marker-alt"></i> {branch.address}</p>
                          <p><i className="fas fa-phone"></i> {branch.phone}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Phần tìm kiếm nâng cao */}
                  {selectedBranchIdSuggest && (
                    <div className="advanced-search">
                      <h5 className="search-title">
                        <i className="fas fa-search" style={{ marginRight: '8px' }}></i>
                        Tìm kiếm theo yêu cầu
                      </h5>
                      
                      <div className="search-filters">
                        <div className="tables-input">
                          <label>Số lượng bàn:</label>
                          <input
                            type="number"
                            className="form-control"
                            onChange={handleNumberOfTablesChange}
                            placeholder="Nhập số lượng bàn"
                          />
                        </div>

                        <div className="cost-slider">
                          <label>Chi phí dự kiến:</label>
                          <div className="slider-container">
                            <Slider
                              min={0}
                              max={100000000}
                              step={100000}
                              value={cost}
                              onChange={handleSliderChange}
                              railStyle={{ backgroundColor: '#e9ecef' }}
                              trackStyle={{ backgroundColor: '#fe8e5c' }}
                              handleStyle={{
                                borderColor: '#fe8e5c',
                                backgroundColor: 'white'
                              }}
                            />
                            <div className="cost-display">
                              {formatPrice(cost)}
                            </div>
                          </div>
                        </div>

                        <div className="search-actions">
                          <Button 
                            className="filter-button"
                            onClick={submitSuggest}
                          >
                            <i className="fas fa-filter"></i> Lọc kết quả
                          </Button>
                          <Button 
                            className="reset-button"
                            onClick={handleReset}
                          >
                            <i className="fas fa-undo"></i> Xóa lọc
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Phần hiển thị sảnh cưới */}
                  {selectedBranchIdSuggest && (
                    <div className="halls-section">
                      <h5 className="halls-title">Danh sách sảnh cưới phù hợp</h5>
                      <div className="halls-grid">
                        {weddingHalls.length > 0 ? (
                          weddingHalls.map((hall, index) => (
                            <div className="hall-card" key={index}>
                              <div className="hall-image">
                                <img src={hall.image} alt={hall.name} />
                                <div className="hall-checkbox">
                                  <input
                                    type="checkbox"
                                    checked={hall.hallId === selectedHallIdSuggest}
                                    onChange={() => handleHallSuggestCheckboxChange(hall.hallId)}
                                    id={`hall-${hall.hallId}`}
                                  />
                                  <label htmlFor={`hall-${hall.hallId}`}></label>
                                </div>
                              </div>
                              <div className="hall-content">
                                <h6>{hall.name}</h6>
                                <p className="hall-price">
                                  <i className="fas fa-tag"></i> {formatPrice(hall.price)}
                                </p>
                                <p className="hall-capacity">
                                  <i className="fas fa-users"></i> {hall.capacity} bàn
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="no-halls">
                            <i className="fas fa-exclamation-circle"></i>
                            <p>Không có sảnh nào phù hợp với tiêu chí tìm kiếm.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Nút chấp nhận gợi ý */}
                  <div className="accept-suggestion">
                    <Button 
                      className="accept-button"
                      onClick={acceptSuggest}
                    >
                      <i className="fas fa-check-circle"></i>
                      Chấp nhận gợi ý từ nhà hàng
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default Bill;