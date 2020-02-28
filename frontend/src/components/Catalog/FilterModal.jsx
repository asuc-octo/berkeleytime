import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import {Modal, Form} from "react-bootstrap";

function CheckboxGroup(props) {
  console.log(props.nestedOptions)
  return (
    <Form>
      {props.nestedOptions.map(item => (
          <div>
            <div className="filter-modal-label">{item.label}</div>
            {Object.values(item.options).map(option => (
              <Form.Check
                type="checkbox"
                id={option.value}
                label={option.label}
                onClick={props.handler}
              />
              ))}
          </div>
      ))}
    </Form>
  )
}

export class FilterModal extends Component {
  
  render() {
    return (
      <Modal show={this.props.showFilters}>
        <div className="filter">
          <div className="filter-modal">
            <CheckboxGroup
              nestedOptions={this.props.options}
              handler={this.props.handleCheckbox}
            />
            <button className="btn-bt-primary-inverted" onClick={this.props.hideModal}> 
            Cancel </button>
          </div>
        </div>
      </Modal>
    );
  }
}

export default FilterModal;