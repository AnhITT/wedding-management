import React, { useState, useEffect } from "react";
import { Row, Col, Table, Card, CardTitle, CardBody, Button } from "reactstrap";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import ReactPaginate from "react-paginate";
import { invoiceApi } from "../../api/invoice";
import "../../assets/scss/paging.css";

const Invoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const data = await invoiceApi.getAll();
            setInvoices(data);
        } catch (error) {
            console.error("Error fetching invoices:", error);
            setError("Lỗi khi tải danh sách hóa đơn");
        } finally {
            setLoading(false);
        }
    };

    // Thêm các hàm xử lý và phân trang tương tự như các component khác
    // ...

    return (
        <Row>
            <Col lg="12">
                <Card>
                    <CardBody>
                        <CardTitle tag="h5">Quản lý hóa đơn</CardTitle>
                        {/* Thêm UI tương tự như các component khác */}
                    </CardBody>
                </Card>
            </Col>
        </Row>
    );
};

export default Invoices; 