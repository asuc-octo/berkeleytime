import { useState, useMemo } from 'react';
import { useHistory, useRouteMatch } from 'react-router';

import CatalogFilter from 'app/Catalog/Filters';
import CatalogList from 'app/Catalog/CatalogList';
import ClassDescription from 'components/ClassDescription/ClassDescription';
import ClassDescriptionModal from 'components/ClassDescription/ClassDescriptionModal';

import { useGetFiltersQuery } from 'graphql';
import BTLoader from 'components/Common/BTLoader';
import catalogService from './service';
import { CurrentFilters, DEFAULT_SORT, SortOption } from './types';
import styles from './Catalog.module.scss';

const initialFilters: CurrentFilters = {
	department: null,
	semester: null,
	units: null,
	level: null,
	requirements: null
};

const Catalog = () => {
	const { data, loading, error } = useGetFiltersQuery();
	const filters = useMemo(() => (data ? catalogService.processFilterData(data) : null), [data]);
	const [currentFilters, setCurrentFilters] = useState<CurrentFilters>(initialFilters);
	const [searchQuery, setSearchQuery] = useState('');
	const [sortQuery, setSortQuery] = useState<SortOption>(DEFAULT_SORT);

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

	const onCourseSelect = (selectedCourse: any) => {
		return;
	};

	return (
		<div className={styles.catalogRoot}>
					{loading && <BTLoader showInstantly fill />}
					{filters && (
						<CatalogFilter
							filters={filters}
							sortQuery={sortQuery}
							currentFilters={currentFilters}
							setCurrentFilters={setCurrentFilters}
							setSearchQuery={setSearchQuery}
							setSortQuery={setSortQuery}
						/>
					)}
					{error && <div>A critical error occured loading.</div>}
					<CatalogList currentFilters={currentFilters} onCourseSelect={onCourseSelect} />
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
		</div>
	);
};

export default Catalog;
