import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Slider from 'rc-slider';

import Select from 'react-select';
import makeAnimated from 'react-select/animated';

import 'font-awesome/css/font-awesome.min.css';
import 'rc-slider/assets/index.css';

const { createSliderWithTooltip } = Slider;
const Range = createSliderWithTooltip(Slider.Range);

const animatedComponents = makeAnimated();

const sortOptions = [
  { value: 'average_grade', label: 'Sort by: Average Grade' },
  { value: 'department_name', label: 'Sort by: Dept. Name' },
  { value: 'open_seats', label: 'Sort by: Open Seats' },
  { value: 'enrolled_percentage', label: 'Sort by: Enrolled Pct.' },
];

const sortDefault = sortOptions[0];

function sortSelect() {
  return (
    <Select
      className="filter-sort"
      options={sortOptions}
      defaultValue={sortDefault}
    />
  );
}

const unitRangeOptions = [
  { value: '0.5', label: '0.5 Units' },
  { value: '1', label: '1 Unit' },
  { value: '2', label: '2 Units' },
  { value: '3', label: '3 Units' },
  { value: '4', label: '4 Units' },
  { value: '5', label: '5 Units' },
  { value: '6+', label: '6+ Units' },
];

const unitRangeDefault = unitRangeOptions;

function unitRangeSelect() {
  return (
    <Select
      closeMenuOnSelect={false}
      components={animatedComponents}
      options={unitRangeOptions}
      defaultValue={unitRangeDefault}
      isMulti
      placeholder="Select units..."
      className="filter-units"
    />
  );
}

const classLevelOptions = [
  { value: 'lower_division', label: 'Lower Div.' },
  { value: 'upper_division', label: 'Upper Div.' },
  { value: 'graduate', label: 'Graduate' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'field_study', label: 'Field Study' },
];

const classLevelDefault = [classLevelOptions[0], classLevelOptions[1], classLevelOptions[2]];

function classLevelSelect() {
  return (
    <Select
      closeMenuOnSelect={false}
      components={animatedComponents}
      options={classLevelOptions}
      defaultValue={classLevelDefault}
      isMulti
      placeholder="Select class levels..."
      className="filter-class-level"
    />
  );
}

/*
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

class ButtonToggleGroup extends Component{
    constructor(props){
        super(props);
        console.log(Object.keys(this.props.checkboxes).length);
        this.state = {
            active: new Array(Object.keys(this.props.checkboxes).length).fill(false)
        };
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(e, i) {
      console.log(i);
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

export class FilterSidebar extends Component {
  constructor(props) {
    super(props);

    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleRange = this.handleRange.bind(this);
    this.handleToggleDiv = this.handleToggleDiv.bind(this);
    this.handleCheckbox = this.handleCheckbox.bind(this);
    this.handleSortBySelect = this.handleSortBySelect.bind(this);
    this.handleDepartmentSelect = this.handleDepartmentSelect.bind(this);
    this.handleReset = this.handleReset.bind(this);

    this.state = {
      department: '',
      toggleStatus: new Set(),
      collapseLogistics: false,
      classSearch: this.props.defaultSearch,
    }
  }

  handleSearchChange(e) {
    this.setState({classSearch: e.target.value})
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

    let addFilterIds = [];
    let removeFilterIds = [];

    for(let unitsFilter of units) {
      let units = parseFloat(unitsFilter.name.split(" ")[0]);
      if (units >= lowerBound && units <= upperBound) {
        addFilterIds.push(unitsFilter.id)
      } else {
        removeFilterIds.push(unitsFilter.id);
      }
    }

    this.props.rangeFilter(addFilterIds, removeFilterIds);
    this.props.unitsRangeHandler(range);
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

  handleDepartmentSelect(updated) {
    if(!updated) {
      this.props.removeFilter(this.state.department);
      this.setState({
        department: ''
      })
    } else if (updated.value === -1) {
      if (this.state.department !== '') {
        this.props.toggleFilter(this.state.department);
        this.setState({
          department: ''
        })
      }
    } else {
      let updatedFilterID = updated.value;
      this.props.selectFilter(this.state.department, updatedFilterID);

      this.setState({
        department: updatedFilterID
      });
    }
  }

  handleReset(e) {
    this.setState({
      department: '',
      classSearch: ''
    })
    this.props.resetFilters(e)
  }

  render() {
    const { requirements, logistics, department, sortAttributes } = this.props.filters;
    const { activeFilters } = this.props;
    return (
      <div className="filter-sidebar">
        <div className="header">
          <h2 className="filter-sidebar-header">Filters</h2>
        </div>
        <div className="content">
          <Form className="side-filter">
            <FormGroup controlId="classSearch">
              <FormControl
                  name="classSearch"
                  type="text"
                  placeholder="&#xf002;  Search for a class..."
                  onChange={this.handleSearchChange}
                  className="filter-sidebar-classSearch"
                  autocomplete="off"
                  value={this.state.classSearch}
              />

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
              <HelpBlock className="filter-sidebar-range-helpBlock">
                {this.props.unitsRange[0]} {this.props.unitsRange[0] === 1 ? "Unit" : "Units"} - {this.props.unitsRange[1]} {this.props.unitsRange[1] === 1 ? "Unit" : "Units"}
              </HelpBlock>
              <Range
                min={0}
                max={6}
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
                  searchable={true}
                  placeholder={"Select..."}
                  clearable={false}
              />

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
                <Button type="reset" block className="filter-resetButton" onClick={this.handleReset}>Reset Filters</Button>
              </div>
            </FormGroup>
          </Form>
        </div>
      </div>
    );
  }
}

FilterSidebar.propTypes = {
    sortFilters: PropTypes.array,
    requirements: PropTypes.object,
    logistics: PropTypes.object,
    department: PropTypes.array
}

export default FilterSidebar;
*/

class FilterSidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="filter">
        <div className="filter-name">
          <p>Filters</p>
          <button className="as-link" type="button">Clear</button>
        </div>
        <div className="filter-search">
          <input type="text" placeholder=" &#xf002;  Search for a class..." />
        </div>
        { sortSelect() }
        <Select
          className="filter-requirements"
        />
        { unitRangeSelect() }
        <Select
          className="filter-department"
        />
        { classLevelSelect() }
      </div>
    );
  }
}

export default FilterSidebar;
