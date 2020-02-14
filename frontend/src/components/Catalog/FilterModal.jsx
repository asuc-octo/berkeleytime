import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
        Button,
        FormGroup,
        FormLabel,
        FormControl,
        Form,
        HelpBlock,
        ButtonToolbar,
      } from 'react-bootstrap';
import Slider from 'rc-slider';
import Select from 'react-select';

import 'font-awesome/css/font-awesome.min.css';
import 'rc-slider/assets/index.css';

const { createSliderWithTooltip } = Slider;
const Range = createSliderWithTooltip(Slider.Range);

function CheckboxGroup(props) {
  const { options, activeFilters, handler } = props;
  return (
    <div className="checkboxGroup">
      {
        options.map((option) => {
          return (
            <div class="checkbox"
              key={option.id}
              number={option.id}
              label={option.name}
              onClick={handler}
            />
          )
        })
      }
    </div>
  )
}

class ButtonToggleGroup extends Component{
    constructor(props){
        super(props);
        this.state = {
            active: new Array(Object.keys(this.props.checkboxes).length).fill(false)
        };
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(e, i) {
      const newActives = this.state.active;
      newActives[i] = !newActives[i];

      this.setState({
        active: newActives
      })
      
      this.props.handleToggleDiv(e);
    }

    render() {
      return (
        <div className="buttonToggleGroup">
            {
              Object.entries(this.props.checkboxes).map((item, i) => {
                const name = item[0];
                const title = item[1].title;
                const options = item[1].options;
                return (
                  <div key={i}>
                    <ButtonToolbar>
                      <Button
                        name={'buttonToggle' + name}
                        onClick={(e) => this.handleClick(e, i)}
                        bsStyle="link"
                        className="btn-simple btn-block buttonToggleGroup-button">
                          {title} 
                          <i className={"button-icon fa " + (this.state.active[i] ? 'fa-angle-down' : 'fa-angle-right')}></i>
                      </Button>
                    </ButtonToolbar>
                    { this.props.toggleStatus.has('buttonToggle' + name) &&
                      <CheckboxGroup
                        options={options}
                        activeFilters={this.props.activeFilters}
                        handler={this.props.handleCheckbox}
                      />
                    }
                  </div>
                );
              })
            }
          </div>
      );
    }
}

export class FilterModal extends Component {
  constructor(props) {
    super(props);

    this.handleToggleDiv = this.handleToggleDiv.bind(this);
    this.handleCheckbox = this.handleCheckbox.bind(this);

    this.state = {
      department: '',
      toggleStatus: new Set(),
      collapseLogistics: false,
      classSearch: this.props.defaultSearch,
    }
  }

  handleToggleDiv(e) {
    var name = e.target.name;
    if(this.state.toggleStatus.has(name)) {
        this.state.toggleStatus.delete(name);
    } else {
        this.state.toggleStatus.add(name);
    }
    this.setState({
      'toggleStatus': this.state.toggleStatus
      })
  }

  handleCheckbox(e) {
    var clicked = e.target.id;
    this.props.toggleFilter(clicked);
  }

  render() {
    console.log(this.props.playlists)
    const { requirements} = this.props.playlists;
    const { activeFilters } = this.props;
    return (
      <div className="filter-sidebar">
        <div className="header">
          <h2 className="filter-sidebar-header">Filters</h2>
        </div>
        <div className="content">
          <Form className="side-filter">
              <FormLabel className="filter-label">Requirements</FormLabel>
              <ButtonToolbar>
                  <ButtonToggleGroup
                    checkboxes={requirements}
                    activeFilters={activeFilters}
                    toggleStatus={this.state.toggleStatus}
                    handleToggleDiv={this.handleToggleDiv}
                    handleCheckbox={this.handleCheckbox}
                  />
              </ButtonToolbar>
          </Form>
        </div>
      </div>
    );
  }
}

FilterModal.propTypes = {
    requirements: PropTypes.object
}

export default FilterModal;