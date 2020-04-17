import React, { PureComponent } from 'react';
import { Row, Col } from 'react-bootstrap';

import doe from '../../assets/img/images/about/group/doe.jpg';

class Join extends PureComponent {
  render() {
    const { values } = this.props;

    return (
      <div className="about">
        <div className="about-us">
          <h5>Join our Team!</h5>
          <p>
            We're a small group of student volunteers at UC Berkeley, dedicated to
            simplifying the course discovery experience. We actively build, improve
            and maintain Berkeleytime.
          </p>
        </div>
        <div className="group">
          <img src={doe} />
        </div>
        <div className="values">
          <h5>Our Values</h5>

        </div>
      </div>
    );
  }
}


export default Join;
