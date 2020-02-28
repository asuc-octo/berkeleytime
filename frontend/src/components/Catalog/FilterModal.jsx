import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import {Modal, Form} from "react-bootstrap";

function CheckboxGroup(props) {

  return (
    <Form>
      {props.nestedOptions.map(item => (
          <div>
            {item.options != null ?
            <div className="filter-form-label">{item.label}</div> :
            null}

            {item.options != null ?
            Object.values(item.options).map(option => (
              <Form.Check
                type="checkbox"
                id={option.value}
                label={option.label}
                onClick={props.handler}
              />
              )) : 
              <Form.Check
                type="checkbox"
                id={item.value}
                label={item.label}
                onClick={props.handler}
              />}
          </div>
      ))}
    </Form>
  )
}

export class FilterModal extends Component {
  
  render() {
    return (
      <Modal show={this.props.showFilters}>
          <div className="filter-modal">
            <div className="filter-form">
              <CheckboxGroup
                nestedOptions={this.props.options}
                handler={this.props.handleCheckbox}
              />
            </div>
            <div className="filter-button-bar">
              <button className="btn-bt-primary-inverted" onClick={this.props.hideModal}> 
              Cancel </button>
              <button className="btn-bt-primary" onClick={this.props.hideModal}> 
              Save </button>
            </div>
          </div>
      </Modal>
    );
  }
}

export default FilterModal;