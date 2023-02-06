import { useState, useEffect, useMemo, useCallback } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useHistory, useRouteMatch } from 'react-router';
import { useSelector } from 'react-redux';
import { difference, union } from 'lodash-es';

import CatalogFilterList from 'app/Catalog/Filters';
import FilterResults from 'components/Catalog/FilterResults';
import ClassDescription from 'components/ClassDescription/ClassDescription';
import ClassDescriptionModal from 'components/ClassDescription/ClassDescriptionModal';

import { FilterFragment, useGetFiltersQuery } from 'graphql';
import { ReduxState } from 'redux/store';
import { CourseSortAttribute } from 'utils/courses/sorting';
import { extractSemesters, getLatestSemester } from 'utils/playlists/semesters';
import BTLoader from 'components/Common/BTLoader';
import { CourseReference, courseToName } from 'utils/courses/course';
import { CourseOverviewFragment } from 'graphql';
import catalogService from './service';
import { ActiveFilters, CatalogFilters } from './types';

const Catalog = () => {
	const { data, loading, error } = useGetFiltersQuery();
	const filters = useMemo(() => (data ? catalogService.processFilterData(data) : null), [data]);

	// console.log(latestSemesterId);

	// const history = useHistory();
	// const match = useRouteMatch<{ abbreviation: string; courseNumber: string }>(
	//   '/catalog/:abbreviation/:courseNumber'
	// );

	/**
	 * Adds and removes playlists from the active playlists. Executes remove
	 * before add.
	 */
	// function modifyFilters(add: Set<string>, remove: Set<string> = new Set()) {
	//   setActivePlaylists((currentPlaylists) => {
	//     const addPlaylists = [...add];
	//     const removePlaylists = [...remove];

	//     // TODO: expand to 'Departments'. This can make it so the 'getChanges'
	//     // logic can be discarded
	//     const semesterPlaylists = allPlaylists
	//       .filter((p) => p.category === 'semester')
	//       .map((p) => p.id);

	//     // If they are adding a semester, remove all other semesters. This logic
	//     // ensures only 1 semester is selected at a time.
	//     if (
	//       addPlaylists.some((playlist) => semesterPlaylists.includes(playlist))
	//     ) {
	//       removePlaylists.push(...semesterPlaylists);
	//     }

	//     return union(difference(currentPlaylists, removePlaylists), addPlaylists);
	//   });
	// }

	/**
	 * Sets the selected course and updates the url
	 */
	// function selectCourse(course: CourseOverviewFragment) {
	//   setShowDescription(true); //show modal if on mobile
	//   history.replace(`/catalog/${course.abbreviation}/${course.courseNumber}/`);
	//   setSelectedCourse({
	//     abbreviation: course.abbreviation,
	//     courseNumber: course.courseNumber,
	//   });
	// }

	// Convert list of filter into semantic hierarchy
	// const filters = playlistsToFilters(allPlaylists || []);

	// Get the selected semester OR the latest semester
	// const activeSemester = extractSemesters(activePlaylists, allPlaylists)[0];

	// If the user has selected a course, show that. Otherwise, show the course
	// from the URL
	// const activeCourse =
	//   selectedCourse || (activeSemester && match?.params) || null;

	// The course modal on mobile
	// const [showDescription, setShowDescription] = useState(false);

	// useEffect(() => {
	//   setShowDescription(activeCourse !== null);
	// }, [activeCourse]);

	// If the user closes the modal, remove the active course from the url
	// const hideModal = () => {
	//   history.replace(`/catalog`);
	//   setShowDescription(false);
	// };

	return (
		<div className="catalog viewport-app">
			<Row noGutters>
				<Col md={3} lg={4} xl={3} className="filter-column">
					{loading && <BTLoader showInstantly fill />}
					{filters && <CatalogFilterList filters={filters} />}
					{error && <div>A critical error occured loading.</div>}
				</Col>
				<Col md={3} lg={4} xl={3} className="filter-results-column">
          {/* <FilterResults
            activePlaylists={activePlaylists}
            selectCourse={selectCourse}
            selectedCourse={activeCourse}
            sortBy={sortBy}
            query={search}
          /> */}
        </Col>
				{/* <Col
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
        </Col> */}
			</Row>
		</div>
	);
};

export default Catalog;
