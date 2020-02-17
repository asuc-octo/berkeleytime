import React, { Component } from 'react';
import Select from 'react-select-virtualized';
import {Row, Col, Button} from 'react-bootstrap';
import axios from 'axios';
import hash from 'object-hash';

import { laymanToAbbreviation } from '../../variables/Variables';

// import 'react-virtualized-select/styles.css'
import { fetchEnrollSelected } from '../../redux/actions';
import { connect } from "react-redux";

class EnrollmentSearchBar extends Component {

  constructor(props) {
    super(props);

    this.state = {
      selectedClass: 0,
      selectPrimary: this.props.selectPrimary,
      selectSecondary: this.props.selectSecondary,
    }

    this.handleClassSelect = this.handleClassSelect.bind(this);
    this.handlePrimarySelect = this.handlePrimarySelect.bind(this);
    this.handleSecondarySelect = this.handleSecondarySelect.bind(this);
    this.buildCoursesOptions = this.buildCoursesOptions.bind(this);
    this.buildPrimaryOptions = this.buildPrimaryOptions.bind(this);
    this.buildSecondaryOptions = this.buildSecondaryOptions.bind(this);
    this.getFilteredSections = this.getFilteredSections.bind(this);
    this.addSelected = this.addSelected.bind(this);
    this.filterOptions = this.filterOptions.bind(this);
    this.reset = this.reset.bind(this);
  }

  componentDidMount() {
    let { fromCatalog } = this.props;
    if(fromCatalog) {
      this.handleClassSelect({value: fromCatalog.id, addSelected: true});
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectPrimary != this.state.selectPrimary) {
      this.setState({
        selectPrimary: nextProps.selectPrimary
      });
    }
    if (nextProps.selectSecondary != this.state.selectSecondary) {
      this.setState({
        selectSecondary: nextProps.selectSecondary
      });
    }
  }

  handleClassSelect(updatedClass) {
    const { fetchEnrollSelected } = this.props;
    if(updatedClass === null) {
      this.reset();
      this.setState({
        selectedClass: 0,
      })
      return;
    }

    this.setState({
      selectedClass: updatedClass.value
    });

    fetchEnrollSelected(updatedClass);

    // let url = `http://localhost:8080/api/enrollment/sections/${updatedClass.value}/`
    //
    // axios.get(url)
    // .then(res => {
    //   // console.log(res);
    //   let sections = res.data
    //   this.setState({
    //     sections: sections,
    //     selectPrimary: this.getSectionSemester(sections[0]),
    //     selectSecondary: 'all',
    //   });
    //   if (updatedClass.addSelected) {
    //     this.addSelected();
    //     this.handleClassSelect({value: updatedClass.value, addSelected: false});
    //   }
    // })
    // .catch((err) => {
    //   console.log(err);
    // });
  }

  handlePrimarySelect(primary) {
    this.setState({
      selectPrimary: primary ? primary.value : '',
      selectSecondary: primary ? 'all' : '',
    });
  }

  handleSecondarySelect(secondary) {
    this.setState({
      selectSecondary: secondary ? secondary.value : '',
    });
  }

  buildCoursesOptions(courses) {
    if(!courses) {
      return []
    }

    let options = courses.map(course => ({
      value: course.id,
      label: `${course.abbreviation} ${course.course_number}`,
      course: course,
    }));

    return options;
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  getSectionSemester(section) {
    return `${this.capitalize(section.semester)} ${section.year}`;
  }

  buildPrimaryOptions(sections) {
    const ret = [];
    const map = new Map();

    for(const section of sections) {
      let semester = this.getSectionSemester(section);
      if(!map.has(semester)) {
        map.set(semester, true);
        ret.push({
          value: semester,
          label: semester,
        })
      }
    }

    return ret;
  }

  buildSecondaryOptions(semesters, selectPrimary) {
    if (semesters.length === 0 || selectPrimary === undefined || selectPrimary === '') {
      return [];
    }

    const ret = [];
    ret.push({ value: 'all', label: 'All Instructors' });
    let sections = semesters.filter(semester => this.getSectionSemester(semester) === selectPrimary)[0].sections;

    for (var section of sections) {
      let instructor = `${section.instructor} / ${section.section_number}`;

      ret.push( {
        value: instructor.split(' / ')[0],
        label: instructor,
        sectionNumber: instructor.split(' / ')[1],
      } );
    }
    return ret;
  }

  getFilteredSections() {
    const { selectPrimary, selectSecondary, sectionNumber } = this.state;
    const { sections } = this.props;
    // console.log(sections);
    let ret;
    ret = sections.filter(section => {
      return this.getSectionSemester(section) === selectPrimary;
    })[0].sections
    .filter(section => {
      return selectSecondary === 'all' ? true : section.instructor === selectSecondary;
    })
    .filter(section => {
      return sectionNumber ? section.section_number === sectionNumber : true;
    })
    .map(s => s.section_id);
    return ret;
  }

  addSelected() {
    const { selectedClass, selectPrimary, selectSecondary } = this.state;
    let playlist = {
      courseID: selectedClass,
      instructor: selectSecondary,
      semester: selectPrimary,
      sections: this.getFilteredSections(),
    }

    playlist.id = hash(playlist);
    console.log(playlist);
    this.props.addCourse(playlist)
    this.reset();
  }

  courseMatches(option, query) {
    let { course } = option;
    let courseMatches = (`${course.abbreviation} ${course.course_number} ${course.title} ${course.department}`).toLowerCase().indexOf(query) !== -1;
    let otherNumber;
    if (course.course_number.indexOf("C") !== -1) { // if there is a c in the course number
        otherNumber = course.course_number.substring(1);
    } else { // if there is not a c in the course number
        otherNumber = "C" + course.course_number;
    }
    var courseFixedForCMatches = (`${course.abbreviation} ${course.course_number} ${course.title} ${course.department}`).toLowerCase().indexOf(query) !== -1;
    return courseMatches || courseFixedForCMatches;
  }

  filterCourses(option, query) {
    if(query.trim() === "") { return true }
    let querySplit = query.toUpperCase().split(" ");
    if(querySplit[0] in laymanToAbbreviation) {
      querySplit[0] = laymanToAbbreviation[querySplit[0]];
    }
    query = query.toLowerCase();
    var pseudoQuery = querySplit.join(" ").toLowerCase();
    var useOriginalQuery = (querySplit.length === 1 && query !== pseudoQuery);
    return (useOriginalQuery && this.courseMatches(option, query)) || this.courseMatches(option, pseudoQuery);
  }

  filterOptions(options, query) {
    return options.filter(option => this.filterCourses(option, query))
  }


  reset() {
    this.setState({
      selectPrimary: '',
      selectSecondary: '',
    })
  }

  render() {
    const { classes, isFull, sections } = this.props;
    const { selectPrimary, selectSecondary, selectedClass } = this.state;
    let primaryOptions = this.buildPrimaryOptions(sections);
    let secondaryOptions = this.buildSecondaryOptions(sections, selectPrimary);
    let onePrimaryOption = primaryOptions && primaryOptions.length == 2 && selectPrimary;
    let oneSecondaryOption = secondaryOptions && secondaryOptions.length == 2 && selectSecondary;

    let primaryOption = { value: selectPrimary, label: selectPrimary };
    let secondaryOption = { value: selectSecondary, label: selectSecondary };

    if (selectSecondary === 'all') {
      secondaryOption = { value: 'all', label: "All Instructors" };
    }

    if (selectPrimary === '') {
      primaryOption = '';
    }
    if (selectSecondary === '') {
      secondaryOption = '';
    }

    return (
      <Row style={{marginBottom: 10}}>
        <Col lg={5}>
          <Select
              name="selectClass"
              placeholder="Choose a class..."
              // value={selectedClass}
              options={this.buildCoursesOptions(classes)}
              onChange={this.handleClassSelect}
              filterOptions={this.filterOptions}
          />
        </Col>
        <Col lg={3}>
          <Select
              name="instrSems"
              placeholder="Select an option..."
              value={onePrimaryOption ? primaryOptions[1] : primaryOption}
              options={primaryOptions}
              onChange={this.handlePrimarySelect}
              disabled={!selectedClass}
              clearable={false}
          />
        </Col>
        <Col lg={3}>
          <Select
              name="section"
              placeholder="Select an option..."
              value={oneSecondaryOption ? secondaryOptions[1] : secondaryOption}
              options={secondaryOptions}
              onChange={this.handleSecondarySelect}
              disabled={!selectedClass}
              clearable={false}
          />
        </Col>
        <Col lg={1}>
          <Button
            className="btn-bt-green"
            onClick={this.addSelected}
            disabled={!selectedClass || !(selectPrimary && selectSecondary) || isFull}
          >
            Add
          </Button>
        </Col>
      </Row>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    dispatch,
    fetchEnrollSelected: (updatedClass) => dispatch(fetchEnrollSelected(updatedClass))
  }
}

const mapStateToProps = state => {
  const { sections, selectPrimary, selectSecondary } = state.enrollment;
  return {
    sections,
    selectPrimary,
    selectSecondary,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EnrollmentSearchBar);
