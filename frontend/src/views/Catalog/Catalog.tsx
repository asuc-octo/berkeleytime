import React, { useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useHistory, useRouteMatch } from 'react-router';
import { useSelector } from 'react-redux';
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
  FilterablePlaylist,
  playlistsToFilters,
} from '../../utils/playlists/playlist';
import { ReduxState } from 'redux/store';
import { CourseSortAttribute } from 'utils/courses/sorting';
import { extractSemesters, getLatestSemester } from 'utils/playlists/semesters';
import BTLoader from 'components/Common/BTLoader';

const Catalog = () => {
  const isMobile = useSelector((state: ReduxState) => state.common.mobile);

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<CourseSortAttribute>('relevance');
  const [showDescription, setShowDescription] = useState(false); // The course modal on mobile
  const [allPlaylists, setAllPlaylists] = useState<FilterablePlaylist[]>([]);
  const [activePlaylists, setActivePlaylists] = useState<string[]>([]); // The active filters

  const [selectedCourse, setSelectedCourse] = useState<string | null>(null); // Selected course ID

  const { loading, error } = useGetFiltersQuery({
    onCompleted: (data) => {
      const allPlaylists = data.allPlaylists?.edges.map((edge) => edge!.node!)!;
      const latestSemester = getLatestSemester(allPlaylists);
      setAllPlaylists(allPlaylists);

      // Set the initial playlist
      setActivePlaylists([latestSemester?.playlistId!]);
    },
  });

  const history = useHistory();
  const match = useRouteMatch<{ abbreviation: string; courseNumber: string }>(
    '/catalog/:abbrevation/:courseNumber'
  );

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
    setSelectedCourse(course.id);
  }

  // Convert list of filter into semantic hierarchy
  const filters = playlistsToFilters(allPlaylists);

  // Get the selected semester OR the latest semester
  const activeSemester = extractSemesters(activePlaylists, allPlaylists)[0];

  // If the user has selected a course, show that. Otherwise, show the course
  // from the URL
  const activeCourseId = selectedCourse;

  return (
    <div className="catalog viewport-app">
      <Row noGutters>
        <Col md={3} lg={4} xl={3} className="filter-column">
          {error ? (
            <div>A critical error occured loading.</div>
          ) : loading ? (
            <BTLoader />
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
            selectedCourseId={activeCourseId}
            sortBy={sortBy}
            query={search}
          />
        </Col>
        <Col
          md={6}
          lg={4}
          xl={6}
          className="catalog-description-column"
          key={activeCourseId}
        >
          {selectedCourse !== null &&
            (!isMobile ? (
              <ClassDescription
                courseId={activeCourseId!}
                semester={activeSemester}
                modifyFilters={modifyFilters}
              />
            ) : (
              <ClassDescriptionModal
                courseId={activeCourseId!}
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
