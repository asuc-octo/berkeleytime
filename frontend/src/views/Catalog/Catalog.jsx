import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import { withRouter } from 'react-router';
import HashLoader from 'react-spinners/HashLoader';

import axios from 'axios';

import Filter from '../../components/Catalog/Filter';
import FilterResults from '../../components/Catalog/FilterResults';
import ClassDescription from '../../components/ClassDescription/ClassDescription';

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
      tab: 0,                        // class detail tab, either 0 or 1
      sortBy: 'average_grade',       // either average_grade, ...
      activePlaylists: new Set(),    // set of integers
      defaultPlaylists: new Set(),   // set of integers
      data: {},                      // api response.data
      selectedCourse: {},
      loading: true,             // whether we have receieved playlist data from api
    };
  }

  /**
   * Lifecycle method for getting initial data
   */
  componentDidMount() {
    const paths = this.props.history.location.pathname.split('/');
    if (paths.length >= 4) {
      // if a class is provided in url, then we get from specific endpoint
      // not sure what difference is between this and regular catalog_json endpoint...
      const abbreviation = paths[2];
      const classNum = paths[3];
      const search = `${abbreviation} ${classNum} `;
      this.searchHandler(search);

      axios.get(`http://localhost:8080/api/catalog_json/${abbreviation}/${classNum}/`)
        .then(res => {
          // console.log(res);
          const defaultPlaylists = res.data.default_playlists.split(',').map(str => parseInt(str));

          this.setState({
            activePlaylists: new Set(defaultPlaylists),
            defaultPlaylists: new Set(defaultPlaylists),
            data: res.data,
            loading: false,
          }, () => {
            const courseID = res.data.default_course;
            axios.get('http://localhost:8080/api/catalog/filter/', { params: { course_id: courseID }})
              .then(res2 => {
                if (res2.data.length > 0) {
                  // tab = 0: details; tab = 1: section
                  let tab = 0;
                  if (paths.length >= 5) {
                    tab = paths[4] === 'sections' ? 0 : tab;
                  }
                  this.selectCourse(res2.data[0], tab);
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
          const defaultPlaylists = res.data.default_playlists.split(',').map(str => parseInt(str));
          this.setState({
            activePlaylists: new Set(defaultPlaylists),
            defaultPlaylists: new Set(defaultPlaylists),
            data: res.data,
            loading: false,
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }
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
    let newActivePlaylists = new Set(this.state.activePlaylists);
    for (let filterId of remove) {
      newActivePlaylists.delete(filterId);
    }
    for (let filterId of add) {
      newActivePlaylists.add(filterId);
    }
    this.setState({
      activePlaylists: newActivePlaylists,
    })
  }

  /**
   * Handler function to reset all filters to the default
   */
  resetFilters = () => {
    let newActivePlaylists = new Set(this.state.defaultPlaylists);
    this.setState({
      defaultSearch: '',
      search: '',
      sortBy: 'grade_average',
      activePlaylists: newActivePlaylists,
    });
  }

  selectCourse = (course, tab=0) => {
    if (tab === 0) {
      this.props.history.replace(`/catalog/${course.abbreviation}/${course.course_number}/`);
    } else {
      this.props.history.replace(`/catalog/${course.abbreviation}/${course.course_number}/sections/`);
    }
    this.setState({
      selectedCourse: course,
      tab,
    });
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
    } = this.state.data;

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
    const { loading, defaultSearch, selectedCourse, tab } = this.state;
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
                activePlaylists={this.state.activePlaylists}
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
}

export default withRouter(Catalog);
