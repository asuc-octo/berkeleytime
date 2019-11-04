import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import { withRouter } from 'react-router';
import HashLoader from 'react-spinners/HashLoader';

import axios from 'axios';

import Filter from '../../components/Catalog/Filter';
import FilterResults from '../../components/Catalog/FilterResults';
import ClassDescription from '../../components/ClassDescription/ClassDescription';

import { modify, fetchLists, modifySelected } from '../../redux/actions';
import { connect } from "react-redux";


/**
 * catalog_json API
 *
 * each playlist is an integer, representing a list of classes
 *
 * data:
 *   default_playlists - array of the default playlists
 *   engineering - array of engineering requirement playlists
 *   haas - array of haas requirement playlists
 *   ls - array of l&s requirement playlists
 *   level - array of class level requirement playlists
 *   semester - array of semester playlists
 *   units - array of unit playlists
 *   university - array of university requirement playlists
 */

class Catalog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      defaultSearch: this.getDefaultSearch(), // default search, set if URL contains a specific class
      search: '',                    // current search
      // tab: 0,                        // class detail tab, either 0 or 1
      sortBy: 'average_grade',       // either average_grade, ...
      // activePlaylists: new Set(),    // set of integers
      // defaultPlaylists: new Set(),   // set of integers
      // data: {},                      // api response.data
      // selectedCourse: {},
      // loading: true,             // whether we have receieved playlist data from api
    };
  }

  // get the initial state in redux store//
  componentWillMount() {
    const { fetchLists, data, activePlaylists} = this.props;
    const paths = this.props.history.location.pathname.split('/');
    // dispatch(fetchLists(paths));
    // console.log(activePlaylists);
    fetchLists(paths);
  }

  /**
   * Lifecycle method for getting initial data
   */
  componentDidMount() {

    // const paths = this.props.history.location.pathname.split('/');
    // if (paths.length >= 4) {
    //   // if a class is provided in url, then we get from specific endpoint
    //   // not sure what difference is between this and regular catalog_json endpoint...
    //   const abbreviation = paths[2];
    //   const classNum = paths[3];
    //   const search = `${abbreviation} ${classNum} `;
    //   this.searchHandler(search);
    //
    //   axios.get(`http://localhost:8080/api/catalog_json/${abbreviation}/${classNum}/`)
    //     .then(res => {
    //       // console.log(res);
    //       const defaultPlaylists = res.data.default_playlists.split(',').map(str => parseInt(str));
    //       modify(new Set(defaultPlaylists), new Set(defaultPlaylists));
    //       this.setState({
    //         // activePlaylists: new Set(defaultPlaylists),
    //         // defaultPlaylists: new Set(defaultPlaylists),
    //         // data: res.data,
    //         // loading: false,
    //       }, () => {
    //         const courseID = res.data.default_course;
    //         axios.get('http://localhost:8080/api/catalog/filter/', { params: { course_id: courseID }})
    //           .then(res2 => {
    //             if (res2.data.length > 0) {
    //               // tab = 0: details; tab = 1: section
    //               let tab = 0;
    //               if (paths.length >= 5) {
    //                 tab = paths[4] === 'sections' ? 0 : tab;
    //               }
    //               this.selectCourse(res2.data[0], tab);
    //             }
    //           }).catch(err => {
    //             console.log(err);
    //           });
    //       });
    //     }).catch((err) => {
    //       console.log(err);
    //     });
    // } else {
    //   // no specific class provided, get everything
    //   axios.get('http://localhost:8080/api/catalog_json/')
    //     .then(res => {
    //       // debugger
    //       const defaultPlaylists = res.data.default_playlists.split(',').map(str => parseInt(str));
    //       modify(new Set(defaultPlaylists), new Set(defaultPlaylists));
    //       this.setState({
    //         // activePlaylists: new Set(defaultPlaylists),
    //         // defaultPlaylists: new Set(defaultPlaylists),
    //         data: res.data,
    //         loading: false,
    //       });
    //     })
    //     .catch((err) => {
    //       console.log(err);
    //     });
    // }
  }

  // Sets the default search based on url path
  getDefaultSearch = () => {
    const paths = this.props.history.location.pathname.split('/');
    if (paths.length >= 4) {
      const abbreviation = paths[2];
      const classNum = paths[3];
      return `${abbreviation} ${classNum} `;
    } else {
      return '';
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
   * Sorts courses based on sortAttribute
   */
  sortHandler = sortBy => {
    this.setState({
      sortBy
    })
  }

  modifyFilters = (add, remove) => {
    const { modify, defaultPlaylists } = this.props;
    let newActivePlaylists = new Set(this.state.activePlaylists);
    for (let filterId of remove) {
      newActivePlaylists.delete(filterId);
    }
    for (let filterId of add) {
      newActivePlaylists.add(filterId);
    }
    modify(newActivePlaylists, defaultPlaylists);
  }

  /**
   * Handler function to reset all filters to the default
   */
  resetFilters = () => {
    const { modify, defaultPlaylists } = this.props;
    let newActivePlaylists = new Set(this.state.defaultPlaylists);
    modify(newActivePlaylists, defaultPlaylists);
    this.setState({
      defaultSearch: '',
      search: '',
      sortBy: 'grade_average',
      // activePlaylists: newActivePlaylists,
    });
  }

  selectCourse = (course, tab=0) => {
    const { modifySelected } = this.props;
    if (tab === 0) {
      this.props.history.replace(`/catalog/${course.abbreviation}/${course.course_number}/`);
    } else {
      this.props.history.replace(`/catalog/${course.abbreviation}/${course.course_number}/sections/`);
    }
    // this.setState({
    //   selectedCourse: course,
    //   tab,
    // });
    modifySelected(course, tab);
  }

  /**
   * @param {Array} filters
   * Builds the playlists returned by the catalog API into a format that can be processed by the filter
   */
  buildPlaylists = () => {
    const {
      university,
      ls,
      engineering,
      haas,
      units,
      department,
      level,
      semester
    } = this.props.data;

    var requirements = [];

    requirements.push({
      label: 'University Requirements',
      options: university ? university.map(req => {
        return {
          value: req.id,
          label: req.name,
        };
      }) : [],
    });

    requirements.push({
      label: 'L&S Breadths',
      options: ls ? ls.map(req => {
        return {
          value: req.id,
          label: req.name,
        };
      }) : [],
    });

    requirements.push({
      label: 'College of Engineering',
      options: engineering ? engineering.map(req => {
        return {
          value: req.id,
          label: req.name,
        };
      }) : [],
    });

    requirements.push({
      label: 'Haas Breadths',
      options: haas ? haas.map(req => {
        return {
          value: req.id,
          label: req.name,
        };
      }) : [],
    });

    var departmentsPlaylist = department ? department.map(req => {
      return {
        value: req.id,
        label: req.name,
      };
    }) : [];

    if (departmentsPlaylist[0].label === '-') {
      // non-existent department???
      departmentsPlaylist.splice(0, 1);
    }

    var unitsPlaylist = units ? units.map(req => {
      return {
        value: req.id,
        label: req.name === '5 Units' ? '5+ Units' : req.name,
      }
    }) : [];

    var levelsPlaylist = level ? level.map(req => {
      return {
        value: req.id,
        label: req.name === '5 Units' ? '5+ Units' : req.name,
      }
    }) : [];

    var semestersPlaylist = semester ? semester.map(req => {
      return {
        value: req.id,
        label: req.name === '5 Units' ? '5+ Units' : req.name,
      }
    }) : [];

    return {
      requirements,
      departmentsPlaylist,
      unitsPlaylist,
      levelsPlaylist,
      semestersPlaylist,
    }
  }

  render() {
    const { defaultSearch } = this.state;
    const { activePlaylists, loading, selectedCourse, tab } = this.props;
    return (
      <div className="catalog">
        <div className="catalog-container">
          <Row>
            <Col lg={4} xl={3} className="filter-column">
              {
                !loading ?
                <Filter
                  playlists={this.buildPlaylists()}
                  defaultSearch={defaultSearch}
                  searchHandler={this.searchHandler}
                  sortHandler={this.sortHandler}
                  modifyFilters={this.modifyFilters}
                  resetFilters={this.resetFilters}
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
            <Col lg={3} xl={3} className="filter-results-column">
              <FilterResults
                activePlaylists={activePlaylists ? activePlaylists : []}
                selectCourse={this.selectCourse}
                selectedCourse={selectedCourse}
                sortBy={this.state.sortBy}
                query={this.state.search}
              />
            </Col>
            <Col lg xl className="catalog-description-column">
              <ClassDescription
                course={selectedCourse}
                tab={tab}
                selectCourse={this.selectCourse}
              />
            </Col>
          </Row>
        </div>
      </div>
    )
  }

  /*
  render() {
    let results = this.state && this.state.activePlaylists.size ? (

    ) : <div></div>

    return (
      <div className="app-container">
          <div className="filter-columns">
              <FilterSidebar
                filters={this.buildFiltersObject(this.state.data)}
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

const mapDispatchToProps = dispatch => {
  // debugger
  return {
    dispatch,
    modify: (activePlaylists, defaultPlaylists) => dispatch(modify(activePlaylists, defaultPlaylists)),
    fetchLists: (paths) => dispatch(fetchLists(paths)),
    modifySelected: (data, tab) => dispatch(modifySelected(data, tab)),
  }
}

const mapStateToProps = state => {
  const { activePlaylists, defaultPlaylists, data, loading, selectCourse, tab } = state.catalog;
  return {
    activePlaylists: activePlaylists,
    defaultPlaylists: defaultPlaylists,
    data: data,
    loading: loading,
    selectedCourse: selectCourse,
    tab: tab
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Catalog));
