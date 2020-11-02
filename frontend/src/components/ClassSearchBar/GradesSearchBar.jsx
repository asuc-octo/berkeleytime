import React, { Component } from 'react';
import Select from 'react-select-virtualized';
import {
  Container, Row, Col, Button,
} from 'react-bootstrap';
import hash from 'object-hash';

import { connect } from 'react-redux';
import FilterResults from '../Catalog/FilterResults';

import { fetchGradeSelected } from '../../redux/actions';
import { search } from 'utils/search';

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

    this.queryCache = {};

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
    if (nextProps.selectPrimary !== this.state.selectPrimary) {
      this.setState({
        selectPrimary: nextProps.selectPrimary,
      });
    }
    if (nextProps.selectSecondary !== this.state.selectSecondary) {
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
        selectPrimary: '',
        selectSecondary: '',
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
      selectPrimary: '',
      selectSecondary: ''
    });
  }

  handlePrimarySelect(primary) {
    const { sections } = this.props;
    const { selectType } = this.state;
    const secondaryOptions = this.buildSecondaryOptions(sections, selectType, primary.value);
    this.setState({
      selectPrimary: primary ? primary.value : '',
      selectSecondary: secondaryOptions.length === 1 ? secondaryOptions[0].value : 'all'
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
      if (sections.length > 1) {
        ret.push({ value: 'all', label: 'All Instructors' });
      }
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
      if (sections.length > 1) {
        ret.push({ value: 'all', label: 'All Semesters' });
      }
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

      if (options.length > 1) {
        const label = selectType === 'instructor' ? 'All Semesters' : 'All Instructors';
        ret.push({ value: 'all', label });
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
        options = sections.filter(section => this.getSectionSemester(section) === selectPrimary)
          .map(section => {
            const instructor = `${section.instructor} / ${section.section_number}`;
            return {
              value: instructor,
              label: instructor,
              sectionNumber: instructor.split(' / ')[1],
            };
          });
      }

      if (options.length > 1) {
        const label = selectType === 'instructor' ? 'All Semesters' : 'All Instructors';
        ret.push({ value: 'all', label });
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
    let semester = selectSecondary;
    let number = -1;
    if (selectSecondary.split(' ').length > 2) {
      semester = selectSecondary.split(' ').slice(0, 2).join(' ');
      number = selectSecondary.split(' ')[3];
    }
    let ret;

    if (selectType === 'instructor') {
      ret = sections.filter(section => (selectPrimary === 'all' ? true : section.instructor === selectPrimary))
        .filter(section => (semester === 'all' ? true : this.getSectionSemester(section) === semester))
        .filter(section => (number !== -1 ? section.section_number === number : true));
    } else {
      ret = sections.filter(section => (selectPrimary === 'all' ? true : this.getSectionSemester(section) === selectPrimary))
        .filter(section => (semester === 'all' ? true : section.instructor === semester))
        .filter(section => (number !== -1 ? section.section_number === number : true));
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

  filterOptions(option, query) {
    return search(query, option.lowercaseLabel, 0) >= 0;
    // Super non deterministic error where sometimes option.data or option.data.course
    // refers to the course dict???
    // https://github.com/asuc-octo/berkeleytime/issues/294
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
    const onePrimaryOption = primaryOptions && primaryOptions.length === 1 && selectPrimary;
    const oneSecondaryOption = secondaryOptions && secondaryOptions.length === 1 && selectSecondary;


    let primaryOption = { value: selectPrimary, label: selectPrimary };
    let secondaryOption = { value: selectSecondary, label: selectSecondary };

    if (selectType === 'instructor') {
      if (selectPrimary === 'all') {
        primaryOption = { value: 'all', label: 'All Instructors' };
      }
      if (selectSecondary === 'all') {
        secondaryOption = { value: 'all', label: 'All Semesters' };
      }
    } else {
      if (selectPrimary === 'all') {
        primaryOption = { value: 'all', label: 'All Semesters' };
      }
      if (selectSecondary === 'all') {
        secondaryOption = { value: 'all', label: 'All Instructors' };
      }
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
      <Container fluid className="grades-search-bar">
        <Row style={{ marginBottom: 10 }}>
          <Col lg={3}>
            <Select
              name="selectClass"
              placeholder="Choose a class..."
              options={this.buildCoursesOptions(classes)}
              onChange={this.handleClassSelect}
              filterOption={this.filterOptions}
              components={{
                IndicatorSeparator: () => null
              }}
              styles={customStyles}
            />
          </Col>
          {!isMobile ?
          <Col lg={2}>
            <Select
              name="sortBy"
              value={selectType === 'instructor' ? sortOptions[0] : sortOptions[1]}
              placeholder="Sort by"
              options={sortOptions}
              isClearable={false}
              onChange={this.handleSortSelect}
              isDisabled={!selectedClass}
              components={{
                IndicatorSeparator: () => null
              }}
              styles={customStyles}
            />
          </Col> : null }
          <Col xs={6} sm={6} lg={3}>
            <Select
              name="instrSems"
              placeholder={!isMobile ? "Select an option...": "Select..."}
              value={onePrimaryOption ? primaryOptions[0] : primaryOption}
              options={primaryOptions}
              onChange={this.handlePrimarySelect}
              isDisabled={!selectedClass}
              isClearable={false}
              searchable={false}
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
              value={oneSecondaryOption ? secondaryOptions[0] : secondaryOption}
              options={secondaryOptions}
              onChange={this.handleSecondarySelect}
              isDisabled={!selectedClass}
              isClearable={false}
              searchable={false}
              components={{
                IndicatorSeparator: () => null
              }}
              styles={customStyles}
            />
          </Col>
          <Col xs={12} sm={12} lg={1}>
            <Button
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
