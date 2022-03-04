import React from "react";
import { Link } from "react-router-dom";
import { Col } from "react-bootstrap";

function PositionCard(props) {
  const { position, description, emoji, link } = props;

  return (
    <Col xs={12} sm={12} lg={6} xl={6} className="position-card-column">
      <div className="position-card">
        <div className="position-card-header">
          <div className="position-card-course">
            {emoji}&nbsp;&nbsp;&nbsp;&nbsp;{position}
          </div>
        </div>
        <div className="position-card-title">{description}</div>
        <div className="position-card-row">
          <Link className="position-card-link" to={link}>
            Apply
          </Link>
        </div>
      </div>
    </Col>
  );
}

export default PositionCard;
