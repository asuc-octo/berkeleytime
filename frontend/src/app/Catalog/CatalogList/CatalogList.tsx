import { FixedSizeList } from 'react-window';
import CatalogListItem from './CatalogListItem';
import { CourseOverviewFragment, useGetCoursesForFilterLazyQuery } from 'graphql';
import { CurrentFilters, FilterOption, SortOption } from '../types';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import BTLoader from 'components/Common/BTLoader';
import useDimensions from 'react-cool-dimensions';

import styles from './CatalogList.module.scss';
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

		//TODO: Very big problem to inspect - server is returning duplicate entries of same courses.
		//			Here we filter the duplicates to ensure catalog list consistency.
		courses = courses.filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i);

		// Inspect one case of duplication:
		// console.log(courses.filter((v, i, a) => v.id === 'Q291cnNlVHlwZTo0NDc1'));

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
								course: courses[index],
								handleCourseSelect,
								sortQuery,
								selectedCourseId
							}}
							style={style}
						/>
					)}
				</FixedSizeList>
			)}
		</div>
	);
};

export default CatalogList;
