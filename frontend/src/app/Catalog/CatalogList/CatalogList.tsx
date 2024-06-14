import { FixedSizeList } from 'react-window';
import CatalogListItem from './CatalogListItem';
import { CourseFragment, useGetCoursesForFilterLazyQuery } from 'graphql';
import { CurrentFilters, FilterOption, SortOption } from '../types';
import { Dispatch, memo, SetStateAction, useEffect, useMemo } from 'react';
import useDimensions from 'react-cool-dimensions';
import styles from './CatalogList.module.scss';
import { useNavigate } from 'react-router-dom';
import CatalogService from '../service';
import { sortByAttribute } from '../../../lib/courses/sorting';

type CatalogListProps = {
	currentFilters: CurrentFilters;
	setCurrentCourse: Dispatch<SetStateAction<CourseFragment | null>>;
	selectedId: string | null;
	searchQuery: string;
	sortQuery: SortOption;
	sortDir: boolean;
};

type Skeleton = { __typename: 'Skeleton'; id: number };

/**
 * Component for course list
 */
const CatalogList = (props: CatalogListProps) => {
	const { currentFilters, setCurrentCourse, selectedId, searchQuery, sortQuery, sortDir } = props;
	const { observe, height } = useDimensions();
	const [fetchCatalogList, { data, loading, called }] = useGetCoursesForFilterLazyQuery({});
	const navigate = useNavigate();

	const courses = useMemo(() => {
		if (!data)
			return [...Array(20).keys()].map(
				(key) =>
					({
						__typename: 'Skeleton',
						id: key
					} as Skeleton)
			);

		let courseResults = CatalogService.searchCatalog(
			data.allCourses.edges.map((edge) => edge.node),
			searchQuery
		).sort(sortByAttribute(sortQuery.value));

		//TODO: Very big problem to inspect - server is returning duplicate entries of same courses.
		//			Here we filter the duplicates to ensure catalog list consistency.
		courseResults = courseResults.filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i);

		// Inspect one case of duplication:
		// console.log(courses.filter((v, i, a) => v.id === 'Q291cnNlVHlwZTo0NDc1'));

		return sortDir ? CatalogService.descending(courseResults, sortQuery) : courseResults;
	}, [data, searchQuery, sortDir, sortQuery]);

	useEffect(() => {
		const playlistString = Object.values(currentFilters ?? {})
			.filter((val) => val !== null)
			.map((item) => (Array.isArray(item) ? item.map((v) => v.value.id) : item?.value.id))
			.flat()
			.join(',');

		if (playlistString) fetchCatalogList({ variables: { playlists: playlistString } });
	}, [fetchCatalogList, currentFilters]);

	const handleCourseSelect = (course: CourseFragment) => {
		setCurrentCourse(course);
		navigate({
			pathname: `/catalog/${(currentFilters.semester as FilterOption)?.value?.name}/${
				course.abbreviation
			}/${course.courseNumber}`,
			search: location.search
		});
	};

	return (
		<div ref={observe} className={styles.root}>
			<div className={styles.status}>
				{called && !loading && courses?.length > 0 && <span>{courses.length} Results</span>}
			</div>
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
