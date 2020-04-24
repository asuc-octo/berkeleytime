import React, { Component } from 'react';
import Select from 'react-select-virtualized';
import {
  Container, Row, Col, Button
} from 'react-bootstrap';
import hash from 'object-hash';

import FilterResults from '../Catalog/FilterResults';

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
    this.reset = this.reset.bind(this);
  }

  componentDidMount() {
    let { fromCatalog } = this.props;
    if(fromCatalog) {
      this.handleClassSelect({value: fromCatalog.id, addSelected: true});
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectPrimary !== this.state.selectPrimary) {
      this.setState({
        selectPrimary: nextProps.selectPrimary
      });
    }
    if (nextProps.selectSecondary !== this.state.selectSecondary) {
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
  }

  handlePrimarySelect(primary) {
    this.setState({
      selectPrimary: primary ? primary.value : '',
      selectSecondary: primary ? { value: 'all', label: 'All Instructors' } : '',
    });
  }

  handleSecondarySelect(secondary) {
    this.setState({
      selectSecondary: secondary ? secondary : { value: 'all', label: 'All Instructors' },
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
      let instructor = `${section.instructor == null ? "None" : section.instructor} / ${section.section_number}`;

      ret.push( {
        value: instructor,
        label: instructor,
        sectionNumber: instructor.split(' / ')[1],
        sectionId: section.section_id
      } );
    }
    return ret;
  }

  getFilteredSections() {
    const { selectPrimary, selectSecondary, sectionNumber } = this.state;
    const { sections } = this.props;
    let ret;
    ret = sections.filter(section => {
      return this.getSectionSemester(section) === selectPrimary;
    })[0].sections
    .filter(section => {
      return selectSecondary.value === 'all' ? true : section.instructor === selectSecondary.value.split(' / ')[0];
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
      instructor: selectSecondary.value === 'all' ? 'all' : selectSecondary.value,
      semester: selectPrimary,
      sections: selectSecondary.sectionId ? [selectSecondary.sectionId] : this.getFilteredSections()
    }

    playlist.id = hash(playlist);
    this.props.addCourse(playlist)
    this.reset();
  }

  filterOptions(option, query) {
    return FilterResults.filterCourses(option.course, query);
  }

  reset() {
    this.setState({
      selectPrimary: '',
      selectSecondary: { value: 'all', label: 'All Instructors' },
    })
  }

  render() {
    const { classes, isFull, sections, isMobile } = this.props;
    const { selectPrimary, selectSecondary, selectedClass } = this.state;
    let primaryOptions = this.buildPrimaryOptions(sections);
    let secondaryOptions = this.buildSecondaryOptions(sections, selectPrimary);
    let onePrimaryOption = primaryOptions && primaryOptions.length === 2 && selectPrimary;
    let oneSecondaryOption = secondaryOptions && secondaryOptions.length === 2 && selectSecondary.value;

    let primaryOption = { value: selectPrimary, label: selectPrimary };
    let secondaryOption = selectSecondary;

    if (selectSecondary === 'all') {
      secondaryOption = { value: 'all', label: "All Instructors" };
    }

    if (selectPrimary === '') {
      primaryOption = '';
    }
    if (selectSecondary === '') {
      secondaryOption = '';
    }

    const customStyles = {
      clearIndicator: (provided, state) => ({
        ...provided,
        marginRight: 0,
        paddingRight: 0,
      }),
    };

    return (
      <Container fluid className="enrollment-search-bar">
        <Row style={{marginBottom: 10}}>
          <Col lg={4}>
            <Select
                name="selectClass"
                placeholder="Choose a class..."
                // value={selectedClass}
                options={this.buildCoursesOptions(classes)}
                onChange={this.handleClassSelect}
                filterOption={this.filterOptions}
                components={{
                  IndicatorSeparator: () => null
                }}
                styles={customStyles}
            />
          </Col>
          <Col xs={6} sm={6} lg={3}>
            <Select
                name="instrSems"
                placeholder={!isMobile ? "Select an option...": "Select..."}
                value={onePrimaryOption ? primaryOptions[1] : primaryOption}
                options={primaryOptions}
                onChange={this.handlePrimarySelect}
                isDisabled={!selectedClass}
                isClearable={false}
                components={{
                  IndicatorSeparator: () => null
                }}
                styles={customStyles}
            />
          </Col>
          <Col xs={6} sm={6} lg={3}>
            <Select
                name="section"
                placeholder={!isMobile ? "Select an option...": "Select..."}
                value={oneSecondaryOption ? secondaryOptions[1] : secondaryOption}
                options={secondaryOptions}
                onChange={this.handleSecondarySelect}
                isDisabled={!selectedClass}
                isClearable={false}
                components={{
                  IndicatorSeparator: () => null
                }}
                styles={customStyles}
            />
          </Col>
          <Col lg={2}>
            <Button
              className="btn-bt-green"
              onClick={this.addSelected}
              disabled={!selectedClass || !(selectPrimary && selectSecondary) || isFull}
            >
              Add Class
            </Button>
          </Col>
        </Row>
      </Container>
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
