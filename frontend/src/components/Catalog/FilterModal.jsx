import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import {Modal, Form} from "react-bootstrap";

function CheckboxGroup(props) {
  const { nestedOptions, handler } = props;
  return (
    nestedOptions ?
    <Form>
      {
        nestedOptions.map(item => {
          Object.values(item.options).map(option =>
              <Form.Check
                type="checkbox"
                id={option.value}
                label={option.label}
                onClick={handler}
              />
            )
          })
      }
    </Form> :
    null
  )
}

export class FilterModal extends Component {
  render() {
  if(this.props.options){
  this.props.options.map(item => {
   console.log(Object.values(item.label))
  })
  }
    return (
      <Modal show={this.props.showFilters}>
        <div className="filter">
          <div className="filter-modal">
            <ReactMultiSelectCheckboxes options={this.props.options} 
            placeholderButtonLabel={"Hi"}/>
            <CheckboxGroup
              nestedOptions={this.props.options}
              handler={this.props.handleCheckbox}
            />
            <Form>
            {
              this.props.options.map(item => {
                Object.values(item.options).map(option =>
                  <Form.Check
                    type="checkbox"
                    id={option.value}
                    label={option.label}
                    onClick={handler}
                  />
                )
              })
            }
           </Form> 
            <button className="btn-bt-primary-inverted" onClick={this.props.hideModal}> 
            Cancel </button>
          </div>
        </div>
      </Modal>
    );
  }
}

export default FilterModal;