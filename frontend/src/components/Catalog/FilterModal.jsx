import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Modal, Form} from "react-bootstrap";

function CheckboxGroup(props) {
  
  const { displayRadio } = props;
  const formType = displayRadio ? "radio" : "checkbox";

  return (
    <Form>
      {props.nestedOptions.map(item => (
          <div>
            {item.options != null ?
              <div className="filter-form-label">{item.label}</div> 
              :
              null
            }

            {item.options != null ?
              Object.values(item.options).map(option => (
              <div>
                <Form.Check
                  custom
                  type="checkbox"
                  id={option.value}
                  name={option.label}
                  label={option.label}
                  onClick={props.handler.bind(this)}
                /> 
              </div>
              )) :
              <div className="custom-checkbox">
                <Form.Check
                  custom
                  type="checkbox"
                  id={item.value}
                  name={item.label}
                  label={item.label}
                  onClick={props.handler.bind(this)}
               />
              </div>
            }
          </div>
      ))}
    </Form>
  )
}

export class FilterModal extends Component {

  render() {

    return (
      <Modal show={this.props.showFilters} onHide={this.props.hideModal}>
          <div className="filter-modal">
            <div className="filter-form">
              <CheckboxGroup
                nestedOptions={this.props.options}
                handler={this.props.storeSelection}
                displayRadio={this.props.displayRadio}
              />
            </div>
            <div className="filter-button-bar">
              <button className="btn-bt-primary-inverted" onClick={this.props.hideModal}>
              Cancel </button>
              <button className="btn-bt-primary" onClick={this.props.saveModal}>
              Save </button>
            </div>
          </div>
      </Modal>
    );
  }
}

export default FilterModal;
