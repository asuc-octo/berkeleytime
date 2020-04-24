import React, { PureComponent } from 'react';
import { Row, Col, ButtonToolbar, Form } from 'react-bootstrap';
import retreat_silly from '../../assets/img/images/about/group/retreat_silly.png';
import janet_jemma from '../../assets/img/images/about/group/janet_jemma.jpg';
import BTForm from '../../components/Form/Form.jsx';

class Apply extends PureComponent {
  render() {
    const { values } = this.props;

    return (
      <div className="apply">

        <BTForm name="TestSurvey0" />

      </div>

    );
  }
}


export default Apply;
