import React, { Component } from 'react';
import { Grid, Row, Col } from 'react-bootstrap';

import axios from 'axios';

import FilterSidebar from '../../components/FilterSidebar/FilterSidebar.jsx';
import FilterResults from '../../components/FilterSidebar/FilterResults.jsx';
import ClassDescription from '../../components/ClassDescription/ClassDescription.jsx';


class Catalog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      query: '',
      sortBy: 'grade_average',
      unitsRange: [0, 6],
      activeFilters: new Set(),
      defaultFilters: new Set(),
      context: {},
      selectedCourse: {},
    };

    this.buildFiltersObject = this.buildFiltersObject.bind(this);
    this.searchQueryHandler = this.searchQueryHandler.bind(this);
    this.sortHandler = this.sortHandler.bind(this);
    this.unitsRangeHandler = this.unitsRangeHandler.bind(this);
    this.addFilterHandler = this.addFilterHandler.bind(this);
    this.removeFilterHandler = this.removeFilterHandler.bind(this);
    this.toggleFilterHandler = this.toggleFilterHandler.bind(this);
    this.selectFilterHandler = this.selectFilterHandler.bind(this);
    this.resetFilterHandler = this.resetFilterHandler.bind(this);
    this.rangeFilterHandler = this.rangeFilterHandler.bind(this);
    this.selectCourseHandler = this.selectCourseHandler.bind(this);
    this.setDefaultSearch = this.setDefaultSearch.bind(this);

    this.tab = 0;
    this.defaultSearch = '';
    this.setDefaultSearch();
  }

  setDefaultSearch() {
    const paths = this.props.history.location.pathname.split('/');
    if (paths.length >= 4) {
      const abbreviation = paths[2];
      const classNum = paths[3];
      this.defaultSearch = `${abbreviation} ${classNum} `;
    }
  }

  /**
   * Lifecycle method for getting initial data
   */
  componentDidMount() {
    const paths = this.props.history.location.pathname.split('/');
    //handler for specific class in URL
    if (paths.length >= 4) {
      const abbreviation = paths[2];
      const classNum = paths[3];
      const search = `${abbreviation} ${classNum} `;
      this.searchQueryHandler(search);
      axios.get(`/api/catalog/catalog_json/filters/${abbreviation}/${classNum}/`).then(res => {
        const defaultPlaylists = res.data.default_playlists.split(',').map(str => parseInt(str));
        this.setState({
          activeFilters: new Set(defaultPlaylists),
          defaultFilters: new Set(defaultPlaylists),
          context: res.data
        }, () => {
          const courseID = res.data.default_course;
          axios.get('/api/catalog/filter/', {params: {course_id: courseID}}).then(res => {
            if (res.data.length > 0) {
              //tab = 0: details; tab = 1: section
              var tab = 0;
              if (paths.length >= 5) {
                tab = paths[4] === "sections" ? 0 : tab;
              }
              this.selectCourseHandler(res.data[0], tab);
            }
          }).catch(err => {
            console.log(err);
          })
        });
      }).catch((err) => {
        console.log(err);
      });
    } else {
      axios.get('/api/catalog/catalog_json/filters/')
        .then(res => {
          //console.log(res);
          const defaultPlaylists = res.data.default_playlists.split(',').map(str => parseInt(str));
          this.setState({
            activeFilters: new Set(defaultPlaylists),
            defaultFilters: new Set(defaultPlaylists),
            context: res.data
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  /**
   *
   * @param {String} searchQuery
   *
   * Handler function for search function
   */
  searchQueryHandler(searchQuery) {
    this.setState({
      query: searchQuery
    })
  }

  /**
   *
   * @param {String} sortAttribute
   *
   * Sorts courses based on sortAttribute
   */
  sortHandler(sortAttribute) {
    this.setState({
      sortBy: sortAttribute,
    })
  }

  /**
   *
   * @param {Array[min, max]} newRange
   *
   * Sets the state of the range based on the min and max values
   */
  unitsRangeHandler(newRange) {
    this.setState({
      unitsRange: newRange
    })
  }

  rangeFilterHandler(addFilterIds, removeFilterIds) {
    let newActiveFilters = new Set(this.state.activeFilters);
    for (let filterId of addFilterIds) {
      newActiveFilters.add(parseInt(filterId));
    }
    for (let filterId of removeFilterIds) {
      newActiveFilters.delete(parseInt(filterId));
    }

    this.setState({
      activeFilters: newActiveFilters
    })
  }

  /**
   *
   * @param {String} filterID
   *
   * Handler function for adding a filter ID to those that are active
   */
  addFilterHandler(filterID) {
    filterID = parseInt(filterID);
    this.setState(prevState => ({
      activeFilters: prevState.activeFilters.add(filterID)
    }));
  }

  /**
   *
   * @param {String} filterID
   *
   * Handler function for removing a filter ID to those that are active
   */
  removeFilterHandler(filterID) {
    filterID = parseInt(filterID);
    this.setState(prevState => {
      prevState.activeFilters.delete(filterID)
      return {
        activeFilters: prevState.activeFilters
      }
    });
  }

  /**
   *
   * @param {String} filterID
   *
   * Handler function for toggling a filter ID
   */
  toggleFilterHandler(filterID) {
    filterID = parseInt(filterID);
    let newActiveFilters;
    // console.log(filterID);
    // console.log(this.state.activeFilters)
    if(this.state.activeFilters.has(filterID)) {
      newActiveFilters = new Set(this.state.activeFilters);
      newActiveFilters.delete(filterID);
    } else {
      newActiveFilters = new Set(this.state.activeFilters).add(filterID);
    }

    this.setState({
      activeFilters: newActiveFilters
    });
  }

  /**
   *
   * @param {String} lastFilterID
   * @param {String} newFilterID
   *
   * Handler function for select options in our FilterSidebar component
   */
  selectFilterHandler(lastFilterID, newFilterID) {
    lastFilterID = parseInt(lastFilterID);
    newFilterID = parseInt(newFilterID);

    if (lastFilterID !== newFilterID) {
      let newActiveFilters = new Set(this.state.activeFilters);
      newActiveFilters.delete(lastFilterID);
      newActiveFilters.add(newFilterID);

      this.setState({
        activeFilters: newActiveFilters
      });
    }
  }

  /**
   * Handler function to reset all filters to the default
   */
  resetFilterHandler() {
    console.log(this.state);
    this.defaultSearch = '';
    let newActiveFilters = new Set(this.state.defaultFilters);
    this.setState({
      query: '',
      sortBy: 'grade_average',
      unitsRange: [0, 6],
      activeFilters: newActiveFilters
    })
  }

  selectCourseHandler(course, tab=0) {
    this.tab = tab;
    this.setState({
      selectedCourse: course,
    })
  }

  /**
   *
   * @param {Array} filters
   * Builds the filters returned by the catalog API into a format that can be processed by our component
   */
  buildFiltersObject(filters) {
    const department = filters.department && filters.department.map(filter => {
      let modifiedFilter = {};
      modifiedFilter.value = filter.id;
      modifiedFilter.label = filter.name;
      return modifiedFilter;
    })

    return ({
      requirements: {
        university: {
            title: 'University Requirements',
            options: filters.university,
        },
        ls: {
            title: 'L&S Breadths',
            options: filters.ls,
        },
        engineering: {
            title: 'College of Engineering',
            options: filters.engineering,
        },
        haas: {
            title: 'Haas Breadths',
            options: filters.haas,
        },
      },
      logistics: {
          classLevel: {
              title: 'Class Level',
              options: filters.level,
          },
          semesterOffered: {
              title: 'Semesters Offered',
              options: filters.semester,
        },
      },
      department: department,
      units: filters.units,
      sortAttributes: [
        { value: 'grade_average', label: 'Average Grade' },
        { value: 'department_name', label: 'Department Name' },
        { value: 'open_seats', label: 'Open Seats' },
        { value: 'enrolled_percentage', label: 'Enrolled Percentage' }
      ],
    })
  }

  render() {
    let results = this.state && this.state.activeFilters.size ? (
      <FilterResults
        activeFilters={this.state.activeFilters}
        selectCourse={this.selectCourseHandler}
        sortBy={this.state.sortBy}
        query={this.state.query}
      />
    ) : <div></div>
    console.log(this.defaultSearch);

    return (
      <div className="app-container">
          <div className="filter-columns">
              <FilterSidebar
                filters={this.buildFiltersObject(this.state.context)}
                activeFilters={this.state.activeFilters}
                searchHandler={this.searchQueryHandler}
                sortHandler={this.sortHandler}
                unitsRangeHandler={this.unitsRangeHandler}
                sortBy={this.state.sortBy}
                unitsRange={this.state.unitsRange}
                addFilter={this.addFilterHandler}
                rangeFilter={this.rangeFilterHandler}
                removeFilter={this.removeFilterHandler}
                toggleFilter={this.toggleFilterHandler}
                selectFilter={this.selectFilterHandler}
                resetFilters={this.resetFilterHandler}
                defaultSearch={this.defaultSearch}
              />
            <div> {results} </div>
            <div> {this.state && Object.entries(this.state.selectedCourse).length !== 0 &&
                <ClassDescription
                  course={this.state.selectedCourse}
                  tab={this.tab}
                />
            } </div>
          </div>
      </div>
    );
  }
}

export default Catalog;
