import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Modal, Form} from "react-bootstrap";
import {Button} from "react-bootstrap";

function CheckboxGroup(props) {
  
  const { nestedOptions, handler, defaultSelection, displayRadio } = props;
  const formType = displayRadio ? "radio" : "checkbox";

  /* Accounts for the fact that valueIDs can be either nums or strings */
  const inValues = (obj, value) => {
    return Object.values(obj).includes(value) || Object.values(obj).includes(value.toString());
  }

  const isDefault = (item) => {
    let checked = false;
    if (defaultSelection){
      if (inValues(defaultSelection, item)) {
        checked = true;
      }
      for (var i = 0; i < defaultSelection.length; i++) {
        if (inValues(defaultSelection[i], item)){
          checked = true;
        }
      }
    }
    return checked;
  }

  return (
    <Form>
      {nestedOptions.map(item => (
          <div>
            {item.options != null &&
              <div className="filter-form-label">{item.label}</div> 
            }

            {item.options != null ?
              Object.values(item.options).map(option => (
              <div>
                <Form.Check
                  custom
                  type={formType}
                  id={option.value}
                  name="modal-form"
                  label={option.label}
                  onClick={handler.bind(this)}
                  defaultChecked={isDefault(option.value)}
                /> 
              </div>
              )) :
              <div>
                <Form.Check
                  custom
                  type={formType}
                  id={item.value}
                  name="modal-form"
                  label={item.label}
                  onClick={handler.bind(this)}
                  defaultChecked={isDefault(item.value)}
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
                defaultSelection={this.props.defaultSelection}
                displayRadio={this.props.displayRadio}
              />
            </div>
            <div className="filter-button-bar">
              <Button className="bt-btn-inverted" onClick={this.props.hideModal}>
              Cancel </Button>
              <Button className="bt-btn-primary" onClick={this.props.saveModal}>
              Save </Button>
            </div>
          </div>
      </Modal>
    );
  }
}

export default FilterModal;
