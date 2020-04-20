import React, { PureComponent } from 'react';
import { Row, Col, ButtonToolbar } from 'react-bootstrap';
import retreat_silly from '../../assets/img/images/about/group/retreat_silly.png';
import janet_jemma from '../../assets/img/images/about/group/janet_jemma.jpg';


class Join extends PureComponent {
  render() {
    const { values } = this.props;

    return (
      <div className="about">
        <div className="about-us">
          <h5>Join the BT Team! &#9996; </h5>
          <p>
            We'll be recruiting for new team members in the fall! Sign up to hear about recruitment updates.
          </p>
        </div>
        <ButtonToolbar className="releases-heading-button join">
        <input placeholder="Your email address"></input>
          <a href="/join" role="button">
            <button className="btn btn-bt-primary btn-bt-sm">
              Sign up for Updates
            </button>
          </a>
        </ButtonToolbar>
        <img className="join-pic" src={retreat_silly} />

      </div>

    );
  }
}


export default Join;
