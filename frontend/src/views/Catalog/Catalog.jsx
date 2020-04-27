import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import BeatLoader from 'react-spinners/BeatLoader';

import Filter from '../../components/Catalog/Filter';
import FilterResults from '../../components/Catalog/FilterResults';
import ClassDescription from '../../components/ClassDescription/ClassDescription';
import ClassDescriptionModal from '../../components/ClassDescription/ClassDescriptionModal';

import { setFilterMap } from '../../redux/actions';
import { modifyActivePlaylists, modifySelected, fetchPlaylists } from '../../redux/actions/catalog';


class Catalog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      search: '', // current search
      sortBy: 'average_grade', // either average_grade, ...
      showDescription: false,
    };

    this.searchHandler = this.searchHandler.bind(this);
    this.sortHandler = this.sortHandler.bind(this);
    this.modifyFilters = this.modifyFilters.bind(this);
    this.resetFilters = this.resetFilters.bind(this);
    this.selectCourse = this.selectCourse.bind(this);
    this.buildPlaylists = this.buildPlaylists.bind(this);
    this.hideModal = this.hideModal.bind(this);
  }

  /**
   * Fetches initial filter data and sets selected class if url matches
   */
  componentDidMount() {
    const { fetchPlaylists } = this.props;
    const paths = this.props.history.location.pathname.split('/');
    // console.log(activePlaylists);
    fetchPlaylists(paths);
  }

  /**
   * @param {String} search
   * Updates state.search
   */
  searchHandler(search) {
    this.setState({
      search,
    });
  }

  /**
   * @param {String} sortBy
   * Sorts courses based on sortAttribute
   */
  sortHandler(sortBy) {
    this.setState({
      sortBy,
    });
  }

  /**
   * Adds and removes playlists from the active playlists
   */
  modifyFilters(add, remove) {
    const { modifyActivePlaylists, activePlaylists } = this.props;
    const newActivePlaylists = new Set(activePlaylists);
    for (const playlist of remove) {
      newActivePlaylists.delete(playlist);
    }
    for (const playlist of add) {
      newActivePlaylists.add(playlist);
    }
    modifyActivePlaylists(newActivePlaylists);
  }

  /**
   * Handler function to reset all filters to the default
   */
  resetFilters() {
    const { modifyActivePlaylists, defaultPlaylists } = this.props;
    const newActivePlaylists = new Set(defaultPlaylists);
    modifyActivePlaylists(newActivePlaylists);
    this.setState({
      search: '',
      sortBy: 'average_grade',
    });
  }

  /**
   * Sets the selected course and updates the url
   */
  selectCourse(course) {
    const { modifySelected } = this.props;
    this.setState({ showDescription: true }); //show modal if on mobile
    this.props.history.replace(`/catalog/${course.abbreviation}/${course.course_number}/`);
    modifySelected(course);
  }

  /**
   * Builds the playlists returned by the catalog API into objects
   * that can be passed to by react-select. Each dropdown takes an options
   * list of { value: ..., label: ... } objects. The requirements dropdown
   * takes a list of { label: ..., options: ... } since each option is
   * categorized under a section.  This returns the options lists for each filter dropdown.
   * @param {Array} filters
   */
  buildPlaylists() {
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

    const { setFilterMap } = this.props;
    const filterMap = {};
    const requirements = [];

    requirements.push({
      label: 'University Requirements',
      options: university ? university.map(req => {
        filterMap[req.name] = { id: req.id, type: 'requirements' };
        return {
          value: req.id,
          label: req.name,
        };
      }) : [],
    });

    requirements.push({
      label: 'L&S Breadths',
      options: ls ? ls.map(req => {
        filterMap[req.name] = { id: req.id, type: 'requirements' };
        return {
          value: req.id,
          label: req.name,
        };
      }) : [],
    });

    requirements.push({
      label: 'College of Engineering',
      options: engineering ? engineering.map(req => {
        filterMap[req.name] = { id: req.id, type: 'requirements' };
        return {
          value: req.id,
          label: req.name,
        };
      }) : [],
    });

    requirements.push({
      label: 'Haas Breadths',
      options: haas ? haas.map(req => {
        filterMap[req.name] = { id: req.id, type: 'requirements' };
        return {
          value: req.id,
          label: req.name,
        };
      }) : [],
    });

    var departmentsPlaylist = department ? department.map(req => {
      filterMap[req.name] = { id: req.id, type: 'department' };
      return {
        value: req.id,
        label: req.name,
      };
    }) : [];

    if (departmentsPlaylist[0].label === '-') {
      // remove non-existent department???
      departmentsPlaylist.splice(0, 1);
    }

    var unitsPlaylist = units ? units.map(req => {
      filterMap[req.name] = { id: req.id, type: 'units' };
      return {
        value: req.id,
        label: req.name === '5 Units' ? '5+ Units' : req.name,
      }
    }) : [];

    var levelsPlaylist = level ? level.map(req => {
      filterMap[req.name] = { id: req.id, type: 'level' };
      return {
        value: req.id,
        label: req.name,
      }
    }) : [];

    var semestersPlaylist = semester ? semester.map(req => {
      filterMap[req.name] = { id: req.id, type: 'semester' };
      return {
        value: req.id,
        label: req.name,
      }
    }) : [];

    setFilterMap(filterMap);

    return {
      requirements,
      departmentsPlaylist,
      unitsPlaylist,
      levelsPlaylist,
      semestersPlaylist,
    };
  }

  hideModal() {
    this.setState({ showDescription: false });
  }

  render() {
    const { showDescription } = this.state;
    const { activePlaylists, loading, selectedCourse, isMobile } = this.props;

    return (
      <div className="catalog viewport-app">
        <Row noGutters>
          <Col md={3} lg={4} xl={3} className="filter-column">
            {
              !loading ? (
                <Filter
                  playlists={this.buildPlaylists()}
                  searchHandler={this.searchHandler}
                  sortHandler={this.sortHandler}
                  modifyFilters={this.modifyFilters}
                  resetFilters={this.resetFilters}
                  isMobile={isMobile}
                />
              ) : (
                <div className="filter">
                  <div className="filter-loading">
                    <BeatLoader
                      color="#579EFF"
                      size="15"
                      sizeUnit="px"
                    />
                  </div>
                </div>
              )
            }
          </Col>
          <Col md={3} lg={4} xl={3} className="filter-results-column">
            <FilterResults
              activePlaylists={activePlaylists ? activePlaylists : []}
              selectCourse={this.selectCourse}
              selectedCourse={selectedCourse}
              sortBy={this.state.sortBy}
              query={this.state.search}
            />
          </Col>
          <Col xs={0} md={6} lg={4} xl={6} className="catalog-description-column">
            {
              !isMobile ? (
                <ClassDescription
                  course={selectedCourse}
                  selectCourse={this.selectCourse}
                  modifyFilters={this.modifyFilters}
                />
              ) : (
                <ClassDescriptionModal
                  course={selectedCourse}
                  selectCourse={this.selectCourse}
                  show={showDescription}
                  hideModal={this.hideModal}
                  modifyFilters={this.modifyFilters}
                />
              )
            }
          </Col>
        </Row>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  dispatch,
  modifyActivePlaylists: activePlaylists => dispatch(modifyActivePlaylists(activePlaylists)),
  fetchPlaylists: (paths) => dispatch(fetchPlaylists(paths)),
  modifySelected: (data) => dispatch(modifySelected(data)),
  setFilterMap: (data) => dispatch(setFilterMap(data)),
});

const mapStateToProps = state => {
  const {
    activePlaylists, defaultPlaylists, data, loading, selectedCourse,
  } = state.catalog;
  const { isMobile } = state.isMobile;

  return {
    activePlaylists,
    defaultPlaylists,
    data,
    loading,
    selectedCourse,
    isMobile,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withRouter(Catalog));
