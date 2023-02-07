import { FixedSizeList, VariableSizeList } from 'react-window';
import CatalogListItem from './CatalogListItem';
import { useGetCoursesForFilterLazyQuery } from 'graphql';
import { CurrentFilters } from './types';
import { useEffect, useMemo } from 'react';
import BTLoader from 'components/Common/BTLoader';

import styles from './Catalog.module.scss';

type CatalogListProps = {
	currentFilters: CurrentFilters;
	onCourseSelect: (selectedCourseId: string) => void;
};

/**
 * Component for course list
 */
const CatalogList = ({ currentFilters, onCourseSelect }: CatalogListProps) => {
	const [fetchCatalogList, { data, loading, error }] = useGetCoursesForFilterLazyQuery({});

	const filterString = useMemo(
		() =>
			Object.values(currentFilters ?? {})
				.filter((val) => val !== null)
				.map((item) => (Array.isArray(item) ? item.map((v) => v.value.id) : item?.value.id))
				.flat()
				.join(','),
		[currentFilters]
	);

	const courses = useMemo(() => data?.allCourses.edges.map((edge) => edge.node) ?? null, [data]);

	useEffect(() => {
		if (filterString) fetchCatalogList({ variables: { playlists: filterString } });
	}, [fetchCatalogList, filterString]);

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

	return (
		<div className={styles.catalogListRoot}>
			{loading && <BTLoader />}
			{courses &&
				courses.map((item, index) => (
					<CatalogListItem
						key={item.id}
						data={{
							courses,
							onCourseSelect,
							sortQuery: '',
							selectedCourse: null
						}}
						index={index}
					/>
				))}
		</div>
	);
};

export default CatalogList;
