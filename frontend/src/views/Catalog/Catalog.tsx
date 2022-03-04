import React, { useState, useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import { useHistory, useRouteMatch } from "react-router";
import { useSelector } from "react-redux";
import union from "lodash/union";
import difference from "lodash/difference";

import Filter from "../../components/Catalog/Filter";
import FilterResults from "../../components/Catalog/FilterResults";
import ClassDescription from "../../components/ClassDescription/ClassDescription";
import ClassDescriptionModal from "../../components/ClassDescription/ClassDescriptionModal";

import {
  CourseOverviewFragment,
  useGetFiltersQuery,
} from "../../graphql/graphql";
import {
  FilterablePlaylist,
  playlistsToFilters,
} from "../../utils/playlists/playlist";
import { ReduxState } from "redux/store";
import { CourseSortAttribute } from "utils/courses/sorting";
import { extractSemesters, getLatestSemester } from "utils/playlists/semesters";
import BTLoader from "components/Common/BTLoader";
import { CourseReference, courseToName } from "utils/courses/course";

const DEFAULT_SORT: CourseSortAttribute = "relevance";

const Catalog = () => {
  const isMobile = useSelector((state: ReduxState) => state.common.mobile);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<CourseSortAttribute>(DEFAULT_SORT);
  const [allPlaylists, setAllPlaylists] = useState<FilterablePlaylist[]>([]);
  const [activePlaylists, setActivePlaylists] = useState<string[]>([]); // The active filters

  const [selectedCourse, setSelectedCourse] = useState<CourseReference | null>(
    null
  ); // Selected course ID

  const { loading: loadingPlaylists, error: errorPlaylists } =
    useGetFiltersQuery({
      onCompleted: (data) => {
        const allPlaylists = data.allPlaylists?.edges.map(
          (edge) => edge!.node!
        )!;
        const latestSemester = getLatestSemester(allPlaylists);
        setAllPlaylists(allPlaylists);

        // Set the initial playlist
        setActivePlaylists([latestSemester?.playlistId!]);
      },
    });

  const history = useHistory();
  const match = useRouteMatch<{ abbreviation: string; courseNumber: string }>(
    "/catalog/:abbreviation/:courseNumber"
  );

  /**
   * Adds and removes playlists from the active playlists. Executes remove
   * before add.
   */
  function modifyFilters(add: Set<string>, remove: Set<string> = new Set()) {
    setActivePlaylists((currentPlaylists) => {
      let addPlaylists = [...add];
      let removePlaylists = [...remove];

      // TODO: expand to 'Departments'. This can make it so the 'getChanges'
      // logic can be discarded
      const semesterPlaylists = allPlaylists
        .filter((p) => p.category === "semester")
        .map((p) => p.id);

      // If they are adding a semester, remove all other semesters. This logic
      // ensures only 1 semester is selected at a time.
      if (
        addPlaylists.some((playlist) => semesterPlaylists.includes(playlist))
      ) {
        removePlaylists.push(...semesterPlaylists);
      }

      return union(difference(currentPlaylists, removePlaylists), addPlaylists);
    });
  }

  /**
   * Resets the filters
   */
  function resetFilters() {
    const latestSemester = getLatestSemester(allPlaylists);
    setActivePlaylists([latestSemester?.playlistId!]);
    setSortBy(DEFAULT_SORT);
    setSearch("");
  }

  /**
   * Sets the selected course and updates the url
   */
  function selectCourse(course: CourseOverviewFragment) {
    setShowDescription(true); //show modal if on mobile
    history.replace(`/catalog/${course.abbreviation}/${course.courseNumber}/`);
    setSelectedCourse({
      abbreviation: course.abbreviation,
      courseNumber: course.courseNumber,
    });
  }

  // Convert list of filter into semantic hierarchy
  const filters = playlistsToFilters(allPlaylists);

  // Get the selected semester OR the latest semester
  const activeSemester = extractSemesters(activePlaylists, allPlaylists)[0];

  // If the user has selected a course, show that. Otherwise, show the course
  // from the URL
  const activeCourse =
    selectedCourse || (activeSemester && match?.params) || null;

  // The course modal on mobile
  const [showDescription, setShowDescription] = useState(false);

  useEffect(() => {
    setShowDescription(activeCourse !== null);
  }, [activeCourse]);

  // If the user closes the modal, remove the active course from the url
  const hideModal = () => {
    history.replace(`/catalog`);
    setShowDescription(false);
  };

  return (
    <div className="catalog viewport-app">
      <Row noGutters>
        <Col md={3} lg={4} xl={3} className="filter-column">
          {errorPlaylists ? (
            <div>A critical error occured loading.</div>
          ) : loadingPlaylists ? (
            <BTLoader showInstantly fill />
          ) : (
            <Filter
              filters={filters!}
              activeFilters={activePlaylists}
              modifyFilters={modifyFilters}
              resetFilters={resetFilters}
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
            selectedCourse={activeCourse}
            sortBy={sortBy}
            query={search}
          />
        </Col>
        <Col
          md={6}
          lg={4}
          xl={6}
          className="catalog-description-column"
          key={courseToName(activeCourse)}
        >
          {activeCourse !== null &&
            (!isMobile ? (
              <ClassDescription
                course={activeCourse}
                semester={activeSemester}
                modifyFilters={modifyFilters}
              />
            ) : (
              <ClassDescriptionModal
                course={activeCourse}
                semester={activeSemester}
                modifyFilters={modifyFilters}
                show={showDescription}
                hideModal={hideModal}
              />
            ))}
        </Col>
      </Row>
    </div>
  );
};

export default Catalog;
