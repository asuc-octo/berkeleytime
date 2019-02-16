import React, { Component } from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

export class ClassSearchBar extends Component {

  constructor(props) {
    super(props);

    this.handleClassSelect = this.handleClassSelect.bind(this);
    this.handleSortSelect = this.handleSortSelect.bind(this);
    this.handleOptionSelect = this.handleOptionSelect.bind(this);
    this.handleSectionSelect = this.handleSectionSelect.bind(this);

    this.state = {
      classSelected: '',
      sortSelected: '',
      optionSelected: '',
      sectionSelected: '',
      instrSems: [],
      sections: [],
      isDisabled: true,
    }
  }

  handleClassSelect(e) {
    this.setState({classSelected: e})
    if(this.state.sortSelected) {
        this.setState({isDisabled: false})
    } 
  }

  handleSortSelect(e) {
    this.setState({sortSelected: e})
    if(e) {
      var value = e.value;
      if(value == 'instructor') {
        this.setState({ instrSems: this.props.instructors})
      } else {
        this.setState({ instrSems: this.props.semesters})
      }
      if(this.state.classSelected) {
        this.setState({isDisabled: false})
      } 
    }
  }

  handleOptionSelect(e) {
    this.setState({ optionSelected: e})
  }

  handleSectionSelect(e) {
    this.setState({ sectionSelected: e})
  }

  render() {
    const { classes, sortOptions, instructors, semesters, sections } = this.props;

    return (
      <div className="columns">
        <div className="column is-one-third">
          <Select
              name="class"
              placeholder="Choose another class to compare..."
              value={this.state.classSelected}
              options={classes}
              onChange={this.handleClassSelect}
          />
        </div>
        <div className="column is-one-fifth">
          <Select
              name="sortBy"
              placeholder="Sort by"
              value={this.state.sortSelected}
              options={sortOptions}
              onChange={this.handleSortSelect}
          />
        </div>
        <div className="column is-one-fifth">
          <Select
              name="instrSems"
              placeholder="Choose an option"
              value={this.state.optionSelected}
              options={this.state.instrSems}
              onChange={this.handleOptionSelect}
              disabled={this.state.isDisabled ? true : null}
          />
        </div>
        <div className="column is-one-fifth">
          <Select
              name="section"
              placeholder="Choose an option"
              value={this.state.sectionSelected}
              options={this.state.sectionSelected}
              onChange={this.handleSectionSelect}
              disabled={this.state.isDisabled ? true : null}
          />
        </div>
        <div className="column is-one-fifth">
          <a class="button is-success">Add</a>
        </div>
      </div>
    );
  }
}

ClassSearchBar.defaultProps = {
  classes: [
   { value: 'AEROSPC100', label: 'AEROSPC100' },
   { value: 'CS61A', label: 'CS61A' }
  ],
  sortOptions: [
    { value: 'instructor', label: 'Instructor' }, 
    { value: 'semester', label: 'Semester' }
  ],
  instructors: [
   { value: 'DENERO', label: 'DENERO' },
   { value: 'HUG', label: 'HUG' }
  ],
  semesters: [
   { value: 'FA17', label: 'FALL 2017' },
   { value: 'FA16', label: 'FALL 2016' }
  ],
  sections: [
   { value: 'ALL', label: 'ALL SECTIONS' },
  ],
}

export default ClassSearchBar;
