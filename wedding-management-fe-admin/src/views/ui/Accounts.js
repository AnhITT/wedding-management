import AccountManage from "../../components/dashboard/AccountManage";
import React, { useState, useEffect } from "react";
import { Row, Col, Table, Card, CardTitle, CardBody } from "reactstrap";
import { GetAccountAPI } from "../../api/account";
const Accounts = () => {
    return (
        <Row>
            <Col lg="12">
                <AccountManage />
            </Col>
        </Row>
    );
};

export default Accounts;
