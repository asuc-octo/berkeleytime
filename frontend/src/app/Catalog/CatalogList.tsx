import { FixedSizeList } from 'react-window';
import CatalogListItem from './CatalogListItem';
import { CourseOverviewFragment, useGetCoursesForFilterLazyQuery } from 'graphql';
import { CurrentFilters } from './types';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import BTLoader from 'components/Common/BTLoader';
import useDimensions from 'react-cool-dimensions';

import styles from './Catalog.module.scss';

type CatalogListProps = {
	currentFilters: CurrentFilters;
	setCurrentCourse: Dispatch<SetStateAction<CourseOverviewFragment | null>>;
};

/**
 * Component for course list
 */
const CatalogList = ({ currentFilters, setCurrentCourse }: CatalogListProps) => {
	const [fetchCatalogList, { data, loading }] = useGetCoursesForFilterLazyQuery({});
	const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
	const { observe, height } = useDimensions();

	const courses = useMemo(() => data?.allCourses.edges.map((edge) => edge.node) ?? null, [data]);

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
								sortQuery: null,
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
