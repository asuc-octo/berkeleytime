import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
        FormGroup,
        ControlLabel,
        FormControl,
        Form,
        HelpBlock,
        ButtonToolbar,
        DropdownButton,
        MenuItem
      } from 'react-bootstrap';
import Checkbox from '../../elements/CustomCheckbox/CustomCheckbox';
import Button from '../../elements/CustomButton/CustomButton';
import Tooltip from 'rc-tooltip';
import Slider from 'rc-slider';
import Select from 'react-select';

import 'font-awesome/css/font-awesome.min.css';
import 'rc-slider/assets/index.css';
import 'react-select/dist/react-select.css';

const { createSliderWithTooltip } = Slider;
const Range = createSliderWithTooltip(Slider.Range);
const { Handle } = Slider;

function CheckboxGroup(props) {
  const { options, activeFilters, handler } = props;
  return (
    <div className="checkboxGroup">
      {
        options.map((option) => {
          return (
            <Checkbox
              key={option.id}
              number={option.id}
              label={option.name}
              onClick={handler}
              isChecked={activeFilters.has(option.id)}
            />
          )
        })
      }
    </div>
  )
}

function ButtonToggleGroup(props) {
    const { checkboxes, activeFilters, toggleStatus, handleToggleDiv, handleCheckbox } = props;
    return (
      <div className="buttonToggleGroup">
        {
          Object.entries(checkboxes).map((item, i) => {
            const name = item[0];
            const title = item[1].title;
            const options = item[1].options;
            return (
              <div key={i}>
                <ButtonToolbar>
                  <Button
                    name={'buttonToggle' + name}
                    onClick={handleToggleDiv}
                    bsStyle="link"
                    className="btn-simple btn-block buttonToggleGroup-button">
                      {title} <i className="fa fa-angle-down"></i>
                  </Button>
                </ButtonToolbar>
                { toggleStatus.has('buttonToggle' + name) &&
                  <CheckboxGroup
                    options={options}
                    activeFilters={activeFilters}
                    handler={handleCheckbox}
                  />
                }
              </div>
            );
          })
        }
      </div>
    );
}

export class FilterSidebar extends Component {
  constructor(props) {
    super(props);

    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleRange = this.handleRange.bind(this);
    this.handleToggleDiv = this.handleToggleDiv.bind(this);
    this.handleCheckbox = this.handleCheckbox.bind(this);
    this.handleSortBySelect = this.handleSortBySelect.bind(this);
    this.handleDepartmentSelect = this.handleDepartmentSelect.bind(this);

    this.state = {
      classSearch: '',
      sortBy: 'average-grades',
      departmentID: '',
      toggleStatus: new Set(),
      collapseLogistics: false,
    }
  }

  handleSearchChange(e) {
    this.props.searchHandler(e.target.value);
  }

  handleSortBySelect(updated) {
    let updatedSortAttribute = updated.value;
    this.props.sortHandler(updatedSortAttribute);
  }

  handleRange(range) {
    const { units } = this.props.filters;
    let lowerBound = range[0];
    let upperBound = range[1];

    for(let unitsFilter of units) {
      let units = parseFloat(unitsFilter.name.split(" ")[0]);
      if (units >= lowerBound && units <= upperBound) {
        this.props.addFilter(unitsFilter.id);
      } else {
        this.props.removeFilter(unitsFilter.id);
      }
    }

    this.props.unitsRangeHandler(range);
  }

  handleToggleDiv(e) {
    var name = e.target.name;
    if(this.state.toggleStatus.has(name)) {
        this.state.toggleStatus.delete(name);
    } else {
        this.state.toggleStatus.add(name);
    }
    this.setState({'toggleStatus': this.state.toggleStatus})
  }

  handleCheckbox(e) {
    var clicked = e.target.id;
    this.props.toggleFilter(clicked);
  }

  handleDepartmentSelect(updated) {
    let updatedFilterID = updated.value;
    this.props.selectFilter(this.state.department, updatedFilterID);

    this.setState({
      department: updatedFilterID
    });
  }

  render() {
    const { requirements, logistics, department, units } = this.props.filters;
    const { sortAttributes, activeFilters } = this.props;
    return (
      <div className="card filter-sidebar">
        <div className="header">
          <h2 className="filter-sidebar-header">Filters</h2>
        </div>
        <div className="content">
          <Form className="side-filter">
            <FormGroup controlId="classSearch">
              {/* Finished Updating */}
              <FormControl
                  name="classSearch"
                  type="text"
                  value={this.state.className}
                  placeholder="&#xf002;  Search for a class..."
                  onChange={this.handleSearchChange}
                  className="filter-sidebar-classSearch"
              />

              {/* Finished Updating */}
              <ControlLabel className="filter-label">Sort By</ControlLabel>
              <Select
                  name="sortBy"
                  value={this.props.sortBy}
                  onChange={this.handleSortBySelect}
                  options={sortAttributes}
                  className="filter-sidebar-sortBy"
                  searchable={false}
                  clearable={false}
                  autoFocus={false}
                  autoSize={true}
              />

              {/* Finished Updating */}
              <ControlLabel className="filter-label">Requirements</ControlLabel>
              <ButtonToolbar>
                  <ButtonToggleGroup
                    checkboxes={requirements}
                    activeFilters={activeFilters}
                    toggleStatus={this.state.toggleStatus}
                    handleToggleDiv={this.handleToggleDiv}
                    handleCheckbox={this.handleCheckbox}
                  />
              </ButtonToolbar>


              <ControlLabel className="filter-label">Units</ControlLabel>
              <HelpBlock className="filter-sidebar-range-helpBlock">0 Units - 5 Units</HelpBlock>
              <Range
                min={0}
                max={5}
                value={this.props.unitsRange}
                allowCross={false}
                onChange={this.handleRange}
                className="filter-sidebar-range-slider"
              />

              <ControlLabel className="filter-label">Department</ControlLabel>
              <Select
                  name="department"
                  options={department}
                  value={this.state.department}
                  onChange={this.handleDepartmentSelect}
                  className="filter-sidebar-department"
                  searchable
                  clearable={false}
              />

              {/* Finish Updating */}
              <ControlLabel className="filter-label">Logistics</ControlLabel>
              <ButtonToolbar>
                <ButtonToggleGroup
                  checkboxes={logistics}
                  activeFilters={activeFilters}
                  toggleStatus={this.state.toggleStatus}
                  handleToggleDiv={this.handleToggleDiv}
                  handleCheckbox={this.handleCheckbox}
                />
              </ButtonToolbar>

              <div className="button-container">
                  <Button type="reset" className="filter-resetButton" onClick={this.props.resetFilters}>Reset Filters</Button>
              </div>
            </FormGroup>
          </Form>
        </div>
      </div>
    );
  }
}

FilterSidebar.defaultProps = {
    sortAttributes: [
      { value: 'average-grade', label: 'Average Grade' },
      { value: 'most-favorited', label: 'Most Favorited' },
      { value: 'department-name', label: 'Department Name' },
      { value: 'open-seats', label: 'Open Seats' },
      { value: 'enrolled-percentage', label: 'Enrolled Percentage' }
    ],
}

FilterSidebar.propTypes = {
    sortFilters: PropTypes.array,
    requirements: PropTypes.object,
    logistics: PropTypes.object,
    department: PropTypes.array
}

export default FilterSidebar;