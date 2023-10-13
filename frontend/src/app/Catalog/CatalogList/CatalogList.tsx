import { FixedSizeList } from 'react-window';
import CatalogListItem from './CatalogListItem';
import { CourseFragment, useGetCoursesForFilterLazyQuery } from 'graphql';
import { memo, useEffect } from 'react';
import useDimensions from 'react-cool-dimensions';
import styles from './CatalogList.module.scss';
import { useNavigate } from 'react-router';
import useCatalog, { CatalogActions } from '../useCatalog';
import { buildPlaylist } from '../service';
import Skeleton from 'react-loading-skeleton';

const CatalogList = () => {
	const navigate = useNavigate();
	const { observe, height } = useDimensions();
	const [{ course, courses, filters }, dispatch] = useCatalog();

	const [fetchCatalogList, { loading, called }] = useGetCoursesForFilterLazyQuery({
		onCompleted: (data) =>
			dispatch({
				type: CatalogActions.SetCourseList,
				allCourses: data.allCourses.edges.map((edge) => edge.node)
			})
	});

	useEffect(() => {
		const playlists = buildPlaylist(filters);
		if (playlists) fetchCatalogList({ variables: { playlists } });
	}, [fetchCatalogList, filters]);

	const handleCourseSelect = (course: CourseFragment) => {
		dispatch({ type: CatalogActions.SetCourse, course });
		if (filters.semester) {
			const { name } = filters.semester.value;
			const { abbreviation, courseNumber } = course;
			navigate({
				pathname: `/catalog/${name}/${abbreviation}/${courseNumber}`,
				search: location.search
			});
		}
	};

	return (
		<div ref={observe} className={styles.root}>
			<div className={styles.status}>
				{called && !loading && courses?.length > 0 && <span>{courses.length} Results</span>}
			</div>
			{height && courses.length > 0 && (
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
								isSelected: course?.id === courses[index].id
							}}
							style={style}
						/>
					)}
				</FixedSizeList>
			)}
			{loading &&
				[...Array(20).keys()].map((key) => (
					<div key={key} className={styles.itemRoot}>
						<div className={styles.itemContainer} style={{ padding: 0 }}>
							<Skeleton height={'100px'} style={{ lineHeight: 1 }} />
						</div>
					</div>
				))}
			{!loading && called && courses.length === 0 && (
				<div className={styles.error}>There are no courses matching your filters.</div>
			)}
		</div>
	);
};

export default memo(CatalogList);
