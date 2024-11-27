import React, { useState, useEffect } from "react";
import { Row, Col, Card, CardBody, Button, Table } from "reactstrap";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import ReactPaginate from "react-paginate";
import { invoiceApi } from "../../api/invoice";
import { Accordion, Card as BCard } from "react-bootstrap";

const Invoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [detailModal, setDetailModal] = useState(false);
    const [updateStatusModal, setUpdateStatusModal] = useState(false);
    const [successModal, setSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [editModal, setEditModal] = useState(false);
    const [branches, setBranches] = useState([]);
    const [halls, setHalls] = useState([]);
    const [menus, setMenus] = useState([]);
    const [services, setServices] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [selectedHall, setSelectedHall] = useState(null);
    const [selectedMenus, setSelectedMenus] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);

    useEffect(() => {
        fetchInvoices();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [branchesRes, hallsRes, menusRes, servicesRes] =
                    await Promise.all([
                        fetch("https://localhost:7296/api/ApiBranch"),
                        fetch("https://localhost:7296/api/hall"),
                        fetch("https://localhost:7296/api/menu"),
                        fetch("https://localhost:7296/api/service"),
                    ]);

                const branchesData = await branchesRes.json();
                const hallsData = await hallsRes.json();
                const menusData = await menusRes.json();
                const servicesData = await servicesRes.json();

                setBranches(branchesData);
                setHalls(hallsData);
                setMenus(menusData);
                setServices(servicesData);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const data = await invoiceApi.getAll();
            setInvoices(data);
        } catch (error) {
            setError("Lỗi khi tải danh sách hóa đơn");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (event) => {
        const term = event.target.value.toLowerCase();
        setSearchTerm(term);
        const filteredResults = invoices.filter(
            (invoice) =>
                invoice.user?.email.toLowerCase().includes(term) ||
                invoice.invoiceID.toString().includes(term)
        );
        setSearchResults(filteredResults);
    };

    const handleViewDetail = async (invoiceId) => {
        try {
            const data = await invoiceApi.getById(invoiceId);
            setSelectedInvoice(data);
            setDetailModal(true);
        } catch (error) {
            console.error("Error fetching invoice details:", error);
        }
    };

    const handleUpdateStatus = async () => {
        try {
            setLoading(true);
            await invoiceApi.updateStatus(selectedInvoice.invoiceID, {
                paymentStatus: selectedInvoice.paymentStatus,
                orderStatus: selectedInvoice.orderStatus,
            });
            setSuccessMessage("Cập nhật trạng thái thành công!");
            setSuccessModal(true);
            setUpdateStatusModal(false);
            fetchInvoices();
        } catch (error) {
            setError(
                error.response?.data?.message || "Lỗi khi cập nhật trạng thái"
            );
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString("vi-VN");
    };

    const formatCurrency = (amount) => {
        return amount?.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
        });
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case "Đã hủy đơn hàng":
                return "badge bg-danger";
            case "Hoàn tất thanh toán":
                return "badge bg-success";
            case "Đã đặt cọc":
                return "badge bg-warning text-dark";
            default:
                return "badge bg-secondary";
        }
    };

    const itemsPerPage = 10;
    const pageCount = Math.ceil(invoices.length / itemsPerPage);
    const displayItems = searchTerm
        ? searchResults
        : invoices.slice(
              currentPage * itemsPerPage,
              (currentPage + 1) * itemsPerPage
          );

    const handleEdit = (invoice) => {
        setSelectedInvoice(invoice);
        setSelectedBranch(invoice.branch);
        setSelectedHall(invoice.hall);
        setSelectedMenus(invoice.orderMenus.map((om) => om.menuId));
        setSelectedServices(invoice.orderServices.map((os) => os.serviceId));
        setEditModal(true);
    };

    const handleSaveEdit = async () => {
        try {
            setLoading(true);
            const updatedInvoice = {
                ...selectedInvoice,
                branchId: selectedBranch.branchId,
                hallId: selectedHall.hallId,
                orderMenus: selectedMenus.map((menuId) => ({
                    menuId: menuId,
                })),
                orderServices: selectedServices.map((serviceId) => ({
                    serviceId: serviceId,
                })),
            };

            const response = await fetch(
                `https://localhost:7296/api/invoice/${selectedInvoice.invoiceID}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(updatedInvoice),
                }
            );

            if (response.ok) {
                setSuccessMessage("Cập nhật hóa đơn thành công!");
                setSuccessModal(true);
                setEditModal(false);
                fetchInvoices();
            } else {
                throw new Error("Failed to update invoice");
            }
        } catch (error) {
            setError("Lỗi khi cập nhật hóa đơn");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header mb-4">
                <Row>
                    <Col>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h2 className="page-title">
                                    <i className="bi bi-receipt me-2"></i>
                                    Quản lý hóa đơn
                                </h2>
                                <p className="text-muted">
                                    Quản lý thông tin hóa đơn và trạng thái
                                    thanh toán
                                </p>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>

            <Row>
                <Col lg="12">
                    <Card className="main-card">
                        <CardBody>
                            <div className="d-flex justify-content-between mb-4">
                                <div className="search-box">
                                    <i className="bi bi-search search-icon"></i>
                                    <input
                                        className="form-control search-input"
                                        placeholder="Tìm kiếm theo email hoặc mã hóa đơn"
                                        value={searchTerm}
                                        onChange={handleSearch}
                                    />
                                </div>
                            </div>

                            {loading ? (
                                <div className="loading-container">
                                    <div
                                        className="spinner-border text-primary"
                                        role="status"
                                    >
                                        <span className="visually-hidden">
                                            Đang tải...
                                        </span>
                                    </div>
                                    <div className="loading-text">
                                        Đang tải dữ liệu...
                                    </div>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <Table className="table-hover">
                                        <thead>
                                            <tr>
                                                <th>Mã HĐ</th>
                                                <th>Khách hàng</th>
                                                <th>Ngày đặt</th>
                                                <th>Ngày tổ chức</th>
                                                <th>Tổng tiền</th>
                                                <th>Trạng thái</th>
                                                <th>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {displayItems.map((invoice) => (
                                                <tr key={invoice.invoiceID}>
                                                    <td>
                                                        #{invoice.invoiceID}
                                                    </td>
                                                    <td>
                                                        <div className="item-name">
                                                            {invoice.user.email}
                                                        </div>
                                                        <div className="item-description">
                                                            <i className="bi bi-telephone me-1"></i>
                                                            {
                                                                invoice.user
                                                                    .phoneNumber
                                                            }
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {formatDate(
                                                            invoice.invoiceDate
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div>
                                                            {formatDate(
                                                                invoice.attendanceDate
                                                            )}
                                                        </div>
                                                        <div className="text-muted">
                                                            {invoice.timeHall}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="item-price">
                                                            {formatCurrency(
                                                                invoice.total
                                                            )}
                                                        </div>
                                                        <div className="text-muted">
                                                            Đã cọc:{" "}
                                                            {formatCurrency(
                                                                invoice.depositPayment
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={getStatusBadgeClass(
                                                                invoice.orderStatus
                                                            )}
                                                            style={{
                                                                padding:
                                                                    "8px 12px",
                                                                fontSize:
                                                                    "0.875rem",
                                                                display:
                                                                    "inline-flex",
                                                                alignItems:
                                                                    "center",
                                                                whiteSpace:
                                                                    "nowrap",
                                                                fontWeight:
                                                                    "500",
                                                            }}
                                                        >
                                                            <i
                                                                className={`bi ${
                                                                    invoice.orderStatus ===
                                                                    "Đã hủy đơn hàng"
                                                                        ? "bi-x-circle-fill"
                                                                        : invoice.orderStatus ===
                                                                          "Hoàn tất thanh toán"
                                                                        ? "bi-check-circle-fill"
                                                                        : "bi-clock-fill"
                                                                } me-2`}
                                                            ></i>
                                                            {
                                                                invoice.orderStatus
                                                            }
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            <Button
                                                                color="info"
                                                                size="sm"
                                                                className="btn-action me-2"
                                                                onClick={() =>
                                                                    handleViewDetail(
                                                                        invoice.invoiceID
                                                                    )
                                                                }
                                                            >
                                                                <i className="bi bi-eye-fill"></i>
                                                            </Button>
                                                            <Button
                                                                color="warning"
                                                                size="sm"
                                                                className="btn-action me-2"
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        invoice
                                                                    )
                                                                }
                                                            >
                                                                <i className="bi bi-pencil-square"></i>
                                                            </Button>
                                                            <Button
                                                                color="primary"
                                                                size="sm"
                                                                className="btn-action"
                                                                onClick={() => {
                                                                    setSelectedInvoice(
                                                                        invoice
                                                                    );
                                                                    setUpdateStatusModal(
                                                                        true
                                                                    );
                                                                }}
                                                            >
                                                                <i className="bi bi-gear-fill"></i>
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            )}

                            <ReactPaginate
                                previousLabel={
                                    <i className="bi bi-chevron-left"></i>
                                }
                                nextLabel={
                                    <i className="bi bi-chevron-right"></i>
                                }
                                breakLabel={"..."}
                                pageCount={pageCount}
                                marginPagesDisplayed={2}
                                pageRangeDisplayed={5}
                                onPageChange={({ selected }) =>
                                    setCurrentPage(selected)
                                }
                                containerClassName={
                                    "pagination justify-content-center"
                                }
                                pageClassName={"page-item"}
                                pageLinkClassName={"page-link"}
                                previousClassName={"page-item"}
                                previousLinkClassName={"page-link"}
                                nextClassName={"page-item"}
                                nextLinkClassName={"page-link"}
                                breakClassName={"page-item"}
                                breakLinkClassName={"page-link"}
                                activeClassName={"active"}
                            />
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            {/* Detail Modal */}
            <Modal
                isOpen={detailModal}
                toggle={() => setDetailModal(false)}
                size="lg"
            >
                <ModalHeader toggle={() => setDetailModal(false)}>
                    Chi tiết hóa đơn #{selectedInvoice?.invoiceID}
                </ModalHeader>
                <ModalBody>
                    {selectedInvoice && (
                        <div>
                            <h5 className="mb-4">Thông tin khách hàng</h5>
                            <Row className="mb-4">
                                <Col md="6">
                                    <p>
                                        <strong>Họ tên:</strong>{" "}
                                        {selectedInvoice.user.fullName}
                                    </p>
                                    <p>
                                        <strong>Email:</strong>{" "}
                                        {selectedInvoice.user.email}
                                    </p>
                                    <p>
                                        <strong>Số điện thoại:</strong>{" "}
                                        {selectedInvoice.user.phoneNumber}
                                    </p>
                                </Col>
                                <Col md="6">
                                    <p>
                                        <strong>Ngày đặt:</strong>{" "}
                                        {formatDate(
                                            selectedInvoice.invoiceDate
                                        )}
                                    </p>
                                    <p>
                                        <strong>Ngày tổ chức:</strong>{" "}
                                        {formatDate(
                                            selectedInvoice.attendanceDate
                                        )}
                                    </p>
                                    <p>
                                        <strong>Ca:</strong>{" "}
                                        {selectedInvoice.timeHall}
                                    </p>
                                </Col>
                            </Row>

                            <h5 className="mb-4">Chi tiết đơn hàng</h5>
                            <Table bordered>
                                <thead>
                                    <tr>
                                        <th>Sản phẩm/Dịch vụ</th>
                                        <th className="text-end">Giá</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <strong>Sảnh: </strong>
                                            {selectedInvoice.hall.name}
                                            <br />
                                            <small className="text-muted">
                                                Chi nhánh:{" "}
                                                {selectedInvoice.branch.name}
                                            </small>
                                        </td>
                                        <td className="text-end">
                                            {formatCurrency(
                                                selectedInvoice.hall.price
                                            )}
                                        </td>
                                    </tr>
                                    {selectedInvoice.orderMenus.map(
                                        (menu, index) => (
                                            <tr key={`menu-${index}`}>
                                                <td>{menu.name}</td>
                                                <td className="text-end">
                                                    {formatCurrency(menu.price)}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                    {selectedInvoice.orderServices.map(
                                        (service, index) => (
                                            <tr key={`service-${index}`}>
                                                <td>{service.name}</td>
                                                <td className="text-end">
                                                    {formatCurrency(
                                                        service.price
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                    <tr>
                                        <td className="text-end">
                                            <strong>Tổng tiền:</strong>
                                        </td>
                                        <td className="text-end">
                                            {formatCurrency(
                                                selectedInvoice.totalBeforeDiscount
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="text-end">
                                            <strong>Sau giảm giá:</strong>
                                        </td>
                                        <td className="text-end">
                                            {formatCurrency(
                                                selectedInvoice.total
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="text-end">
                                            <strong>Đã cọc:</strong>
                                        </td>
                                        <td className="text-end">
                                            {formatCurrency(
                                                selectedInvoice.depositPayment
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="text-end">
                                            <strong>Còn lại:</strong>
                                        </td>
                                        <td className="text-end">
                                            {formatCurrency(
                                                selectedInvoice.total -
                                                    selectedInvoice.depositPayment
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>
                        </div>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="secondary"
                        onClick={() => setDetailModal(false)}
                    >
                        Đóng
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Update Status Modal */}
            <Modal
                isOpen={updateStatusModal}
                toggle={() => setUpdateStatusModal(false)}
            >
                <ModalHeader toggle={() => setUpdateStatusModal(false)}>
                    Cập nhật trạng thái hóa đơn
                </ModalHeader>
                <ModalBody>
                    {selectedInvoice && (
                        <div>
                            <div className="mb-3">
                                <label className="form-label">
                                    Trạng thái thanh toán
                                </label>
                                <select
                                    className="form-control"
                                    value={selectedInvoice.paymentStatus}
                                    onChange={(e) =>
                                        setSelectedInvoice({
                                            ...selectedInvoice,
                                            paymentStatus:
                                                e.target.value === "true",
                                        })
                                    }
                                >
                                    <option value={false}>
                                        Chưa thanh toán
                                    </option>
                                    <option value={true}>Đã thanh toán</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">
                                    Trạng thái đơn hàng
                                </label>
                                <select
                                    className="form-control"
                                    value={selectedInvoice.orderStatus || ""}
                                    onChange={(e) =>
                                        setSelectedInvoice({
                                            ...selectedInvoice,
                                            orderStatus: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">Đang xử lý</option>
                                    <option value="Đã hủy">Đã hủy</option>
                                </select>
                            </div>
                        </div>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="primary"
                        onClick={handleUpdateStatus}
                        disabled={loading}
                    >
                        {loading ? (
                            <span>
                                <i className="bi bi-arrow-clockwise spin me-1"></i>
                                Đang xử lý...
                            </span>
                        ) : (
                            <span>
                                <i className="bi bi-check-lg me-1"></i>
                                Cập nhật
                            </span>
                        )}
                    </Button>
                    <Button
                        color="secondary"
                        onClick={() => setUpdateStatusModal(false)}
                    >
                        Hủy
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Success Modal */}
            <Modal isOpen={successModal} toggle={() => setSuccessModal(false)}>
                <ModalBody>
                    <div className="text-center">
                        <i className="bi bi-check-circle-fill text-success display-4 mb-3"></i>
                        <p className="mb-0">{successMessage}</p>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="primary"
                        onClick={() => setSuccessModal(false)}
                    >
                        Đóng
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={editModal}
                toggle={() => setEditModal(false)}
                size="xl"
                className="edit-invoice-modal"
            >
                <ModalHeader toggle={() => setEditModal(false)}>
                    <i className="fas fa-edit me-2"></i>
                    Chỉnh sửa hóa đơn #{selectedInvoice?.invoiceID}
                </ModalHeader>
                <ModalBody>
                    {selectedInvoice && (
                        <div className="edit-form">
                            <Accordion defaultActiveKey="0">
                                <Accordion.Item eventKey="0">
                                    <Accordion.Header>
                                        Chi Nhánh
                                    </Accordion.Header>
                                    <Accordion.Body className="body">
                                        {branches.map((branch) => (
                                            <BCard
                                                className={`menu-card ${
                                                    selectedBranch?.branchId ===
                                                    branch.branchId
                                                        ? "selected"
                                                        : ""
                                                }`}
                                                key={branch.branchId}
                                                style={{ width: "18rem" }}
                                            >
                                                <BCard.Img
                                                    className="image-fixed-height"
                                                    variant="top"
                                                    src={branch.image}
                                                />
                                                <BCard.Body>
                                                    <BCard.Title>
                                                        {branch.name}
                                                    </BCard.Title>
                                                    <BCard.Text>
                                                        Mô tả:{" "}
                                                        {branch.description}
                                                    </BCard.Text>
                                                    <BCard.Text>
                                                        Địa chỉ:{" "}
                                                        {branch.address}
                                                    </BCard.Text>
                                                    <BCard.Text>
                                                        SDT: {branch.phone}
                                                    </BCard.Text>
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            checked={
                                                                selectedBranch?.branchId ===
                                                                branch.branchId
                                                            }
                                                            onChange={() =>
                                                                setSelectedBranch(
                                                                    branch
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </BCard.Body>
                                            </BCard>
                                        ))}
                                    </Accordion.Body>
                                </Accordion.Item>

                                <Accordion.Item eventKey="1">
                                    <Accordion.Header>
                                        Sảnh Cưới
                                    </Accordion.Header>
                                    <Accordion.Body className="body">
                                        {halls
                                            .filter(
                                                (hall) =>
                                                    hall.branchId ===
                                                    selectedBranch?.branchId
                                            )
                                            .map((hall) => (
                                                <BCard
                                                    className={`menu-card ${
                                                        selectedHall?.hallId ===
                                                        hall.hallId
                                                            ? "selected"
                                                            : ""
                                                    }`}
                                                    key={hall.hallId}
                                                    style={{ width: "18rem" }}
                                                >
                                                    <BCard.Img
                                                        className="image-fixed-height"
                                                        variant="top"
                                                        src={hall.image}
                                                    />
                                                    <BCard.Body>
                                                        <BCard.Title>
                                                            {hall.name}
                                                        </BCard.Title>
                                                        <BCard.Text>
                                                            Sức chứa:{" "}
                                                            {hall.capacity}
                                                        </BCard.Text>
                                                        <BCard.Text>
                                                            Giá sảnh:{" "}
                                                            {formatCurrency(
                                                                hall.price
                                                            )}
                                                        </BCard.Text>
                                                        <div className="form-check">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                checked={
                                                                    selectedHall?.hallId ===
                                                                    hall.hallId
                                                                }
                                                                onChange={() =>
                                                                    setSelectedHall(
                                                                        hall
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </BCard.Body>
                                                </BCard>
                                            ))}
                                    </Accordion.Body>
                                </Accordion.Item>

                                <Accordion.Item eventKey="2">
                                    <Accordion.Header>
                                        Thực Đơn
                                    </Accordion.Header>
                                    <Accordion.Body className="body">
                                        {menus.map((menu) => (
                                            <BCard
                                                className={`menu-card ${
                                                    selectedMenus.includes(
                                                        menu.menuId
                                                    )
                                                        ? "selected"
                                                        : ""
                                                }`}
                                                key={menu.menuId}
                                                style={{ width: "18rem" }}
                                            >
                                                <BCard.Img
                                                    className="image-fixed-height"
                                                    variant="top"
                                                    src={menu.image}
                                                />
                                                <BCard.Body>
                                                    <BCard.Title>
                                                        {menu.name}
                                                    </BCard.Title>
                                                    <BCard.Text>
                                                        {menu.description}
                                                    </BCard.Text>
                                                    <BCard.Text>
                                                        {formatCurrency(
                                                            menu.price
                                                        )}
                                                    </BCard.Text>
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            checked={selectedMenus.includes(
                                                                menu.menuId
                                                            )}
                                                            onChange={() => {
                                                                if (
                                                                    selectedMenus.includes(
                                                                        menu.menuId
                                                                    )
                                                                ) {
                                                                    setSelectedMenus(
                                                                        (
                                                                            prev
                                                                        ) =>
                                                                            prev.filter(
                                                                                (
                                                                                    id
                                                                                ) =>
                                                                                    id !==
                                                                                    menu.menuId
                                                                            )
                                                                    );
                                                                } else {
                                                                    setSelectedMenus(
                                                                        (
                                                                            prev
                                                                        ) => [
                                                                            ...prev,
                                                                            menu.menuId,
                                                                        ]
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </BCard.Body>
                                            </BCard>
                                        ))}
                                    </Accordion.Body>
                                </Accordion.Item>

                                <Accordion.Item eventKey="3">
                                    <Accordion.Header>Dịch Vụ</Accordion.Header>
                                    <Accordion.Body className="body">
                                        {services.map((service) => (
                                            <BCard
                                                className={`menu-card ${
                                                    selectedServices.includes(
                                                        service.serviceId
                                                    )
                                                        ? "selected"
                                                        : ""
                                                }`}
                                                key={service.serviceId}
                                                style={{ width: "18rem" }}
                                            >
                                                <BCard.Img
                                                    className="image-fixed-height"
                                                    variant="top"
                                                    src={service.image}
                                                />
                                                <BCard.Body>
                                                    <BCard.Title>
                                                        {service.name}
                                                    </BCard.Title>
                                                    <BCard.Text>
                                                        {service.description}
                                                    </BCard.Text>
                                                    <BCard.Text>
                                                        {formatCurrency(
                                                            service.price
                                                        )}
                                                    </BCard.Text>
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            checked={selectedServices.includes(
                                                                service.serviceId
                                                            )}
                                                            onChange={() => {
                                                                if (
                                                                    selectedServices.includes(
                                                                        service.serviceId
                                                                    )
                                                                ) {
                                                                    setSelectedServices(
                                                                        (
                                                                            prev
                                                                        ) =>
                                                                            prev.filter(
                                                                                (
                                                                                    id
                                                                                ) =>
                                                                                    id !==
                                                                                    service.serviceId
                                                                            )
                                                                    );
                                                                } else {
                                                                    setSelectedServices(
                                                                        (
                                                                            prev
                                                                        ) => [
                                                                            ...prev,
                                                                            service.serviceId,
                                                                        ]
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </BCard.Body>
                                            </BCard>
                                        ))}
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                        </div>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="primary"
                        onClick={handleSaveEdit}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span
                                    className="spinner-border spinner-border-sm me-1"
                                    role="status"
                                    aria-hidden="true"
                                ></span>
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-check-lg me-1"></i>
                                Lưu thay đổi
                            </>
                        )}
                    </Button>
                    <Button
                        color="secondary"
                        onClick={() => setEditModal(false)}
                    >
                        <i className="bi bi-x-lg me-1"></i>
                        Hủy
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default Invoices;
