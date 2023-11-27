import { CourseFragment } from 'graphql';
import { useSaveCourse, useUnsaveCourse } from 'graphql/hooks/saveCourse';
import { useUser } from 'graphql/hooks/user';
import { CSSProperties, memo } from 'react';
import { areEqual } from 'react-window';
import { ReactComponent as BookmarkSaved } from 'assets/svg/catalog/bookmark-saved.svg';
import { ReactComponent as BookmarkUnsaved } from 'assets/svg/catalog/bookmark-unsaved.svg';

import styles from './CatalogList.module.scss';
import { colorEnrollment, formatEnrollment } from '../service';
import useCatalog from '../useCatalog';

function formatUnits(units: string) {
	return `${units} Unit${units === '1.0' || units === '1' ? '' : 's'}`
		.replace(/.0/g, '')
		.replace(/ - /, '-')
		.replace(/ or /g, '-');
}

type CatalogListItemProps = {
	data: {
		course: CourseFragment;
		handleCourseSelect: (course: CourseFragment) => void;
		isSelected: boolean;
	};
	style?: CSSProperties;
	simple?: boolean;
};

const CatalogListItem = ({ style, data, simple }: CatalogListItemProps) => {
	const { course, handleCourseSelect, isSelected } = data;
	const [{ course: currentCourse }] = useCatalog();

	const { user } = useUser();
	const saveCourse = useSaveCourse();
	const unsaveCourse = useUnsaveCourse();

	const isSaved = user?.savedClasses?.some((savedCourse) => savedCourse?.id === course.id);

	return (
		<div
			style={style}
			className={styles.itemRoot}
			onClick={() => {
				if (currentCourse?.id === course.id) return;
				handleCourseSelect(course);
			}}
		>
			<div className={`${styles.itemContainer} ${isSelected ? styles.selected : ''}`}>
				<div className={styles.itemInfo}>
					<div className={styles.itemContent}>
						<h6>{`${course.abbreviation} ${course.courseNumber}`}</h6>
						<p>{course.title}</p>
					</div>
					<div className={styles.gradeWrapper}>
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
						{!simple && (
							<span className={`${styles[course.letterAverage[0]]}`}>
								{course.letterAverage !== '' ? course.letterAverage : ''}
							</span>
						)}
					</div>
				</div>
				{!simple && (
					<div className={styles.itemStats}>
						<span className={colorEnrollment(course.enrolledPercentage)}>
							{formatEnrollment(course.enrolledPercentage)} enrolled
						</span>
						<span> • {course.units ? formatUnits(course.units) : 'N/A'}</span>
					</div>
				)}
			</div>
		</div>
	);
};

CatalogListItem.defaultProps = {
	simple: false
};

export default memo(CatalogListItem, areEqual);
