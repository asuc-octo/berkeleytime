import React, { Component } from 'react';
import Select from 'react-virtualized-select';
import axios from 'axios';
import hash from 'object-hash';

import 'react-select/dist/react-select.css'
import 'react-virtualized-select/styles.css'

//think about clearing values after add button

const sortOptions = [
  { value: 'instructor', label: 'By Instructor' },
  { value: 'semester', label: 'By Semester' }
];
class ClassSearchBar extends Component {

  constructor(props) {
    super(props);

    this.state = {
      selectedClass: 0,
      courseOptions: [],
      selectType: '',
      selectPrimary: '',
      selectSecondary: '',
      sections: [],
    }

    this.handleClassSelect = this.handleClassSelect.bind(this);
    this.handleSortSelect = this.handleSortSelect.bind(this);
    this.handlePrimarySelect = this.handlePrimarySelect.bind(this);
    this.handleSecondarySelect = this.handleSecondarySelect.bind(this);
    this.buildCoursesOptions = this.buildCoursesOptions.bind(this);
    this.buildPrimaryOptions = this.buildPrimaryOptions.bind(this);
    this.buildSecondaryOptions = this.buildSecondaryOptions.bind(this);
    this.getFilteredSections = this.getFilteredSections.bind(this);
    this.addSelected = this.addSelected.bind(this);
  }

  componentDidMount() {
    const { isEnrollment } = this.props;
    this.setState({
      courseOptions: this.buildCoursesOptions(this.props.classes),
      selectType: isEnrollment ? 'semester' : 'instructor',
    })
  }

  handleClassSelect(updatedClass) {
    if(updatedClass === null) {
      this.setState({
        selectedClass: 0,
      })
      return;
    }


    const { isEnrollment } = this.props;
    this.setState({
      selectedClass: updatedClass.value
    })

    let url;
    if(isEnrollment) {
      url = `/api/enrollment/sections/${updatedClass.value}/`
    } else {
      url = `/api/grades/course_grades/${updatedClass.value}/`
    }

    axios.get(url)
    .then(res => {
      console.log(res);
      this.setState({
        sections: res.data,
        selectPrimary: '',
        selectSecondary: '',
      })
    })
    .catch((err) => {
      console.log(err);
    });
  }

  handleSortSelect(sortBy) {
    this.setState({
      selectType: sortBy.value,
    })
  }

  handlePrimarySelect(primary) {
    this.setState({
      selectPrimary: primary ? primary.value : '',
      selectSecondary: '',
    })
  }

  handleSecondarySelect(secondary) {
    this.setState({
      selectSecondary: secondary ? secondary.value: '',
    })
  }

  buildCoursesOptions(courses) {
    let options = courses.map(course => ({
      value: course.id,
      label: `${course.abbreviation} ${course.course_number}`,
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
    const { isEnrollment } = this.props;

    if(selectType == 'instructor') {
      ret.push({ value: 'all', label: "All Instructors" })

      for(const section of sections) {
        if(!map.has(section.instructor)) {
          map.set(section.instructor, true);
          ret.push({
            value: section.instructor,
            label: section.instructor,
          })
        }
      }
    } else {
      if(!isEnrollment) {
        ret.push({ value: 'all', label: "All Semesters" })
      }

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
    }

    return ret;
  }

  buildSecondaryOptions(sections, selectType, selectPrimary) {
    const { isEnrollment } = this.props;
    const ret = [];

    let label = selectType == 'instructor' ? 'All Semesters' : 'All Instructors';
    ret.push({ value: 'all', label: label })

    if(selectPrimary == 'all') {
      let options;
      if(selectType == 'instructor') {
        options = [...new Set(sections.map(s => `${this.getSectionSemester(s)} / ${s.section_number}`))]
        .map(semester => ({
          value: semester.split(' / ')[0],
          label: semester,
          sectionNumber: semester.split(' / ')[1],
        }))
      } else {
        options = [...new Set(sections.map(s => `${s.instructor} / ${s.section_number}`))]
        .map(instructor => ({
          value: instructor.split(' / ')[0],
          label: instructor,
          sectionNumber: instructor.split(' / ')[1],
        }))
      }

      for(let o of options) {
        ret.push(o);
      }
    } else {
      let options;
      if(selectType == 'instructor') {
        options = sections.filter(section => section.instructor == selectPrimary)
          .map(section => {
            let semester = `${this.getSectionSemester(section)} / ${section.section_number}`

            return {
              value: semester.split(' / ')[0],
              label: semester,
              sectionNumber: semester.split(' / ')[1],
            }
          })
      } else {
        options = sections.filter(section => this.getSectionSemester(section) == selectPrimary)
          .map(section => {
            section = isEnrollment ? section.sections[0] : section;

            let instructor = `${section.instructor} / ${section.section_number}`;

            return {
              value: instructor.split(' / ')[0],
              label: instructor,
              sectionNumber: instructor.split(' / ')[1],
            }
          })
      }

      for(let o of options) {
        ret.push(o);
      }
    }

    return ret;
  }

  getFilteredSections() {
    const { isEnrollment } = this.props;
    const { sections, selectType, selectPrimary, selectSecondary, sectionNumber } = this.state;
    let ret;

    if(selectType == 'instructor') {
      ret = sections.filter(section => {
        return selectPrimary == 'all' ? true : section.instructor == selectPrimary;
      })
      .filter(section => {
        return selectSecondary == 'all' ? true : this.getSectionSemester(section) == selectSecondary;
      })
      .filter(section => {
        return sectionNumber ? section.section_number == sectionNumber : true;
      })
    } else {
      ret = sections.filter(section => {
        return selectPrimary == 'all' ? true : this.getSectionSemester(section) == selectPrimary;
      })
      .filter(section => {
        section = isEnrollment ? section.sections[0] : section;
        return selectSecondary == 'all' ? true : section.instructor == selectSecondary;
      })
      .filter(section => {
        section = isEnrollment ? section.sections[0] : section;
        return sectionNumber ? section.section_number == sectionNumber : true;
      })
    }


    if(isEnrollment) {
      ret = ret.map(s => s.sections[0].section_id);
    } else {
      ret = ret.map(s => s.grade_id);
    }

    return ret;
  }

  addSelected() {
    const { selectedClass, selectType, selectPrimary, selectSecondary } = this.state;
    let playlist = {
      courseID: selectedClass,
      instructor: selectType == 'instructor' ? selectPrimary : selectSecondary,
      semester: selectType == 'semester' ? selectPrimary : selectSecondary,
      sections: this.getFilteredSections(),
    }

    playlist.id = hash(playlist);

    this.props.addCourse(playlist)
  }

  render() {
    const { sections, selectType, selectPrimary, selectSecondary, selectedClass, courseOptions } = this.state;
    const { isEnrollment } = this.props;
    let primaryOptions = this.buildPrimaryOptions(sections, selectType);
    let secondaryOptions = this.buildSecondaryOptions(sections, selectType, selectPrimary);

    return (
      <div className="columns">
        <div className="column is-one-third">
          <Select
              name="selectClass"
              placeholder="Choose a class..."
              value={selectedClass}
              options={courseOptions}
              onChange={this.handleClassSelect}
          />
        </div>
        {!isEnrollment &&
          <div className="column is-one-fifth">
            <Select
                name="sortBy"
                placeholder="Sort by"
                value={selectType}
                options={sortOptions}
                onChange={this.handleSortSelect}
            />
          </div>
        }
        <div className="column is-one-fifth">
          <Select
              name="instrSems"
              placeholder="Select an option..."
              value={selectPrimary}
              options={primaryOptions}
              onChange={this.handlePrimarySelect}
              disabled={!selectedClass}
              clearable={false}
              searchable={false}
          />
        </div>
        <div className="column is-one-fifth">
          <Select
              name="section"
              placeholder="Select an option..."
              value={selectSecondary}
              options={secondaryOptions}
              onChange={this.handleSecondarySelect}
              disabled={!selectedClass}
              clearable={false}
              searchable={false}
          />
        </div>
        <div className="column is-one-fifth">
          <button
            className="button is-success"
            onClick={this.addSelected}
            disabled={!selectedClass || !(selectPrimary && selectSecondary)}
          >
            Add
          </button>
        </div>
      </div>
    );
  }
}

ClassSearchBar.defaultProps = {
  isSortable: true,
}

export default ClassSearchBar;