import React, { Component, PureComponent } from 'react';
import {Modal} from "react-bootstrap";
import ClassDescription from '../components/ClassDescription/ClassDescription';

export class ClassDescriptionModal extends Component {

  render() {
    return (
      <Modal show={this.props.showDescription}>
        <ClassDescription
          	course={this.props.selectedCourse}
           	selectCourse={this.props.selectCourse}
        />
      </Modal>
    );
  }
}

export default ClassDescriptionModal;