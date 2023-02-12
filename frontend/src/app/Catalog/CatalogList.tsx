import { FixedSizeList } from 'react-window';
import CatalogListItem from './CatalogListItem';
import { CourseOverviewFragment, useGetCoursesForFilterLazyQuery } from 'graphql';
import { CurrentFilters, FilterOption, SortOption } from './types';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import BTLoader from 'components/Common/BTLoader';
import useDimensions from 'react-cool-dimensions';

import styles from './Catalog.module.scss';
import { useHistory } from 'react-router';
import { searchCourses } from 'utils/courses/search';
import { sortByAttribute } from 'utils/courses/sorting';

type CatalogListProps = {
	currentFilters: CurrentFilters;
	setCurrentCourse: Dispatch<SetStateAction<CourseOverviewFragment | null>>;
	searchQuery: string;
	sortQuery: SortOption;
};

/**
 * Component for course list
 */
const CatalogList = (props: CatalogListProps) => {
	const { currentFilters, setCurrentCourse, searchQuery, sortQuery } = props;
	const [fetchCatalogList, { data, loading }] = useGetCoursesForFilterLazyQuery({});
	const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
	const history = useHistory();
	const { observe, height } = useDimensions();

	const courses = useMemo(() => {
		if (!data) return null;
		let courses = data.allCourses.edges.map((edge) => edge.node);
		courses = searchCourses(courses, searchQuery);

		return courses.sort(sortByAttribute(sortQuery.value));
	}, [data, searchQuery, sortQuery]);

	useEffect(() => {
		const playlists = Object.values(currentFilters ?? {})
			.filter((val) => val !== null)
			.map((item) => (Array.isArray(item) ? item.map((v) => v.value.id) : item?.value.id))
			.flat()
			.join(',');

		if (playlists) fetchCatalogList({ variables: { playlists } });
	}, [fetchCatalogList, currentFilters]);

	// let sortedCourses: CourseOverviewFragment[] = [];
	// if (data) {
	//   const courses = data!.allCourses!.edges.map((edge) => edge!.node!);

	//   // If we're using a "Relevance" search *and* there's a search query, we'll
	//   // use the search text-distance as the sorting metric.
	//   const hasQuery = rawQuery.trim() !== '';
	//   if (hasQuery) {
	//     // TODO: consider memoizing if this is slow.
	//     sortedCourses = searchCourses(courses, rawQuery);
	//   } else {
	//     sortedCourses = courses.sort(sortByAttribute(sortBy));
	//   }
	// }

	const handleCourseSelect = (course: CourseOverviewFragment) => {
		setCurrentCourse(course);
		setSelectedCourseId(course.id);
		history.push(
			`/catalog/${(currentFilters.semester as FilterOption)?.value?.name}/${course.abbreviation}/${
				course.courseNumber
			}/`
		);
	};

	return (
		<div ref={observe} className={styles.catalogListRoot}>
			{loading && <BTLoader />}
			{courses && (
				<FixedSizeList
					height={height}
					width={'100%'}
					itemCount={courses.length}
					itemSize={110}
					itemKey={(index) => courses[index].id}
				>
					{({ index, style }) => (
						<CatalogListItem
							data={{
								courses,
								handleCourseSelect,
								sortQuery,
								selectedCourseId
							}}
							index={index}
							style={style}
						/>
					)}
				</FixedSizeList>
			)}
		</div>
	);
};

export default CatalogList;
