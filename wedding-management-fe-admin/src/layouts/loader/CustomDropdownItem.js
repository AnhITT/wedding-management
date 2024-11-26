import React from "react";
import { DropdownItem } from "reactstrap";

const CustomDropdownItem = ({ title, details }) => (
    <>
        <DropdownItem>
            <div className="font-weight-bold">{title}</div>
            <div className="text-muted">{details}</div>
        </DropdownItem>
    </>
);

export default CustomDropdownItem;
