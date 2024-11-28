import React, { useState, useEffect } from "react";
import { Row, Col, Card, CardBody, Button, Table } from "reactstrap";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import ReactPaginate from "react-paginate";
import { invoiceApi } from "../../api/invoice";
import { Accordion, Card as BCard } from "react-bootstrap";
import "./Invoices.css";

const styles = {
    body: {
        display: "flex",
        flexWrap: "wrap",
        gap: "1rem",
        padding: "1rem",
        maxHeight: "500px",
        overflowY: "auto",
    },
    menuCard: {
        flex: "0 0 auto",
        marginBottom: "1rem",
        border: "1px solid #ddd",
        borderRadius: "8px",
        transition: "all 0.3s ease",
    },
    imageFixedHeight: {
        height: "200px",
        objectFit: "cover",
    },
    selected: {
        border: "2px solid #007bff",
        boxShadow: "0 0 10px rgba(0,123,255,0.3)",
    },
    body: {
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        padding: "1rem",
    },
    branchSection: {
        display: "flex",
        flexWrap: "wrap",
        gap: "1rem",
        marginBottom: "2rem",
    },
    hallSection: {
        display: "flex",
        flexWrap: "wrap",
        gap: "1rem",
    },
    card: {
        width: "calc(33.333% - 1rem)",
        minWidth: "300px",
        marginBottom: "1rem",
        border: "1px solid #ddd",
        borderRadius: "8px",
        transition: "all 0.3s ease",
    },
    selectedCard: {
        border: "2px solid #007bff",
        boxShadow: "0 0 10px rgba(0,123,255,0.3)",
    },
    cardImage: {
        height: "200px",
        objectFit: "cover",
        borderTopLeftRadius: "8px",
        borderTopRightRadius: "8px",
    },
    sectionTitle: {
        width: "100%",
        padding: "1rem",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        marginBottom: "1rem",
    },
    infoRow: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "0.5rem",
    },
    label: {
        fontWeight: "500",
        color: "#666",
    },
    value: {
        color: "#333",
    },
    checkboxContainer: {
        marginTop: "1rem",
        padding: "0.5rem",
        backgroundColor: "#f8f9fa",
        borderRadius: "4px",
    },
    editContainer: {
        display: "flex",
        gap: "1rem",
        padding: "1rem",
        height: "80vh",
    },
    section: {
        flex: "1",
        minWidth: "250px",
        backgroundColor: "#fff",
        borderRadius: "8px",
        border: "1px solid #dee2e6",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
    },
    sectionHeader: {
        padding: "0.75rem 1rem",
        backgroundColor: "#f8f9fa",
        borderBottom: "1px solid #dee2e6",
        borderTopLeftRadius: "8px",
        borderTopRightRadius: "8px",
    },
    sectionContent: {
        padding: "1rem",
        overflowY: "auto",
        flex: 1,
    },
    card: {
        marginBottom: "1rem",
        border: "1px solid #dee2e6",
        borderRadius: "8px",
        backgroundColor: "#fff",
    },
    selectedCard: {
        border: "2px solid #007bff",
        boxShadow: "0 0 10px rgba(0,123,255,0.3)",
    },
    cardImage: {
        height: "150px",
        width: "100%",
        objectFit: "cover",
        borderTopLeftRadius: "8px",
        borderTopRightRadius: "8px",
    },
    cardBody: {
        padding: "1rem",
    },
    infoRow: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "0.5rem",
        fontSize: "0.9rem",
    },
};

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
    const [hallsByBranch, setHallsByBranch] = useState([]);
    const [loadingHalls, setLoadingHalls] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState("");

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

                console.log("Branches data:", branchesData);
                console.log("Halls data:", hallsData);

                setBranches(branchesData);
                setHalls(hallsData);
                setMenus(await menusRes.json());
                setServices(await servicesRes.json());
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (selectedBranch) {
            console.log("Selected branch:", selectedBranch);
            const filteredHalls = halls.filter(
                (hall) => hall.branchId === selectedBranch.branchId
            );
            console.log("Filtered halls for branch:", filteredHalls);
        }
    }, [selectedBranch, halls]);

    useEffect(() => {
        const fetchHallsByBranch = async () => {
            if (selectedBranch) {
                setLoadingHalls(true);
                try {
                    const response = await fetch(
                        `https://localhost:7296/api/get-hall-by-branchid/${selectedBranch.branchId}`
                    );
                    const data = await response.json();
                    setHallsByBranch(data);
                } catch (error) {
                    console.error("Error fetching halls for branch:", error);
                    setHallsByBranch([]);
                } finally {
                    setLoadingHalls(false);
                }
            } else {
                setHallsByBranch([]);
            }
        };

        fetchHallsByBranch();
    }, [selectedBranch]);

    useEffect(() => {
        if (selectedInvoice) {
            setSelectedStatus(selectedInvoice.orderStatus);
        }
    }, [selectedInvoice]);

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
            const response = await fetch(
                `https://localhost:7296/api/invoice/${selectedInvoice.invoiceID}/updateStatus?request=${selectedStatus}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update status");
            }

            const result = await response.json();
            setSuccessMessage(result.message);
            setSuccessModal(true);
            setUpdateStatusModal(false);
            fetchInvoices(); // Refresh danh sách hóa đơn
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

    const renderBranches = () => (
        <div style={styles.section}>
            <div style={styles.sectionHeader}>
                <h6 className="mb-0">
                    <i className="bi bi-building me-2"></i>
                    Chi Nhánh
                </h6>
            </div>
            <div style={styles.sectionContent}>
                {branches.map((branch) => (
                    <div
                        key={branch.branchId}
                        style={{
                            ...styles.card,
                            ...(selectedBranch?.branchId === branch.branchId
                                ? styles.selectedCard
                                : {}),
                        }}
                    >
                        <img
                            src={branch.image}
                            style={styles.cardImage}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                    "https://via.placeholder.com/300x200?text=No+Image";
                            }}
                            alt={branch.name}
                        />
                        <div style={styles.cardBody}>
                            <h6>{branch.name}</h6>
                            <div style={styles.infoRow}>
                                <span>Địa chỉ:</span>
                                <span>{branch.address}</span>
                            </div>
                            <div className="form-check mt-2">
                                <input
                                    type="radio"
                                    className="form-check-input"
                                    checked={
                                        selectedBranch?.branchId ===
                                        branch.branchId
                                    }
                                    onChange={() => setSelectedBranch(branch)}
                                    name="branchSelection"
                                />
                                <label className="form-check-label">
                                    Chọn chi nhánh này
                                </label>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderHalls = () => (
        <div style={styles.section}>
            <div style={styles.sectionHeader}>
                <h6 className="mb-0">
                    <i className="bi bi-house-heart me-2"></i>
                    Sảnh Cưới
                </h6>
            </div>
            <div style={styles.sectionContent}>
                {!selectedBranch ? (
                    <div className="alert alert-info">
                        Vui lòng chọn chi nhánh
                    </div>
                ) : loadingHalls ? (
                    <div className="text-center">
                        <div className="spinner-border text-primary" />
                    </div>
                ) : hallsByBranch.length > 0 ? (
                    hallsByBranch.map((hall) => (
                        <div
                            key={hall.hallId}
                            style={{
                                ...styles.card,
                                ...(selectedHall?.hallId === hall.hallId
                                    ? styles.selectedCard
                                    : {}),
                            }}
                        >
                            <img
                                src={hall.image}
                                style={styles.cardImage}
                                alt={hall.name}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src =
                                        "https://via.placeholder.com/300x200?text=No+Image";
                                }}
                            />
                            <div style={styles.cardBody}>
                                <h6>{hall.name}</h6>
                                <div style={styles.infoRow}>
                                    <span>Sức chứa:</span>
                                    <span>{hall.capacity} khách</span>
                                </div>
                                <div style={styles.infoRow}>
                                    <span>Giá:</span>
                                    <span>{formatCurrency(hall.price)}</span>
                                </div>
                                <div className="form-check mt-2">
                                    <input
                                        type="radio"
                                        className="form-check-input"
                                        checked={
                                            selectedHall?.hallId === hall.hallId
                                        }
                                        onChange={() => setSelectedHall(hall)}
                                        name="hallSelection"
                                    />
                                    <label className="form-check-label">
                                        Chọn sảnh này
                                    </label>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="alert alert-warning">
                        Không có sảnh cưới
                    </div>
                )}
            </div>
        </div>
    );

    const renderMenus = () => (
        <div style={styles.section}>
            <div style={styles.sectionHeader}>
                <h6 className="mb-0">
                    <i className="bi bi-menu-button-wide me-2"></i>
                    Thực Đơn
                </h6>
            </div>
            <div style={styles.sectionContent}>
                {menus.map((menu) => (
                    <div
                        key={menu.menuId}
                        style={{
                            ...styles.card,
                            ...(selectedMenus.includes(menu.menuId)
                                ? styles.selectedCard
                                : {}),
                        }}
                    >
                        <img
                            src={menu.image}
                            style={styles.cardImage}
                            alt={menu.name}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                    "https://via.placeholder.com/300x200?text=No+Image";
                            }}
                        />
                        <div style={styles.cardBody}>
                            <h6>{menu.name}</h6>
                            <div style={styles.infoRow}>
                                <span>Mô tả:</span>
                                <span>{menu.description}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <span>Giá:</span>
                                <span>{formatCurrency(menu.price)}</span>
                            </div>
                            <div className="form-check mt-2">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={selectedMenus.includes(
                                        menu.menuId
                                    )}
                                    onChange={() => {
                                        if (
                                            selectedMenus.includes(menu.menuId)
                                        ) {
                                            setSelectedMenus(
                                                selectedMenus.filter(
                                                    (id) => id !== menu.menuId
                                                )
                                            );
                                        } else {
                                            setSelectedMenus([
                                                ...selectedMenus,
                                                menu.menuId,
                                            ]);
                                        }
                                    }}
                                />
                                <label className="form-check-label">
                                    Chọn món này
                                </label>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderServices = () => (
        <div style={styles.section}>
            <div style={styles.sectionHeader}>
                <h6 className="mb-0">
                    <i className="bi bi-gear me-2"></i>
                    Dịch Vụ
                </h6>
            </div>
            <div style={styles.sectionContent}>
                {services.map((service) => (
                    <div
                        key={service.serviceId}
                        style={{
                            ...styles.card,
                            ...(selectedServices.includes(service.serviceId)
                                ? styles.selectedCard
                                : {}),
                        }}
                    >
                        <img
                            src={service.image}
                            style={styles.cardImage}
                            alt={service.name}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                    "https://via.placeholder.com/300x200?text=No+Image";
                            }}
                        />
                        <div style={styles.cardBody}>
                            <h6>{service.name}</h6>
                            <div style={styles.infoRow}>
                                <span>Mô tả:</span>
                                <span>{service.description}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <span>Giá:</span>
                                <span>{formatCurrency(service.price)}</span>
                            </div>
                            <div className="form-check mt-2">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
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
                                                selectedServices.filter(
                                                    (id) =>
                                                        id !== service.serviceId
                                                )
                                            );
                                        } else {
                                            setSelectedServices([
                                                ...selectedServices,
                                                service.serviceId,
                                            ]);
                                        }
                                    }}
                                />
                                <label className="form-check-label">
                                    Chọn dịch vụ này
                                </label>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

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
                                                <th>Ngày t chức</th>
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
                                    Trạng thái đơn hàng
                                </label>
                                <select
                                    className="form-control"
                                    value={selectedStatus}
                                    onChange={(e) => {
                                        setSelectedStatus(e.target.value);
                                        setSelectedInvoice({
                                            ...selectedInvoice,
                                            orderStatus: e.target.value,
                                        });
                                    }}
                                >
                                    <option value="Đã đặt cọc">
                                        Đã đặt cọc
                                    </option>
                                    <option value="Đã hủy đơn hàng">
                                        Đã hủy đơn hàng
                                    </option>
                                    <option value="Hoàn tất thanh toán">
                                        Hoàn tất thanh toán
                                    </option>
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
                style={{ maxWidth: "95%", margin: "1rem auto" }}
            >
                <ModalHeader toggle={() => setEditModal(false)}>
                    <i className="bi bi-pencil-square me-2"></i>
                    Chỉnh sửa hóa đơn #{selectedInvoice?.invoiceID}
                </ModalHeader>
                <ModalBody className="p-0">
                    {selectedInvoice && (
                        <div style={styles.editContainer}>
                            {renderBranches()}
                            {renderHalls()}
                            {renderMenus()}
                            {renderServices()}
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
