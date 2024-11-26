// import React, { useState, useEffect } from "react";
// import { Row, Col, Table, Card, CardTitle, CardBody, Button } from "reactstrap";
// import { GetUserPricing } from "../../api/pricing";
// const UserPricing = () => {
//     const [items, setItems] = useState([]);
//     useEffect(() => {
//         fetchData();
//     }, []);
//     const fetchData = async () => {
//         setItems(await GetUserPricing());
//     };
//     const formatDateTime = (dateTimeString) => {
//         const dateTime = new Date(dateTimeString);
//         const formattedDateTime = dateTime.toLocaleString("en-GB", {
//             day: "numeric",
//             month: "numeric",
//             year: "numeric",
//             hour: "numeric",
//             minute: "numeric",
//             hour12: false,
//         });
//         return formattedDateTime;
//     };
//     const formatRemainingTime = (remainingTime) => {
//         const timeParts = remainingTime.split(":");
//         const days = parseInt(timeParts[0]);
//         const timeString = timeParts.slice(1).join(":");
//         const remainingTimeSpan = `${days} ${timeString}`;

//         const remainingTimeObj = {
//             days: days,
//             hours: parseInt(timeParts[1]),
//             minutes: parseInt(timeParts[2]),
//             seconds: parseFloat(timeParts[3]),
//         };

//         if (remainingTimeObj.days < 0) {
//             return "Hết hạn";
//         } else {
//             return `${remainingTimeObj.days}d ${remainingTimeObj.hours}h ${remainingTimeObj.minutes}m`;
//         }
//     };

//     return (
//         <Row>
//             <Col lg="12">
//                 <div>
//                     <Card>
//                         <CardBody>
//                             <CardTitle tag="h5">Quản lý hoá đơn</CardTitle>

//                             <Table
//                                 className="no-wrap mt-3 align-middle"
//                                 responsive
//                                 borderless
//                             >
//                                 <thead>
//                                     <tr>
//                                         <th>Username</th>
//                                         <th>Full Name</th>
//                                         <th>Start Time</th>
//                                         <th>End Time</th>
//                                         <th>Remaining Time</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {items.map((item, index) => (
//                                         <tr key={index} className="border-top">
//                                             <td> {item.userNameUser}</td>
//                                             <td> {item.fullNameUser}</td>
//                                             <td>
//                                                 {formatDateTime(item.startTime)}
//                                             </td>
//                                             <td>
//                                                 {formatDateTime(item.endTime)}
//                                             </td>
//                                             <td>
//                                                 {formatRemainingTime(
//                                                     item.remainingTime
//                                                 )}
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </Table>
//                         </CardBody>
//                     </Card>
//                 </div>
//             </Col>
//         </Row>
//     );
// };

// export default UserPricing;
