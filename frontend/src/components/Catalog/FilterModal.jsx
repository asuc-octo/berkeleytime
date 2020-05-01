import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Modal, Form} from "react-bootstrap";

function CheckboxGroup(props) {
  
  const { nestedOptions, handler, defaultSelection, displayRadio } = props;
  const formType = displayRadio ? "radio" : "checkbox";

  const isDefault = (item) => {
    let checked = false;
    if(defaultSelection){
      if(Object.values(defaultSelection).includes(item)) {
        checked = true;
      }
      for (var i = 0; i < defaultSelection.length; i++) {
        if(Object.values(defaultSelection[i]).includes(item)){
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