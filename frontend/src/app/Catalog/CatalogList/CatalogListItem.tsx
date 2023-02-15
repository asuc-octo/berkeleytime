import { CourseOverviewFragment } from 'graphql';
import { useSaveCourse, useUnsaveCourse } from 'graphql/hooks/saveCourse';
import { useUser } from 'graphql/hooks/user';
import { CSSProperties, memo } from 'react';
import { areEqual } from 'react-window';
import { ReactComponent as BookmarkSaved } from 'assets/svg/catalog/bookmark-saved.svg';
import { ReactComponent as BookmarkUnsaved } from 'assets/svg/catalog/bookmark-unsaved.svg';
import { SortOption } from '../types';

// TODO: consider importing utils after latest changes merged into master.
function formatEnrollmentPercentage(percentage: number) {
	return `${Math.floor(percentage * 100)}% enrolled`;
}

function formatUnits(units: string) {
	return `${units} Unit${units === '1.0' || units === '1' ? '' : 's'}`
		.replace(/.0/g, '')
		.replace(/ - /, '-')
		.replace(/ or /g, '-');
}

function colorEnrollment(percentage: number) {
	const pct = percentage * 100;
	if (pct < 33) {
		return 'enrollment-first-third';
	} else if (pct < 67) {
		return 'enrollment-second-third';
	} else {
		return 'enrollment-last-third';
	}
}

function colorGrade(grade: string) {
	if (grade === '') {
		// console.error('colorGrade: no grade provided!');
		return '';
	}
	return `grade-${grade[0]}`;
}

function gradeSort(grade: string) {
	return (
		<div className="filter-card-sort filter-card-grade">
			<h6 className={colorGrade(grade)}>{grade}</h6>
		</div>
	);
}

function openSeatsSort(open_seats: number) {
	return (
		<div className="filter-card-sort filter-card-open-seats">
			<h6>{open_seats}</h6>
		</div>
	);
}

type CatalogListItemProps = {
	data: {
		course: CourseOverviewFragment;
		handleCourseSelect: (course: CourseOverviewFragment) => void;
		sortQuery: SortOption | null;
		selectedCourseId: string | null;
	};
	style: CSSProperties;
};

const CatalogListItem = ({ style, data }: CatalogListItemProps) => {
	const { course, handleCourseSelect } = data;

	const { user } = useUser();
	const saveCourse = useSaveCourse();
	const unsaveCourse = useUnsaveCourse();

	const { sortQuery, selectedCourseId } = data;

	let sort;
	switch (sortQuery?.value) {
		case 'department_name':
		case 'enrolled_percentage':
		case 'average_grade':
			if (course.letterAverage !== null) {
				sort = gradeSort(course.letterAverage);
			} else {
				sort = null;
			}
			break;
		case 'open_seats':
			sort = openSeatsSort(course.openSeats);
			break;
		default:
			sort = null;
	}

	const isSelectedCourse = selectedCourseId === course.id;
	const isSaved = user?.savedClasses?.some((savedCourse) => savedCourse?.id === course.id);

	return (
		<div style={style} className="filter-card" onClick={() => handleCourseSelect(course)}>
			<div className={`filter-card-container ${isSelectedCourse ? 'selected' : ''}`}>
				<div className="filter-card-info">
					<h6>{`${course.abbreviation} ${course.courseNumber}`}</h6>
					<p className="filter-card-info-desc">{course.title}</p>
					<div className="filter-card-info-stats">
						{course.enrolledPercentage === -1 ? (
							<p> N/A </p>
						) : (
							<p className={colorEnrollment(course.enrolledPercentage)}>
								{formatEnrollmentPercentage(course.enrolledPercentage)}
							</p>
						)}

						<p>&nbsp;•&nbsp;{course.units ? formatUnits(course.units) : 'N/A'}</p>
					</div>
				</div>
				{sort}
				{user && (
					<div
						className="filter-card-save"
						onClick={isSaved ? () => unsaveCourse(course) : () => saveCourse(course)}
					>
						{isSaved ? <BookmarkSaved /> : <BookmarkUnsaved />}
					</div>
				)}
			</div>
		</div>
	);
};

export default memo(CatalogListItem, areEqual);
