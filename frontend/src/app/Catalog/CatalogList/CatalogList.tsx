import { FixedSizeList } from 'react-window';
import CatalogListItem from './CatalogListItem';
import { CourseFragment, useGetCoursesForFilterLazyQuery } from 'graphql';
import { CurrentFilters, FilterOption, SortOption } from '../types';
import { Dispatch, memo, SetStateAction, useEffect, useMemo } from 'react';
import useDimensions from 'react-cool-dimensions';

import styles from './CatalogList.module.scss';
import { useHistory } from 'react-router';
import { searchCourses } from 'utils/courses/search';
import { sortByAttribute } from 'utils/courses/sorting';

type CatalogListProps = {
	currentFilters: CurrentFilters;
	setCurrentCourse: Dispatch<SetStateAction<CourseFragment | null>>;
	selectedId: string | null;
	searchQuery: string;
	sortQuery: SortOption;
};

type Skeleton = { __typename: 'Skeleton'; id: number };

/**
 * Component for course list
 */
const CatalogList = (props: CatalogListProps) => {
	const { currentFilters, setCurrentCourse, selectedId, searchQuery, sortQuery } = props;
	const { observe, height } = useDimensions();
	const [fetchCatalogList, { data }] = useGetCoursesForFilterLazyQuery({});
	const history = useHistory();

	const courses = useMemo(() => {
		if (!data)
			return [...Array(20).keys()].map(
				(key) =>
					({
						__typename: 'Skeleton',
						id: key
					} as Skeleton)
			);

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

	const handleCourseSelect = (course: CourseFragment) => {
		setCurrentCourse(course);
		history.push(
			`/catalog/${(currentFilters.semester as FilterOption)?.value?.name}/${course.abbreviation}/${
				course.courseNumber
			}`
		);
	};

	return (
		<div ref={observe} className={styles.root}>
			{height && courses.length > 0 ? (
				<FixedSizeList
					className={styles.list}
					height={height}
					width={'100%'}
					itemCount={courses.length}
					itemSize={110}
					itemKey={(index) => courses[index]?.id}
				>
					{({ index, style }) => (
						<CatalogListItem
							data={{
								course: courses[index] as CourseFragment,
								handleCourseSelect,
								isSelected: selectedId === courses[index].id
							}}
							style={style}
						/>
					)}
				</FixedSizeList>
			) : (
				<div className={styles.error}>There are no courses matching your filters.</div>
			)}
		</div>
	);
};

export default memo(CatalogList);
