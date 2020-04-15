import React, { Component } from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import FilterModal from './FilterModal';

import { setRequirements, setUnits, setDepartment, setLevel, setSemester } from '../../redux/actions';
import { connect } from "react-redux";

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
      showFilters: false,
      modalType: "",
      modalOptions: [],
      modalSelection: [],
    };

    this.searchInput = React.createRef(); // reference to <input>
  }

  componentDidMount() {
    this.resetFilters();
  }

  resetFilters = () => {
    const { setRequirements, setUnits, setDepartment, setLevel, setSemester } = this.props;
    this.searchInput.current.value = '';
    setRequirements(this.requirementsDefault);
    setUnits(this.unitsRangeDefault);
    setDepartment(this.departmentDefault);
    setLevel(this.classLevelDefault);
    setSemester([this.semesterDefault]);
    this.setState({
      search: '',
      sort: this.sortDefault,
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
    const { setRequirements } = this.props;
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
    setRequirements(requirements);
  }

  unitsRangeHandler = unitsRange => {
    const { setUnits } = this.props;
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
    setUnits(unitsRange);
  }

  departmentHandler = department => {
    const { setDepartment } = this.props;
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
    setDepartment(department);
  }

  classLevelHandler = classLevels => {
    const { setLevel } = this.props;
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
    setLevel(classLevels);
  }

  semesterHandler = semesters => {
    const { setSemester } = this.props;
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
    setSemester(semesters);
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
        this.requirementHandler(this.props.requirements)
        break;
      case "unitsRange":
        this.unitsRangeHandler(this.props.units)
        break;
      case "department":
        this.departmentHandler(this.props.department)
        break;
      default:
        this.classLevelHandler(this.props.level)
        break;
    }
    this.hideModal()
  };

  storeSelection = (e) => {
    const { setRequirements, setUnits, setDepartment, setLevel } = this.props;
    const val = e.target.id;
    const option = e.target.name;
    switch(this.state.modalType) {
      case "sortBy":
        this.setState({sort: option})
        break;
      case "requirements":
        setRequirements(this.props.requirements.concat({value: val, label: option}));
        break;
      case "unitsRange":
        setUnits(this.props.units.concat({value: val, label: option}));
        break;
      case "department":
        setDepartment({value: val, label: option});
        break;
      default:
        setLevel(this.props.level.concat({value: val, label: option}));
        break;
    }
  };

  render() {
    const { units, requirements, department, level, semester } = this.props;
    const { sort } = this.state;

    const customStyles = {
      clearIndicator:  base => ({
        ...base,
        paddingRight: 0,

        '&:hover': {
          color: 'red'
        }
      })
    };

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
            components={{
              IndicatorSeparator: () => null
            }}
            styles={customStyles}
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
            components={{
              IndicatorSeparator: () => null
            }}
            styles={customStyles}
          />
        </div>
        <div className="filter-units">
          <p>Units</p>
          <Select
            closeMenuOnSelect={false}
            components={{
              animatedComponents,
              IndicatorSeparator: () => null
            }}
            options={this.unitsRangeOptions}
            isMulti
            placeholder="Specify units..."
            isSearchable={false}
            onChange={this.unitsRangeHandler}
            value={units}
            styles={customStyles}
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
            components={{
              IndicatorSeparator: () => null
            }}
            styles={customStyles}
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
            value={level}
            onChange={this.classLevelHandler}
            components={{
              IndicatorSeparator: () => null
            }}
            styles={customStyles}
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
            value={semester}
            placeholder="Select semesters..."
            onMenuOpen={this.semesterOpen}
            components={{
              IndicatorSeparator: () => null
            }}
            styles={customStyles}
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
            onClick={() => this.showModal("unitsRange", units, this.unitsRangeOptions)}> 
            Units </button>
          <button className="btn-bt-border filter-scroll-btn"
            onClick={() => this.showModal("department", department, this.departmentOptions)}>
            Department </button>
          <button className="btn-bt-border filter-scroll-btn" 
            onClick={() => this.showModal("classLevels", level, this.classLevelOptions)}> 
            Class&nbsp;Level </button>
        </div>
          <FilterModal
            options={this.state.modalOptions}
            showFilters={this.state.showFilters}
            hideModal={this.hideModal}
            saveModal={this.saveModal}
            storeSelection={this.storeSelection}
            displayRadio={this.state.modalType == "sortBy"}
          />
       </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    dispatch,
    setRequirements: (data) => dispatch(setRequirements(data)),
    setUnits: (data) => dispatch(setUnits(data)),
    setDepartment: (data) => dispatch(setDepartment(data)),
    setLevel: (data) => dispatch(setLevel(data)),
    setSemester: (data) => dispatch(setSemester(data))
  }
}

const mapStateToProps = state => {
  const { requirements, units, department, level, semester } = state.filter;
  return {
    requirements,
    units,
    department,
    level,
    semester
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FilterSidebar);