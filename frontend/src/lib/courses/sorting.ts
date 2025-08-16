import { CourseOverviewFragment } from '../../graphql';
import { CatalogSortKeys } from '../../app/Catalog/types';

type CompareFn = (courseA: CourseOverviewFragment, courseB: CourseOverviewFragment) => number;

/**
 * Comparator for department name. Essentially alphabetical order.
 */
export const compareDepartmentName: CompareFn = (courseA, courseB) => {
	const courseATitle = `${courseA.abbreviation} ${courseA.courseNumber}`;
	const courseBTitle = `${courseB.abbreviation} ${courseB.courseNumber}`;
	return courseATitle.localeCompare(courseBTitle);
};

/**
 * Compares courses by relevance. "Relevance" is only a term relevant to
 * searching so this defaults to "average grade" when not being
 * search-filtered.
 */
const compareRelevance: CompareFn = (_A, _B) => {
	return 0;
};

/**
 * Comparator for average gpa, break ties by department name
 */
const compareAverageGrade: CompareFn = (courseA, courseB) => {
	return courseB.gradeAverage - courseA.gradeAverage || compareDepartmentName(courseA, courseB);
};

/**
 * Comparator for open seats, break ties by department name
 */
const compareOpenSeats: CompareFn = (courseA, courseB) => {
	return courseB.openSeats - courseA.openSeats || compareDepartmentName(courseA, courseB);
};

/**
 * Comparator for enrolled percentage, break ties by department name
 * If percentage is -1, it is put at the end (greater than all other percents)
 */
const compareEnrollmentPercentage: CompareFn = (courseA, courseB) => {
	if (courseA.enrolledPercentage !== -1 && courseB.enrolledPercentage !== -1) {
		return (
			courseA.enrolledPercentage - courseB.enrolledPercentage ||
			compareDepartmentName(courseA, courseB)
		);
	} else if (courseA.enrolledPercentage === -1 && courseB.enrolledPercentage === -1) {
		return compareDepartmentName(courseA, courseB);
	} else {
		return courseB.enrolledPercentage - courseA.enrolledPercentage;
	}
};

/**
 * Returns comparator based on the sort
 */
export function sortByAttribute(sortAttribute: CatalogSortKeys) {
	switch (sortAttribute) {
		case 'relevance':
			return compareRelevance;
		case 'average_grade':
			return compareAverageGrade;
		case 'department_name':
			return compareDepartmentName;
		case 'open_seats':
			return compareOpenSeats;
		case 'enrolled_percentage':
			return compareEnrollmentPercentage;
	}
}
