import { Col, Row } from "reactstrap";
import React, { useState, useEffect } from "react";
import TopCards from "../components/dashboard/TopCards";
import { dashboardApi } from "../api/dashboard";
import { Card, CardBody, CardTitle, Table } from "reactstrap";

const Starter = () => {
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await dashboardApi.getStatistics();
            setStatistics(data);
        } catch (error) {
            console.error("Error fetching statistics:", error);
            setError(
                error.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu"
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Đang tải dữ liệu...</div>;
    }

    if (error) {
        return <div className="text-danger">Lỗi: {error}</div>;
    }

    return (
        <div>
            {/***Top Cards***/}
            <Row>
                <Col sm="12" lg="4" className="mb-4">
                    <TopCards
                        bg="bg-light-success text-success"
                        title="Tổng số sảnh"
                        subtitle="Halls"
                        earning={statistics?.totalHalls}
                        icon="bi bi-door-open"
                    />
                </Col>
                <Col sm="12" lg="4" className="mb-4">
                    <TopCards
                        bg="bg-light-danger text-danger"
                        title="Tổng số chi nhánh"
                        subtitle="Branches"
                        earning={statistics?.totalBranches}
                        icon="bi bi-building"
                    />
                </Col>
                <Col sm="12" lg="4" className="mb-4">
                    <TopCards
                        bg="bg-light-warning text-warning"
                        title="Tổng số món ăn"
                        subtitle="Menus"
                        earning={statistics?.totalMenus}
                        icon="bi bi-cup-hot"
                    />
                </Col>
            </Row>
            <Row>
                <Col sm="12" lg="4" className="mb-4">
                    <TopCards
                        bg="bg-light-info text-into"
                        title="Tổng số dịch vụ"
                        subtitle="Services"
                        earning={statistics?.totalServices}
                        icon="bi bi-gear"
                    />
                </Col>
                <Col sm="12" lg="4" className="mb-4">
                    <TopCards
                        bg="bg-light-success text-success"
                        title="Tổng số người dùng"
                        subtitle="Users"
                        earning={statistics?.totalUsers}
                        icon="bi bi-people"
                    />
                </Col>
                <Col sm="12" lg="4" className="mb-4">
                    <TopCards
                        bg="bg-light-danger text-danger"
                        title="Tổng số hóa đơn"
                        subtitle="Invoices"
                        earning={statistics?.totalInvoices}
                        icon="bi bi-receipt"
                    />
                </Col>
            </Row>
            <Row>
                <Col sm="12" lg="6" className="mb-4">
                    <TopCards
                        bg="bg-light-warning text-warning"
                        title="Tổng doanh thu"
                        subtitle="Revenue"
                        earning={`${(
                            statistics?.totalRevenue || 0
                        ).toLocaleString()} VND`}
                        icon="bi bi-cash"
                    />
                </Col>
                <Col sm="12" lg="6" className="mb-4">
                    <TopCards
                        bg="bg-light-info text-into"
                        title="Tổng số đánh giá"
                        subtitle="Feedbacks"
                        earning={statistics?.totalFeedback}
                        icon="bi bi-star"
                    />
                </Col>
            </Row>

            {/* Top Halls Table */}
            <Row>
                <Col lg="12">
                    <Card>
                        <CardBody>
                            <CardTitle tag="h5">
                                Top 5 Sảnh được đặt nhiều nhất
                            </CardTitle>
                            <Table
                                className="no-wrap mt-3 align-middle"
                                responsive
                                borderless
                            >
                                <thead>
                                    <tr>
                                        <th>Tên sảnh</th>
                                        <th>Số lần đặt</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {statistics?.topHalls.map((hall) => (
                                        <tr
                                            key={hall.hallId}
                                            className="border-top"
                                        >
                                            <td>{hall.hallName}</td>
                                            <td>{hall.bookingCount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            {/* Revenue by Month Table */}
            <Row>
                <Col lg="12">
                    <Card>
                        <CardBody>
                            <CardTitle tag="h5">Doanh thu theo tháng</CardTitle>
                            <Table
                                className="no-wrap mt-3 align-middle"
                                responsive
                                borderless
                            >
                                <thead>
                                    <tr>
                                        <th>Tháng</th>
                                        <th>Doanh thu</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {statistics?.revenueByMonth.map((item) => (
                                        <tr
                                            key={item.month}
                                            className="border-top"
                                        >
                                            <td>Tháng {item.month}</td>
                                            <td>
                                                {item.revenue.toLocaleString()}{" "}
                                                VND
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Starter;
