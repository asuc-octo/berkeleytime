import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Modal, Form} from "react-bootstrap";
import ClassDescription from './ClassDescription';

export class ClassDescriptionModal extends Component {
  render() {
    return (
      <Modal show={this.props.show} className="modal">
        <div className="full">
            <button onClick={this.props.hideModal} className="link-btn"> 
              &lt; Back to Courses </button>
            <ClassDescription
              course={this.props.course}
              selectCourse={this.props.selectCourse}
            />
        </div>
      </Modal>
    );
  }
}

export default ClassDescriptionModal;