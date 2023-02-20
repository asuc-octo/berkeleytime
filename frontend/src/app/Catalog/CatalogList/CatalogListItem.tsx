import { CourseOverviewFragment } from 'graphql';
import { useSaveCourse, useUnsaveCourse } from 'graphql/hooks/saveCourse';
import { useUser } from 'graphql/hooks/user';
import { CSSProperties, memo } from 'react';
import { areEqual } from 'react-window';
import { ReactComponent as BookmarkSaved } from 'assets/svg/catalog/bookmark-saved.svg';
import { ReactComponent as BookmarkUnsaved } from 'assets/svg/catalog/bookmark-unsaved.svg';

import styles from './CatalogList.module.scss';

// TODO: consider importing utils after latest changes merged into master.
function formatEnrollent(percentage: number) {
	if (percentage === -1) return 'N/A';
	return `${Math.floor(percentage * 100)}% enrolled`;
}

function formatUnits(units: string) {
	return `${units} Unit${units === '1.0' || units === '1' ? '' : 's'}`
		.replace(/.0/g, '')
		.replace(/ - /, '-')
		.replace(/ or /g, '-');
}

function colorEnrollment(percentage: number) {
	if (percentage === -1) return '';

	const pct = percentage * 100;
	if (pct < 33) {
		return styles.A;
	} else if (pct < 67) {
		return styles.C;
	} else {
		return styles.F;
	}
}

type CatalogListItemProps = {
	data: {
		course: CourseOverviewFragment;
		handleCourseSelect: (course: CourseOverviewFragment) => void;
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

	return (
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
								onClick={() => isSaved ? unsaveCourse(course) : saveCourse(course)}
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
						{formatEnrollent(course.enrolledPercentage)}
					</span>
					<span> • {course.units ? formatUnits(course.units) : 'N/A'}</span>
				</div>
			</div>
		</div>
	);
};

export default memo(CatalogListItem, areEqual);
