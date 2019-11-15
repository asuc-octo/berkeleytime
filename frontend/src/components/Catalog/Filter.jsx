import React, { Component } from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

const animatedComponents = makeAnimated();

export class FilterSidebar extends Component {
  constructor(props) {
    super(props);

    const { playlists } = this.props;

    this.sortOptions = [
      { value: 'average_grade', label: 'Average Grade' },
      { value: 'department_name', label: 'Department Name' },
      { value: 'open_seats', label: 'Open Seats' },
      { value: 'enrolled_percentage', label: 'Enrolled Percentage' },
    ];
    this.sortDefault = this.sortOptions[0]
    this.requirementsOptions = playlists.requirements;
    this.requirementsDefault = [];
    this.unitsRangeOptions = playlists.unitsPlaylist;
    this.unitsRangeDefault = [];
    this.departmentOptions = playlists.departmentsPlaylist;
    this.departmentDefault = null;
    this.classLevelOptions = playlists.levelsPlaylist;
    this.classLevelDefault = [];
    for (const classLevel of this.classLevelOptions) {
      if (classLevel.label === 'Lower Division' ||
          classLevel.label === 'Upper Division' ||
          classLevel.label === 'Graduate') {
        this.classLevelDefault.push(classLevel);
      }
    }
    this.semesterOptions = playlists.semestersPlaylist;
    this.semesterDefault = playlists.semestersPlaylist[0];

    this.state = {
      search: this.props.defaultSearch,
      sort: this.sortDefault,
      requirements: this.requirementsDefault,
      unitsRange: this.unitsRangeDefault,
      department: this.departmentDefault,
      classLevels: this.classLevelDefault,
      semesters: this.semesterDefault,
    };

    this.searchInput = React.createRef(); // reference to <input>
  }

  resetFilters = () => {
    this.searchInput.current.value = '';
    this.setState({
      search: '',
      sort: this.sortDefault,
      requirements: this.requirementsDefault,
      unitsRange: this.unitsRangeDefault,
      department: null,
      classLevels: this.classLevelDefault,
      semesters: this.semesterDefault,
    }, () => {
      this.props.resetFilters();
    });
  }

  searchHandler = e => {
    this.props.searchHandler(e.target.value);
  }

  sortHandler = sort => {
    this.props.sortHandler(sort.value);
    this.setState({
      sort,
    });
  }

  requirementHandler = requirements => {
    var add = new Set();
    var remove = new Set();
    if (requirements !== null) {
      for (const req of requirements) {
        add.add(req.value);
      }
    }
    for (const section of this.requirementsOptions) {
      for (const req of section.options) {
        if (!add.has(req.value)) {
          remove.add(req.value);
        }
      }
    }
    this.props.modifyFilters(add, remove);
    this.setState({
      requirements,
    });
  }

  unitsRangeHandler = unitsRange => {
    var add = new Set();
    var remove = new Set();
    if (unitsRange !== null) {
      for (const req of unitsRange) {
        add.add(req.value);
      }
    }
    for (const req of this.unitsRangeOptions) {
      if (!add.has(req.value)) {
        remove.add(req.value);
      }
    }
    this.props.modifyFilters(add, remove);
    this.setState({
      unitsRange,
    });
  }

  departmentHandler = department => {
    var add = new Set();
    var remove = new Set();
    if (department !== null) {
      add.add(department.value);
    }
    for (const req of this.departmentOptions) {
      if (!add.has(req.value)) {
        remove.add(req.value);
      }
    }
    this.props.modifyFilters(add, remove);
    this.setState({
      department,
    });
  }

  classLevelHandler = classLevels => {
    var add = new Set();
    var remove = new Set();
    if (classLevels !== null) {
      for (const req of classLevels) {
        add.add(req.value);
      }
    }
    for (const req of this.classLevelOptions) {
      if (!add.has(req.value)) {
        remove.add(req.value);
      }
    }
    this.props.modifyFilters(add, remove);
    this.setState({
      classLevels,
    })
  }

  semesterHandler = semesters => {
    var add = new Set();
    var remove = new Set();
    if (semesters !== null) {
      for (const req of semesters) {
        add.add(req.value);
      }
    }
    for (const req of this.semesterOptions) {
      if (!add.has(req.value)) {
        remove.add(req.value);
      }
    }
    this.props.modifyFilters(add, remove);
    this.setState({
      semesters,
    });
  }

  // scroll filter down a little bit when opening semester select
  semesterOpen = () => {
    setTimeout(() => {
      document.getElementById('filter').scroll(0, 500);
    }, 50);
  }

  render() {
    const { sort, unitsRange, requirements, department, classLevels, semesters } = this.state;

    return (
      <div id="filter" className="filter">
        <div className="filter-name">
          <p>Filters</p>
          <button className="as-link" type="button" onClick={this.resetFilters}>Reset</button>
        </div>
        <div className="filter-search">
          <input
            ref={this.searchInput}
            onChange={this.searchHandler}
            type="text"
            placeholder=" &#xf002;  Search for a class..."
            defaultValue={this.props.defaultSearch}
          />
        </div>
        <div className="filter-sort">
          <p>Sort by</p>
          <Select
            options={this.sortOptions}
            isSearchable={false}
            onChange={this.sortHandler}
            value={sort}
          />
        </div>
        <div className="filter-requirements">
          <p>Requirements</p>
          <Select
            isMulti
            closeMenuOnSelect={false}
            isSearchable={false}
            options={this.requirementsOptions}
            onChange={this.requirementHandler}
            value={requirements}
            placeholder="Select requirements..."
          />
        </div>
        <div className="filter-units">
          <p>Units</p>
          <Select
            closeMenuOnSelect={false}
            components={animatedComponents}
            options={this.unitsRangeOptions}
            isMulti
            placeholder="Specify units..."
            isSearchable={false}
            onChange={this.unitsRangeHandler}
            value={unitsRange}
          />
        </div>
        <div className="filter-department">
          <p>Department</p>
          <Select
            isClearable
            options={this.departmentOptions}
            onChange={this.departmentHandler}
            value={department}
            placeholder="Choose a department..."
          />
        </div>
        <div className="filter-class-level">
          <p>Class Level</p>
          <Select
            closeMenuOnSelect={false}
            components={animatedComponents}
            options={this.classLevelOptions}
            isSearchable={false}
            isMulti
            placeholder="Select class levels..."
            value={classLevels}
            onChange={this.classLevelHandler}
          />
        </div>
        <div className="filter-semesters">
          <p>Semesters</p>
          <Select
            closeMenuOnSelect={false}
            isMulti
            isSearchable={false}
            options={this.semesterOptions}
            onChange={this.semesterHandler}
            value={semesters}
            placeholder="Select semesters..."
            onMenuOpen={this.semesterOpen}
          />
        </div>
        <div id="filter-end"></div>
      </div>
    );
  }
}

export default FilterSidebar;
