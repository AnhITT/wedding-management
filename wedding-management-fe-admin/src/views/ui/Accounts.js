import AccountManage from "../../components/dashboard/AccountManage";
import React from "react";
import { Row, Col, CardBody } from "reactstrap";

const Accounts = () => {
    return (
        <Row>
            <Col lg="12">
                <CardBody>
                    <AccountManage />
                </CardBody>
            </Col>
        </Row>
    );
};

export default Accounts;
