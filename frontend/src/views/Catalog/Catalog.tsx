import React, { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useHistory, useLocation } from 'react-router';
import { useSelector } from 'react-redux';
import BeatLoader from 'react-spinners/BeatLoader';
import union from 'lodash/union';
import difference from 'lodash/difference';

import Filter from '../../components/Catalog/Filter';
import FilterResults from '../../components/Catalog/FilterResults';
import ClassDescription from '../../components/ClassDescription/ClassDescription';
import ClassDescriptionModal from '../../components/ClassDescription/ClassDescriptionModal';

import { CourseType, useGetFiltersQuery } from '../../graphql/graphql';
import { playlistsToFilters } from '../../utils/courses';
import { ReduxState } from 'redux/store';
import { CourseSortAttribute } from 'utils/courses/sorting';


const Catalog = () => {
  const isMobile = useSelector((state: ReduxState) => state.common.mobile);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<CourseSortAttribute>("relevance");
  const [showDescription, setShowDescription] = useState(false); // The course modal on mobile
  const [activePlaylists, setActivePlaylists] = useState<string[]>([]); // The active filters
  const [selectedCourse, setSelectedCourse] = useState<CourseType | null>(null);

  const history = useHistory();
  const location = useLocation();

  const { data, loading } = useGetFiltersQuery();

  /**
   * Fetches initial filter data and sets selected class if url matches
   */
  useEffect(() => {
    // Get the course from the URL
    const paths = location.pathname.split('/');
    setActivePlaylists(paths);
  }, [location.pathname]);

  /**
   * Adds and removes playlists from the active playlists
   */
  function modifyFilters(add: string[], remove: string[]) {
    setActivePlaylists(currentPlaylists =>
      difference(union(currentPlaylists, add), remove));
  }

  /**
   * Handler function to reset all filters to the default
   */
  function resetFilters() {
    setActivePlaylists([]);
    setSearch("");
    setSortBy("relevance");
  }

  /**
   * Sets the selected course and updates the url
   */
  function selectCourse(course: CourseType) {
    setShowDescription(true); //show modal if on mobile
    history.replace(`/catalog/${course.abbreviation}/${course.courseNumber}/`);
    setSelectedCourse(course);
  }

  const allPlaylists = data?.allPlaylists?.edges.map(edge => edge!.node!);
  const filters = allPlaylists && playlistsToFilters(allPlaylists);

  return (
    <div className="catalog viewport-app">
      <Row noGutters>
        <Col md={3} lg={4} xl={3} className="filter-column">
          {
            !loading ? (
              <Filter
                playlists={filters}
                searchHandler={(query: string) => setSearch(query)}
                sortHandler={(sort: CourseSortAttribute) => setSortBy(sort)}
                modifyFilters={modifyFilters}
                resetFilters={resetFilters}
                isMobile={isMobile}
              />
            ) : (
              <div className="filter">
                <div className="filter-loading">
                  <BeatLoader
                    color="#579EFF"
                    size={15}
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
            selectCourse={selectCourse}
            selectedCourse={selectedCourse}
            sortBy={sortBy}
            query={search}
          />
        </Col>
        <Col md={6} lg={4} xl={6} className="catalog-description-column">
          {
            !isMobile ? (
              <ClassDescription
                course={selectedCourse}
                modifyFilters={modifyFilters}
              />
            ) : (
              <ClassDescriptionModal
                course={selectedCourse}
                show={showDescription}
                hideModal={() => setShowDescription(false)}
                modifyFilters={modifyFilters}
              />
            )
          }
        </Col>
      </Row>
    </div>
  );
}

export default Catalog;
