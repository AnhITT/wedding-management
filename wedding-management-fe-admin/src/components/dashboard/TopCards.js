import { Card, CardBody } from "reactstrap";

const TopCards = (props) => {
  return (
    <Card style={{ height: '100%' }}>
      <CardBody className="p-4">
        <div className="d-flex align-items-center">
          <div>
            <h3 className="mb-0 display-6 font-weight-bold">{props.earning}</h3>
            <div className="text-muted mt-3" style={{ fontSize: '1.1rem' }}>
              {props.title}
            </div>
            <span className={`text-${props.subtitle} fs-3 mt-2`}>
              {props.subtitle}
            </span>
          </div>
          <div className="ms-auto">
            <i className={`${props.icon} fs-1 text-muted`}></i>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default TopCards;
