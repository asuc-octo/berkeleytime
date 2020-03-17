import React, { Component } from 'react';
import Select from 'react-select-virtualized';
import {
  Container, Row, Col, Button,
} from 'react-bootstrap';
import hash from 'object-hash';

import { connect } from 'react-redux';
import { laymanToAbbreviation } from '../../variables/Variables';

import { fetchGradeSelected } from '../../redux/actions';

const sortOptions = [
  { value: 'instructor', label: 'By Instructor' },
  { value: 'semester', label: 'By Semester' },
];
class GradesSearchBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedClass: 0,
      selectType: 'instructor',
      selectPrimary: props.selectPrimary,
      selectSecondary: props.selectSecondary,
    };

    this.handleClassSelect = this.handleClassSelect.bind(this);
    this.handleSortSelect = this.handleSortSelect.bind(this);
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
    const { fromCatalog } = this.props;
    this.setState({
      selectType: 'instructor',
    });
    if (fromCatalog) {
      this.handleClassSelect({ value: fromCatalog.id, addSelected: true });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectPrimary != this.state.selectPrimary) {
      this.setState({
        selectPrimary: nextProps.selectPrimary,
      });
    }
    if (nextProps.selectSecondary != this.state.selectSecondary) {
      this.setState({
        selectSecondary: nextProps.selectSecondary,
      });
    }
  }

  handleClassSelect(updatedClass) {
    const { fetchGradeSelected } = this.props;
    if (updatedClass === null) {
      this.reset();
      this.setState({
        selectedClass: 0,
      });
      return;
    }

    this.setState({
      selectedClass: updatedClass.value,
    });

    fetchGradeSelected(updatedClass);
  }

  handleSortSelect(sortBy) {
    this.setState({
      selectType: sortBy.value,
    });
  }

  handlePrimarySelect(primary) {
    this.setState({
      selectPrimary: primary ? primary.value : '',
      selectSecondary: 'all',
    });
  }

  handleSecondarySelect(secondary) {
    this.setState({
      selectSecondary: secondary ? secondary.value : '',
    });
  }

  buildCoursesOptions(courses) {
    if (!courses) {
      return [];
    }

    const options = courses.map(course => ({
      value: course.id,
      label: `${course.abbreviation} ${course.course_number}`,
      course,
    }));

    return options;
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  getSectionSemester(section) {
    return `${this.capitalize(section.semester)} ${section.year}`;
  }

  buildPrimaryOptions(sections, selectType) {
    const ret = [];
    const map = new Map();

    if (selectType === 'instructor') {
      ret.push({ value: 'all', label: 'All Instructors' });

      for (const section of sections) {
        if (!map.has(section.instructor)) {
          map.set(section.instructor, true);
          ret.push({
            value: section.instructor,
            label: section.instructor,
          });
        }
      }
    } else {
      ret.push({ value: 'all', label: 'All Semesters' });

      for (const section of sections) {
        const semester = this.getSectionSemester(section);
        if (!map.has(semester)) {
          map.set(semester, true);
          ret.push({
            value: semester,
            label: semester,
          });
        }
      }
    }

    return ret;
  }

  buildSecondaryOptions(sections, selectType, selectPrimary) {
    const ret = [];

    const label = selectType === 'instructor' ? 'All Semesters' : 'All Instructors';
    ret.push({ value: 'all', label });

    if (selectPrimary === 'all') {
      let options;
      if (selectType === 'instructor') {
        options = [...new Set(sections.map(s => `${this.getSectionSemester(s)} / ${s.section_number}`))]
          .map(semester => ({
            value: semester.split(' / ')[0],
            label: semester,
            sectionNumber: semester.split(' / ')[1],
          }));
      } else {
        options = [...new Set(sections.map(s => `${s.instructor} / ${s.section_number}`))]
          .map(instructor => ({
            value: instructor.split(' / ')[0],
            label: instructor,
            sectionNumber: instructor.split(' / ')[1],
          }));
      }

      for (const o of options) {
        ret.push(o);
      }
    } else {
      let options;
      if (selectType === 'instructor') {
        options = sections.filter(section => section.instructor === selectPrimary)
          .map(section => {
            const semester = `${this.getSectionSemester(section)} / ${section.section_number}`;

            return {
              value: semester,
              label: semester,
              sectionNumber: semester.split(' / ')[1],
            };
          });
      } else {
        options = sections.filter(section => this.getSectionSemester(section) == selectPrimary)
          .map(section => {
            const instructor = `${section.instructor} / ${section.section_number}`;

            return {
              value: instructor,
              label: instructor,
              sectionNumber: instructor.split(' / ')[1],
            };
          });
      }

      for (const o of options) {
        ret.push(o);
      }
    }

    return ret;
  }

  getFilteredSections() {
    const {
      selectType, sectionNumber, selectPrimary, selectSecondary,
    } = this.state;
    const { sections } = this.props;
    let ret;

    if (selectType === 'instructor') {
      ret = sections.filter(section => (selectPrimary === 'all' ? true : section.instructor === selectPrimary))
        .filter(section => (selectSecondary === 'all' ? true : this.getSectionSemester(section) === selectSecondary))
        .filter(section => (sectionNumber ? section.section_number === sectionNumber : true));
    } else {
      ret = sections.filter(section => (selectPrimary === 'all' ? true : this.getSectionSemester(section) === selectPrimary))
        .filter(section => (selectSecondary === 'all' ? true : section.instructor === selectSecondary))
        .filter(section => (sectionNumber ? section.section_number === sectionNumber : true));
    }

    ret = ret.map(s => s.grade_id);
    return ret;
  }

  addSelected() {
    const {
      selectedClass, selectType, selectPrimary, selectSecondary,
    } = this.state;
    const playlist = {
      courseID: selectedClass,
      instructor: selectType === 'instructor' ? selectPrimary : selectSecondary,
      semester: selectType === 'semester' ? selectPrimary : selectSecondary,
      sections: this.getFilteredSections(),
    };

    playlist.id = hash(playlist);
    this.props.addCourse(playlist);
    this.reset();
  }

  courseMatches(option, query) {
    const { course } = option;
    const courseMatches = (`${course.abbreviation} ${course.course_number} ${course.title} ${course.department}`).toLowerCase().indexOf(query) !== -1;
    let otherNumber;
    if (course.course_number.indexOf('C') !== -1) { // if there is a c in the course number
      otherNumber = course.course_number.substring(1);
    } else { // if there is not a c in the course number
      otherNumber = `C${course.course_number}`;
    }
    const courseFixedForCMatches = (`${course.abbreviation} ${course.course_number} ${course.title} ${course.department}`).toLowerCase().indexOf(query) !== -1;
    return courseMatches || courseFixedForCMatches;
  }

  filterCourses(option, query) {
    if (query.trim() === '') { return true; }
    const querySplit = query.toUpperCase().split(' ');
    if (querySplit[0] in laymanToAbbreviation) {
      querySplit[0] = laymanToAbbreviation[querySplit[0]];
    }
    query = query.toLowerCase();
    const pseudoQuery = querySplit.join(' ').toLowerCase();
    const useOriginalQuery = (querySplit.length === 1 && query !== pseudoQuery);
    return (useOriginalQuery && this.courseMatches(option, query)) || this.courseMatches(option, pseudoQuery);
  }

  filterOptions(options, query) {
    return options.filter(option => this.filterCourses(option, query));
  }

  reset() {
    this.setState({
      selectPrimary: '',
      selectSecondary: '',
    });
  }

  render() {
    const { classes, isFull, isMobile } = this.props;
    const {
      selectType, selectPrimary, selectSecondary, selectedClass,
    } = this.state;
    const { sections } = this.props;
    const primaryOptions = this.buildPrimaryOptions(sections, selectType);
    const secondaryOptions = this.buildSecondaryOptions(sections, selectType, selectPrimary);
    const onePrimaryOption = primaryOptions && primaryOptions.length == 2 && selectPrimary;
    const oneSecondaryOption = secondaryOptions && secondaryOptions.length == 2 && selectSecondary;


    let primaryOption = { value: selectPrimary, label: selectPrimary };
    let secondaryOption = { value: selectSecondary, label: selectSecondary };

    if (selectType == 'instructor') {
      if (selectPrimary == 'all') {
        primaryOption = { value: 'all', label: 'All Instructors' };
      }
      if (selectSecondary == 'all') {
        secondaryOption = { value: 'all', label: 'All Semesters' };
      }
    } else {
      if (selectPrimary == 'all') {
        primaryOption = { value: 'all', label: 'All Semesters' };
      }
      if (selectSecondary == 'all') {
        secondaryOption = { value: 'all', label: 'All Instructors' };
      }
    }

    if (selectPrimary == '') {
      primaryOption = '';
    }
    if (selectSecondary == '') {
      secondaryOption = '';
    }


    return (
      <Container fluid className="grades-search-bar">
        <Row style={{ marginBottom: 10 }}>
          <Col lg={3}>
            <Select
              name="selectClass"
              placeholder="Choose a class..."
              options={this.buildCoursesOptions(classes)}
              onChange={this.handleClassSelect}
              filterOptions={this.filterOptions}
            />
          </Col>
          {!isMobile ?
          <Col lg={2}>
            <Select
              name="sortBy"
              value={selectType == 'instructor' ? sortOptions[0] : sortOptions[1]}
              placeholder="Sort by"
              options={sortOptions}
              clearable={false}
              onChange={this.handleSortSelect}
              disabled={!selectedClass}
            />
          </Col> : null }
          <Col xs={6} sm={6} lg={3}>
            <Select
              name="instrSems"
              placeholder={!isMobile ? "Select an option...": "Select..."}
              value={onePrimaryOption ? primaryOptions[1] : primaryOption}
              options={primaryOptions}
              onChange={this.handlePrimarySelect}
              disabled={!selectedClass}
              clearable={false}
              searchable={false}
            />
          </Col>
          <Col xs={6} sm={6} lg={3}>
            <Select
              name="section"
              placeholder={!isMobile ? "Select an option...": "Select..."}
              value={oneSecondaryOption ? secondaryOptions[1] : secondaryOption}
              options={secondaryOptions}
              onChange={this.handleSecondarySelect}
              disabled={!selectedClass}
              clearable={false}
              searchable={false}
            />
          </Col>
          <Col lg={1}>
            <Button
              onClick={this.addSelected}
              disabled={!selectedClass || !(selectPrimary && selectSecondary) || isFull}
            >
              Add
            </Button>
          </Col>
        </Row>
      </Container>
    );
  }
}


const mapDispatchToProps = dispatch => ({
  dispatch,
  fetchGradeSelected: (updatedClass) => dispatch(fetchGradeSelected(updatedClass)),
});

const mapStateToProps = state => {
  const { sections, selectPrimary, selectSecondary } = state.grade;
  return {
    sections,
    selectPrimary,
    selectSecondary,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(GradesSearchBar);
