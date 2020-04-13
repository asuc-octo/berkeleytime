import React, { Component } from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import FilterModal from './FilterModal';

const animatedComponents = makeAnimated();

export class FilterSidebar extends Component {
  constructor(props) {
    super(props);

    const { playlists } = this.props;

    this.sortOptions = [
      { value: 'average_grade', label: 'Sort By: Average Grade' },
      { value: 'department_name', label: 'Sort By: Department Name' },
      { value: 'open_seats', label: 'Sort By: Open Seats' },
      { value: 'enrolled_percentage', label: 'Sort By: Enrolled Percentage' },
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
      showFilters: false,
      modalType: "",
      modalOptions: [],
      modalSelection: [],
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

  //show the mobile modals
  showModal = (type, selection, options) => {
    this.setState({
      modalType: type,
      showFilters: true,
      modalOptions: options
    })
  }

  hideModal = () => {
    this.setState({
      modalType: "",
      showFilters: false,
      modalOptions: [],
    })
  };

  saveModal = () => {
    //set the relevant state
    switch(this.state.modalType) {
      case "sortBy":
        this.sortHandler(this.state.sort)
        break;
      case "requirements":
        this.requirementHandler(this.state.requirements)
        break;
      case "unitsRange":
        this.unitsRangeHandler(this.state.unitsRange)
        break;
      case "department":
        this.departmentHandler(this.state.department)
        break;
      default:
        this.classLevelHandler(this.state.classLevels)
        break;
    }
    this.hideModal()
  };

  storeSelection = (e) => {
    const val = e.target.id;
    const option = e.target.name;
    switch(this.state.modalType) {
      case "requirements":
        this.setState({sort: option})
        break;
      case "requirements":
        this.setState({requirements: this.state.requirements.concat({value: val, label: option})})
        break;
      case "unitsRange":
        this.setState({unitsRange: this.state.unitsRange.concat({value: val, label: option})})
        break;
      case "department":
        this.setState({department: {value: val, label: option}})
        break;
      default:
        this.setState({classLevels: this.state.classLevels.concat({value: val, label: option})})
        break;
    }
  };

  render() {
    const { sort, unitsRange, requirements, department, classLevels, semesters } = this.state;

    console.log(classLevels);

    return (
      !this.props.isMobile ?
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
      :
      <div id="filter" className="filter">
        <div className="filter-search">
          <input
            ref={this.searchInput}
            onChange={this.searchHandler}
            type="text"
            placeholder=" &#xf002;  Search for a class..."
            defaultValue={this.props.defaultSearch}
          />
        </div>

        <div className="filter-scroll">
          <button className="btn-bt-border filter-scroll-btn blue-text"
            onClick={this.resetFilters}>
            Reset </button>
          <button className="btn-bt-border filter-scroll-btn"
            onClick={() => this.showModal("sortBy", sort, this.sortOptions)}>
            Sort&nbsp;By </button>
          <button className="btn-bt-border filter-scroll-btn"
            onClick={() => this.showModal("requirements", requirements, this.requirementsOptions)}>
            Requirements </button>
          <button className="btn-bt-border filter-scroll-btn"
            onClick={() => this.showModal("unitsRange", unitsRange, this.unitsRangeOptions)}>
            Units </button>
          <button className="btn-bt-border filter-scroll-btn"
            onClick={() => this.showModal("department", department, this.departmentOptions)}>
            Department </button>
          <button className="btn-bt-border filter-scroll-btn"
            onClick={() => this.showModal("classLevels", classLevels, this.classLevelOptions)}>
            Class&nbsp;Level </button>
        </div>
          <FilterModal
            options={this.state.modalOptions}
            showFilters={this.state.showFilters}
            hideModal={this.hideModal}
            saveModal={this.saveModal}
            storeSelection={this.storeSelection}
          />
       </div>
    );
  }
}

export default FilterSidebar;
