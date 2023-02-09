import { useState } from 'react';
// import { useHistory, useRouteMatch } from 'react-router';

import CatalogFilter from 'app/Catalog/CatalogFilter';
import CatalogList from 'app/Catalog/CatalogList';
import CatalogView from 'app/Catalog/CatalogView';
// import ClassDescriptionModal from 'components/ClassDescription/ClassDescriptionModal';

import { CurrentFilters, DEFAULT_SORT, SortOption } from './types';
import styles from './Catalog.module.scss';
import { CourseOverviewFragment } from 'graphql';
import { FilterOption } from './types';

const initialFilters: CurrentFilters = {
	department: null,
	semester: null,
	units: null,
	level: null,
	requirements: null
};

const Catalog = () => {
	const [currentFilters, setCurrentFilters] = useState<CurrentFilters>(initialFilters);
	const [currentCourse, setCurrentCourse] = useState<CourseOverviewFragment | null>(null);
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
console.log(currentCourse)
	return (
		<div className={styles.catalogRoot}>
			<CatalogFilter
				sortQuery={sortQuery}
				searchQuery={searchQuery}
				currentFilters={currentFilters}
				setCurrentFilters={setCurrentFilters}
				setSearchQuery={setSearchQuery}
				setSortQuery={setSortQuery}
			/>
			<CatalogList currentFilters={currentFilters} setCurrentCourse={setCurrentCourse} />
			{currentCourse && currentFilters?.semester && (
				<CatalogView
					coursePreview={currentCourse as CourseOverviewFragment}
					semesterFilter={currentFilters.semester as FilterOption}
				/>
			)}
		</div>
	);
};

export default Catalog;
