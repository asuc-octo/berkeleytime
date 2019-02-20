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
      sortBy: '',
      unitsRange: [0, 5],
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
  }

  /**
   * Lifecycle method for getting initial data
   */
  componentDidMount() {
    axios.get('http://localhost:8000/catalog_json')
      .then(res => {
        // console.log(res);
        const defaultPlaylists = res.data.default_playlists.split(',').map(str => parseInt(str));
        this.setState({
          activeFilters: new Set(defaultPlaylists),
          defaultFilters: new Set(defaultPlaylists),
          context: res.data
        });
      })
      .catch((err) => {
        if (err.response) {
            console.log(err.response.data);
            console.log(err.response.status);
            console.log(err.response.headers);
        }
        console.log(err.config);
      });
  }

  getJSONAndUpdateCourses() {
    const { filterIDs } = this.state;
    axios.get('http://localhost:8000/catalog_json', {
      params: {
        filters: filterIDs.join(','),
      },
    })
    .then(res => console.log(res));
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

  unitsRangeHandler(newRange) {
    this.setState({
      unitsRange: newRange
    })
  }

  addFilterHandler(filterID) {
    filterID = parseInt(filterID);
    this.setState(prevState => ({
      activeFilters: prevState.activeFilters.add(filterID)
    }));
  }

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
   * Handler function for checkbox options in our FilterSidebar component
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

  resetFilterHandler() {
    let newActiveFilters = new Set(this.state.defaultFilters);
    this.setState({
      query: '',
      sortBy: '',
      unitsRange: [0, 5],
      activeFilters: newActiveFilters,
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
    })
  }

  render() {
    return (
      <div className="app-container">
        <Grid fluid>
          <Row>
            <Col md={3}>
              <FilterSidebar
                filters={this.buildFiltersObject(this.state.context)}
                activeFilters={this.state.activeFilters}
                searchHandler={this.searchQueryHandler}
                sortHandler={this.sortHandler}
                unitsRangeHandler={this.unitsRangeHandler}
                sortBy={this.state.sortBy}
                unitsRange={this.state.unitsRange}
                addFilter={this.addFilterHandler}
                removeFilter={this.removeFilterHandler}
                toggleFilter={this.toggleFilterHandler}
                selectFilter={this.selectFilterHandler}
                resetFilters={this.resetFilterHandler}
              />
            </Col>
            <Col md={3}>
              <FilterResults />
            </Col>
            <Col md={6}>
              <ClassDescription />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default Catalog;
