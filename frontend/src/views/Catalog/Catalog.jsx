import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import HashLoader from 'react-spinners/HashLoader';

import axios from 'axios';

import FilterSidebar from '../../components/FilterSidebar/FilterSidebar';
import FilterResults from '../../components/FilterSidebar/FilterResults';
import ClassDescription from '../../components/ClassDescription/ClassDescription';



class Catalog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      search: '',                    // current search
      sortBy: 'grade_average',       // either grade_average, ...
      unitsRange: [0, 6],            // current unit range
      activePlaylists: new Set(),    // set of integers
      defaultPlaylists: new Set(),   // set of integers
      context: {},                   // entire api data response
      selectedCourse: {},
      loadedData: false,
    };

    this.buildFiltersObject = this.buildFiltersObject.bind(this);
    this.addFilterHandler = this.addFilterHandler.bind(this);
    this.removeFilterHandler = this.removeFilterHandler.bind(this);
    this.toggleFilterHandler = this.toggleFilterHandler.bind(this);
    this.selectFilterHandler = this.selectFilterHandler.bind(this);
    this.rangeFilterHandler = this.rangeFilterHandler.bind(this);
    this.selectCourseHandler = this.selectCourseHandler.bind(this);

    this.tab = 0;
    this.defaultSearch = '';
    this.setDefaultSearch();
  }

  /**
   * Lifecycle method for getting initial data
   */
  componentDidMount() {
    const paths = this.props.history.location.pathname.split('/');
    if (paths.length >= 4) {
      // if a class is provided in url, then we get from specific endpoint
      const abbreviation = paths[2];
      const classNum = paths[3];
      const search = `${abbreviation} ${classNum} `;
      this.searchHandler(search);

      axios.get(`http://localhost:8080/api/catalog_json/${abbreviation}/${classNum}/`)
        .then(res => {
          console.log(res);
          const defaultPlaylists = res.data.default_playlists.split(',').map(str => parseInt(str));

          this.setState({
            activePlaylists: new Set(defaultPlaylists),
            defaultPlaylists: new Set(defaultPlaylists),
            context: res.data,
            loadedData: true,
          }, () => {
            const courseID = res.data.default_course;
            axios.get('http://localhost:8000/api/catalog/filter/', { params: { course_id: courseID }})
              .then(res2 => {
                if (res2.data.length > 0) {
                  // tab = 0: details; tab = 1: section
                  let tab = 0;
                  if (paths.length >= 5) {
                    tab = paths[4] === 'sections' ? 0 : tab;
                  }
                  this.selectCourseHandler(res2.data[0], tab);
                }
              }).catch(err => {
                console.log(err);
              });
          });
        }).catch((err) => {
          console.log(err);
        });
    } else {
      // no specific class provided, get everything
      axios.get('http://localhost:8080/api/catalog_json/')
        .then(res => {
          console.log(res);
          const defaultPlaylists = res.data.default_playlists.split(',').map(str => parseInt(str));
          this.setState({
            activePlaylists: new Set(defaultPlaylists),
            defaultPlaylists: new Set(defaultPlaylists),
            context: res.data,
            loadedData: true,
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  /**
   * Sets the default search based on url path
   */
  setDefaultSearch = () => {
    const paths = this.props.history.location.pathname.split('/');
    if (paths.length >= 4) {
      const abbreviation = paths[2];
      const classNum = paths[3];
      this.defaultSearch = `${abbreviation} ${classNum} `;
    }
  }

  /**
   * @param {String} search
   *
   * Updates state.search
   */
  searchHandler = search => {
    this.setState({
      search
    });
  }

  /**
   * @param {String} sortBy
   *
   * Sorts courses based on sortAttribute
   */
  sortHandler = sortBy => {
    this.setState({
      sortBy
    })
  }

  /**
   * @param {Array[min, max]} unitsRange
   *
   * Sets the state of the range based on the min and max values
   */
  unitsRangeHandler = unitsRange => {
    this.setState({
      unitsRange
    })
  }

  rangeFilterHandler(addFilterIds, removeFilterIds) {
    let newActivePlaylists = new Set(this.state.activePlaylists);
    for (let filterId of addFilterIds) {
      newActivePlaylists.add(parseInt(filterId));
    }
    for (let filterId of removeFilterIds) {
      newActivePlaylists.delete(parseInt(filterId));
    }

    this.setState({
      activePlaylists: newActivePlaylists
    })
  }

  /**
   * @param {String} filterID
   *
   * Handler function for adding a filter ID to those that are active
   */
  addFilterHandler(filterID) {
    filterID = parseInt(filterID);
    this.setState(prevState => ({
      activePlaylists: prevState.activePlaylists.add(filterID)
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
      prevState.activePlaylists.delete(filterID)
      return {
        activePlaylists: prevState.activePlaylists
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
    let newActivePlaylists;
    // console.log(filterID);
    // console.log(this.state.activePlaylists)
    if(this.state.activePlaylists.has(filterID)) {
      newActivePlaylists = new Set(this.state.activePlaylists);
      newActivePlaylists.delete(filterID);
    } else {
      newActivePlaylists = new Set(this.state.activePlaylists).add(filterID);
    }

    this.setState({
      activePlaylists: newActivePlaylists
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
      let newActivePlaylists = new Set(this.state.activePlaylists);
      newActivePlaylists.delete(lastFilterID);
      newActivePlaylists.add(newFilterID);

      this.setState({
        activePlaylists: newActivePlaylists
      });
    }
  }

  /**
   * Handler function to reset all filters to the default
   */
  resetFilterHandler = () => {
    console.log(this.state);
    this.defaultSearch = '';
    let newActivePlaylists = new Set(this.state.defaultPlaylists);
    this.setState({
      search: '',
      sortBy: 'grade_average',
      unitsRange: [0, 6],
      activePlaylists: newActivePlaylists
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
    const { loadedData } = this.state;
    return (
      <div className="catalog">
        <div className="catalog-container">
          <Row>
            <Col lg={4} xl={3}>
              {
                loadedData ? 
                <FilterSidebar
                  filters={this.buildFiltersObject(this.state.context)}
                  activeFilters={this.state.activePlaylists}
                  searchHandler={this.searchHandler}
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
                /> :
                <div className="filter">
                  <div className="filter-loading">
                    <HashLoader
                      color="#579EFF"
                      size="50"
                      sizeUnit="px"
                    />
                  </div>
                </div>
              }
            </Col>
          </Row>
        </div>
      </div>
    )
  }

  /*
  render() {
    let results = this.state && this.state.activePlaylists.size ? (
      <FilterResults
        activeFilters={this.state.activePlaylists}
        selectCourse={this.selectCourseHandler}
        sortBy={this.state.sortBy}
        query={this.state.search}
      />
    ) : <div></div>
    console.log(this.defaultSearch);
    
    return (
      <div className="app-container">
          <div className="filter-columns">
              <FilterSidebar
                filters={this.buildFiltersObject(this.state.context)}
                activeFilters={this.state.activePlaylists}
                searchHandler={this.searchHandler}
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
  }*/
}

export default Catalog;
