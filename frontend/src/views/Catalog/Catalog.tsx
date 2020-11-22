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

import {
  CourseOverviewFragment,
  useGetFiltersQuery,
} from '../../graphql/graphql';
import {
  getCategoryFromPlaylists,
  getOverlappingValues,
  playlistsToFilters,
} from '../../utils/playlists/playlist';
import { ReduxState } from 'redux/store';
import { CourseSortAttribute } from 'utils/courses/sorting';
import { extractSemesters, getLatestSemester, Semester, semesterToString } from 'utils/playlists/semesters';

type CourseById = {
  kind: 'id';
  id: string;
};

type CourseByName = {
  kind: 'id';
};

type SelectedCourse = CourseOverviewFragment | null;
type SelectedSemester = {
  playlistId: string;
  year: string;
  semester: string;
} | null;

const Catalog = () => {
  const isMobile = useSelector((state: ReduxState) => state.common.mobile);

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<CourseSortAttribute>('relevance');
  const [showDescription, setShowDescription] = useState(false); // The course modal on mobile
  const [activePlaylists, setActivePlaylists] = useState<string[]>([]); // The active filters
  const [
    selectedCourse,
    setSelectedCourse,
  ] = useState<CourseOverviewFragment | null>(null); // Selected course ID

  const history = useHistory();
  // const location = useLocation();

  const { data, loading, error } = useGetFiltersQuery();

  /**
   * Fetches initial filter data and sets selected class if url matches
   * TODO: not sure what this behavior should be
   */
  // useEffect(() => {
  //   // Get the course from the URL
  //   const paths = location.pathname.split('/');
  //   setActivePlaylists(paths);
  // }, [location.pathname]);

  /**
   * Adds and removes playlists from the active playlists
   */
  function modifyFilters(add: Set<string>, remove: Set<string> = new Set()) {
    setActivePlaylists((currentPlaylists) =>
      difference(union(currentPlaylists, [...add]), [...remove])
    );
  }

  /**
   * Sets the selected course and updates the url
   */
  function selectCourse(course: CourseOverviewFragment) {
    setShowDescription(true); //show modal if on mobile
    history.replace(`/catalog/${course.abbreviation}/${course.courseNumber}/`);
    setSelectedCourse(course);
  }

  // Get flat list of all playlists (aka filters)
  const allPlaylists =
    data?.allPlaylists?.edges.map((edge) => edge!.node!) || [];

  // Convert list of filter into semantic hierarchy
  const filters = playlistsToFilters(allPlaylists);

  // Get the selected semester OR the latest semester
  const latestSemester = getLatestSemester(allPlaylists);
  const selectedSemester = extractSemesters(activePlaylists, allPlaylists)[0];
  const activeSemester = selectedSemester || latestSemester;

  // Add the initial semester as the initial playlist.
  useEffect(() => {
    // If there is a semester, and the user hasn't selected a semester, we'll
    // add the semester as a filter.
    if (latestSemester?.playlistId && !selectedSemester) {
      modifyFilters(new Set([latestSemester.playlistId]));
    }
  }, [latestSemester, selectedSemester]);

  return (
    <div className="catalog viewport-app">
      <Row noGutters>
        <Col md={3} lg={4} xl={3} className="filter-column">
          {error ? (
            <div>A critical error occured loading.</div>
          ) : loading ? (
            <BeatLoader color="#579EFF" size={15} sizeUnit="px" />
          ) : (
            <Filter
              filters={filters!}
              activeFilters={activePlaylists}
              modifyFilters={modifyFilters}
              search={search}
              setSearch={(query: string) => setSearch(query)}
              sort={sortBy}
              setSort={(sort: CourseSortAttribute) => setSortBy(sort)}
              isMobile={isMobile}
            />
          )}
        </Col>
        <Col md={3} lg={4} xl={3} className="filter-results-column">
          <FilterResults
            activePlaylists={activePlaylists}
            selectCourse={selectCourse}
            selectedCourse={selectedCourse}
            sortBy={sortBy}
            query={search}
          />
        </Col>
        <Col md={6} lg={4} xl={6} className="catalog-description-column">
          {selectedCourse !== null &&
            (!isMobile ? (
              <ClassDescription
                courseId={selectedCourse.id}
                semester={activeSemester}
                modifyFilters={modifyFilters}
              />
            ) : (
              <ClassDescriptionModal
                courseId={selectedCourse.id}
                semester={activeSemester}
                modifyFilters={modifyFilters}
                show={showDescription}
                hideModal={() => setShowDescription(false)}
              />
            ))}
        </Col>
      </Row>
    </div>
  );
};

export default Catalog;
