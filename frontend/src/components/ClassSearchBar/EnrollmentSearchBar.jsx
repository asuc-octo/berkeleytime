import React, { Component } from 'react';
import Select from 'react-virtualized-select';
import axios from 'axios';
import hash from 'object-hash';

import { laymanToAbbreviation } from '../../variables/Variables';

import 'react-select/dist/react-select.css'
import 'react-virtualized-select/styles.css'

class EnrollmentSearchBar extends Component {

  constructor(props) {
    super(props);

    this.state = {
      selectedClass: 0,
      selectType: '',
      selectPrimary: '',
      selectSecondary: '',
      sections: [],
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
    this.setState({
      selectType: 'semester',
    });
    if(fromCatalog) {
      this.handleClassSelect({value: fromCatalog.id, addSelected: true});
    }
  }

  handleClassSelect(updatedClass) {
    if(updatedClass === null) {
      this.reset();
      this.setState({
        selectedClass: 0,
      })
      return;
    }

    this.setState({
      selectedClass: updatedClass.value
    })

    let url = `/api/enrollment/sections/${updatedClass.value}/`

    axios.get(url)
    .then(res => {
      // console.log(res);
      if (!res || Object.keys(res).length === 0) {
        return;
      }
      let sections = res.data
      this.setState({
        sections: sections,
        selectPrimary: this.getSectionSemester(sections[0]),
        selectSecondary: 'all',
      });
      if (updatedClass.addSelected) {
        this.addSelected();
        this.handleClassSelect({value: updatedClass.value, addSelected: false});
      }
    })
    .catch((err) => {
      console.log(err);
    });
  }

  handlePrimarySelect(primary) {
    this.setState({
      selectPrimary: primary ? primary.value : '',
      selectSecondary: 'all',
    })
  }

  handleSecondarySelect(secondary) {
    this.setState({
      selectSecondary: secondary ? secondary.value: '',
    })
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

  buildSecondaryOptions(sections, selectPrimary) {
    const ret = [];
    ret.push({ value: 'all', label: 'All Instructors' })

    let options = sections.filter(semester => this.getSectionSemester(semester) === selectPrimary)
        .map(semester => {
        let sections = semester.sections.map(section => {
          let selectedInstr = section.instructor;
          if (selectedInstr === null) {
            selectedInstr = "None";
          }
          let instructor = `${selectedInstr} / ${section.section_number}`;
          return {
            value: instructor,
            label: instructor,
            sectionNumber: instructor.split(' / ')[1].trim(),
          };
        });
        return sections;
      });

    for(let o of options) {
      for (let s of o) {
        ret.push(s);
      }
    }
    return ret;
  }

  getFilteredSections() {
    const { sections, selectPrimary, selectSecondary, sectionNumber } = this.state;
    let ret = [];

    let selectedPrimaries = sections.filter(section => {
      return this.getSectionSemester(section) === selectPrimary;
    });
    
    for (let p of selectedPrimaries) {
        for (let s of p.sections) {
            ret.push(s);
        }
    }
    
    ret = ret.filter(section => {
      if (selectSecondary === 'all') {
        return true;
      }
      let selectedInstr = selectSecondary.split(' / ')[0].trim();
      let selectedSec = selectSecondary.split(' / ')[1].trim();
      if (selectedInstr === "None") {
        return section.section_number === selectedSec;
      }
      return section.instructor === selectedInstr && section.section_number === selectedSec;
    })
    .filter(section => {
      return sectionNumber ? section.section_number === sectionNumber : true;
    })
    .map(s => s.section_id);

    return ret;
  }

  addSelected() {
    const { selectedClass, selectType, selectPrimary, selectSecondary } = this.state;
    let playlist = {
      courseID: selectedClass,
      instructor: selectType === 'instructor' ? selectPrimary : selectSecondary,
      semester: selectType === 'semester' ? selectPrimary : selectSecondary,
      sections: this.getFilteredSections(),
    }

    playlist.id = hash(playlist);

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
    const { classes, isFull } = this.props;
    const { sections, selectPrimary, selectSecondary, selectedClass } = this.state;
    let primaryOptions = this.buildPrimaryOptions(sections);
    let secondaryOptions = this.buildSecondaryOptions(sections, selectPrimary);
    let onePrimaryOption = primaryOptions && primaryOptions.length == 2 && selectPrimary;
    let oneSecondaryOption = secondaryOptions && secondaryOptions.length == 2 && selectSecondary;

    return (
      <div className="columns">
        <div className="column is-one-third">
          <Select
              name="selectClass"
              placeholder="Choose a class..."
              value={selectedClass}
              options={this.buildCoursesOptions(classes)}
              onChange={this.handleClassSelect}
              filterOptions={this.filterOptions}
          />
        </div>
        <div className="column is-one-fifth">
          <Select
              name="instrSems"
              placeholder="Select an option..."
              value={onePrimaryOption ? primaryOptions[1] : selectPrimary}
              options={primaryOptions}
              onChange={this.handlePrimarySelect}
              disabled={!selectedClass}
              clearable={false}
          />
        </div>
        <div className="column is-one-fifth">
          <Select
              name="section"
              placeholder="Select an option..."
              value={oneSecondaryOption ? secondaryOptions[1] : selectSecondary}
              options={secondaryOptions}
              onChange={this.handleSecondarySelect}
              disabled={!selectedClass}
              clearable={false}
          />
        </div>
        <div className="column is-one-fifth">
          <button
            className="button is-success"
            onClick={this.addSelected}
            disabled={!selectedClass || !(selectPrimary && selectSecondary) || isFull}
          >
            Add
          </button>
        </div>
      </div>
    );
  }
}

export default EnrollmentSearchBar;
