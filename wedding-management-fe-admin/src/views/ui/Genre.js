// import React, { useState, useEffect } from "react";
// import { Row, Col, Table, Card, CardTitle, CardBody, Button } from "reactstrap";
// import { GetGenreAPI } from "../../api/genre";
// const Genre = () => {
//     const [items, setItems] = useState([]);
//     useEffect(() => {
//         fetchData();
//     }, []);
//     const fetchData = async () => {
//         setItems(await GetGenreAPI());
//     };

//     return (
//         <Row>
//             <Col lg="12">
//                 <div>
//                     <Card>
//                         <CardBody>
//                             <CardTitle tag="h5">Quản lý thể loại</CardTitle>
//                             <div className="row">
//                                 <div className="col-4 my-1 pt-1"></div>
//                                 <div className="col-1 "></div>
//                                 <div className="col-6 my-1 pt-1 d-flex justify-content-end">
//                                     <Button className="btn" color="success">
//                                         Add new Genre
//                                     </Button>
//                                 </div>
//                             </div>

//                             <Table
//                                 className="no-wrap mt-3 align-middle"
//                                 responsive
//                                 borderless
//                             >
//                                 <thead>
//                                     <tr>
//                                         <th>Id</th>
//                                         <th>Name</th>
//                                         <th className="text-center">Action</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {items.map((item, index) => (
//                                         <tr key={index} className="border-top">
//                                             <td> {item.id}</td>
//                                             <td> {item.name}</td>

//                                             <td className="d-flex justify-content-center action pt-4">
//                                                 <Button
//                                                     className="btn"
//                                                     color="primary"
//                                                     size="sm"
//                                                 >
//                                                     Edit
//                                                 </Button>
//                                                 <Button
//                                                     className="btn"
//                                                     color="danger"
//                                                     size="sm"
//                                                 >
//                                                     Delete
//                                                 </Button>
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

// export default Genre;
