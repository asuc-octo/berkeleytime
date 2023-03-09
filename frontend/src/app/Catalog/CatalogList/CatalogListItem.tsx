import { CourseFragment } from 'graphql';
import { useSaveCourse, useUnsaveCourse } from 'graphql/hooks/saveCourse';
import { useUser } from 'graphql/hooks/user';
import { CSSProperties, memo } from 'react';
import { areEqual } from 'react-window';
import { ReactComponent as BookmarkSaved } from 'assets/svg/catalog/bookmark-saved.svg';
import { ReactComponent as BookmarkUnsaved } from 'assets/svg/catalog/bookmark-unsaved.svg';
import catalogService from '../service';

const { colorEnrollment, formatEnrollment } = catalogService;

import styles from './CatalogList.module.scss';
import Skeleton from 'react-loading-skeleton';

function formatUnits(units: string) {
	return `${units} Unit${units === '1.0' || units === '1' ? '' : 's'}`
		.replace(/.0/g, '')
		.replace(/ - /, '-')
		.replace(/ or /g, '-');
}

type CatalogListItemProps = {
	data: {
		course: CourseFragment | { __typename: 'Skeleton'; id: number };
		handleCourseSelect: (course: CourseFragment) => void;
		isSelected: boolean;
	};
	style: CSSProperties;
};

const CatalogListItem = ({ style, data }: CatalogListItemProps) => {
	const { course, handleCourseSelect, isSelected } = data;

	const { user } = useUser();
	const saveCourse = useSaveCourse();
	const unsaveCourse = useUnsaveCourse();

	const isSaved = user?.savedClasses?.some((savedCourse) => savedCourse?.id === course.id);

	return course.__typename === 'Skeleton' ? (
		<div style={style} className={styles.itemRoot}>
			<div
				className={`${styles.itemContainer} ${styles.skeleton} ${
					isSelected ? styles.selected : ''
				}`}
			>
				<Skeleton height={'100%'} style={{ lineHeight: 1 }} />
			</div>
		</div>
	) : (
		<div style={style} className={styles.itemRoot} onClick={() => handleCourseSelect(course)}>
			<div className={`${styles.itemContainer} ${isSelected ? styles.selected : ''}`}>
				<div className={styles.itemInfo}>
					<div className={styles.itemContent}>
						<h6>{`${course.abbreviation} ${course.courseNumber}`}</h6>
						<p>{course.title}</p>
					</div>
					<div>
						{user && (
							<div
								className={styles.saveIcon}
								onClick={(e) => {
									e.stopPropagation();
									isSaved ? unsaveCourse(course) : saveCourse(course);
								}}
							>
								{isSaved ? <BookmarkSaved /> : <BookmarkUnsaved />}
							</div>
						)}
						<span className={`${styles.grade} ${styles[course.letterAverage[0]]}`}>
							{course.letterAverage !== '' ? course.letterAverage : ''}
						</span>
					</div>
				</div>
				<div className={styles.itemStats}>
					<span className={colorEnrollment(course.enrolledPercentage)}>
						{formatEnrollment(course.enrolledPercentage)}
					</span>
					<span> • {course.units ? formatUnits(course.units) : 'N/A'}</span>
				</div>
			</div>
		</div>
	);
};

export default memo(CatalogListItem, areEqual);
