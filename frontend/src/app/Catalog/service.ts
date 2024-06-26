import Fuse from 'fuse.js';
import {
	FilterFragment,
	GetFiltersQuery,
	PlaylistType,
	CourseOverviewFragment,
	CourseFragment
} from '../../graphql';
import { laymanTerms } from '../../lib/courses/course';
import { courseToName } from '../../lib/courses/course';
import {
	CatalogCategoryKeys,
	FilterTemplate,
	CatalogFilterKeys,
	FilterOptions,
	SortOption,
	CurrentFilters,
	CourseInfo,
	CatalogSortKeys
} from './types';

import styles from './CatalogList/CatalogList.module.scss';

const SEMESTER_VALUES = {
	spring: 0.0,
	summer: 0.1,
	fall: 0.2
};

const SORT_OPTIONS: SortOption[] = [
	{ value: 'relevance', label: 'Sort By: Relevance' },
	{ value: 'average_grade', label: 'Sort By: Average Grade' },
	{ value: 'department_name', label: 'Sort By: Department Name' },
	{ value: 'open_seats', label: 'Sort By: Open Seats' },
	{ value: 'enrolled_percentage', label: 'Sort By: Percent Enrolled' }
];

const INITIAL_FILTERS: CurrentFilters = {
	department: null,
	semester: null,
	units: null,
	level: null,
	requirements: null
};

const FILTER_TEMPLATE: FilterTemplate = {
	requirements: {
		name: 'Requirements',
		isClearable: true,
		isMulti: true,
		closeMenuOnSelect: false,
		isSearchable: false,
		options: [],
		placeholder: 'Requirements...'
	},
	units: {
		name: 'Units',
		isClearable: true,
		isMulti: true,
		closeMenuOnSelect: false,
		isSearchable: false,
		options: [],
		placeholder: 'Units...'
	},
	department: {
		name: 'Department',
		isClearable: true,
		isMulti: false,
		closeMenuOnSelect: true,
		isSearchable: true,
		options: [],
		placeholder: 'Department...'
	},
	level: {
		name: 'Class Level',
		isClearable: true,
		isMulti: true,
		closeMenuOnSelect: false,
		isSearchable: false,
		options: [],
		placeholder: 'Class levels...'
	},
	semester: {
		name: 'Semesters',
		isClearable: false,
		isMulti: false,
		closeMenuOnSelect: true,
		isSearchable: false,
		options: [],
		placeholder: 'Semester...'
	}
};

/**
 * @param data The raw, unprocessed query data from the server
 * @returns An object where the keys are filter categories and the values are
 * a sorted array of `FilterFragments` or null if no data was passed.
 */
const processFilterData = (data?: GetFiltersQuery) => {
	if (!data) return null;

	const filters = data.allPlaylists.edges
		.map((edge) => edge.node)
		.reduce((prev, filter) => {
			const category = filter.category as CatalogCategoryKeys;
			return {
				...prev,
				[category]: [...(prev[category] || []), filter]
			};
		}, {} as FilterOptions);

	// After organizing the data, sort each category accordingly.
	Object.entries(filters).map(([key, category]) => {
		switch (key as CatalogCategoryKeys) {
			case 'semester':
				return sortSemestersByLatest(category);
			default:
				return sortByName(category);
		}
	});

	return filters;
};

/**
 *
 * @param filterItems an empty filter template
 * @param filters processed filter data
 * @description Populates the `options` field of each template item with the
 * appropriate filter options from the server.
 * @returns a `FilterTemplate` with populated `options`
 */
const putFilterOptions = (filterItems: FilterTemplate, filters?: FilterOptions | null) => {
	if (!filters) return null;

	const result = { ...filterItems };

	const requirements: { label: string; key: CatalogCategoryKeys }[] = [
		{ label: 'University Requirements', key: 'university' },
		{ label: 'L&S Breadths', key: 'ls' },
		{ label: 'College of Engineering', key: 'engineering' },
		{ label: 'Haas Breadths', key: 'haas' }
	];

	result['requirements'].options = requirements.map((req) => ({
		label: req.label,
		options:
			filters[req.key]?.map((filter) => ({
				label: filter.name,
				value: filter
			})) || []
	}));

	Object.entries(result)
		.filter(([key]) => key !== 'requirements')
		.map(([k]) => {
			const key = k as CatalogFilterKeys;
			result[key].options = filters[key].map((filter) => ({
				label: filter.name,
				value: filter
			}));
		});

	return result;
};

/**
 *
 * @param courses an array of `CourseOverviewFragment`
 * @param rawQuery A string to search for within the `courses` array
 * @description Applies `rawQuery` over a list of courses and returns the best matches
 * within `courses`
 * @returns an array of CourseOverviewFragment
 */
const searchCatalog = (courses: CourseOverviewFragment[], rawQuery: string) => {
	if (!rawQuery || rawQuery === '' || rawQuery === null) return courses;

	const options: Fuse.IFuseOptions<CourseInfo> = {
		includeScore: true,
		shouldSort: true,
		findAllMatches: true,
		threshold: 0.25,
		keys: [
			{ name: 'title', weight: 1 },
			{ name: 'abbreviation', weight: 1.5 },
			{ name: 'abbreviations', weight: 2 },
			{ name: 'courseNumber', weight: 1.2 },
			{ name: 'fullCourseCode', weight: 1 }
		],
		// The fuse types are wrong for this sort fn
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		sortFn: (itemA: any, itemB: any) => {
			// Sort first by sort score
			if (itemA.score - itemB.score) return itemA.score - itemB.score;

			// if the scores are the same, sort by the course number
			const a = itemA.item[3].v;
			const b = itemB.item[3].v;
			return a.toLowerCase().localeCompare(b.toLowerCase());
		}
	};

	const courseInfo = courses.map((course) => {
		const { title, abbreviation, courseNumber } = course;

		const abbreviations =
			laymanTerms[abbreviation.toLowerCase()]?.reduce((acc, abbr) => {
				// Here we test if the first character in the courseNumber is a LETTER
				// If so, we remove it and add it as an abbreviation.
				const containsPrefix = /[a-zA-Z]/.test(courseNumber.charAt(0));
				const abbrCouseNumber = courseNumber.slice(1);

				return [
					...acc,
					...[`${abbr}${courseNumber}`, `${abbr} ${courseNumber}`],
					...(containsPrefix ? [`${abbr}${abbrCouseNumber}`, `${abbr} ${abbrCouseNumber}`] : [])
				];
			}, [] as string[]) ?? [];

		return {
			title,
			abbreviation,
			courseNumber,
			fullCourseCode: courseToName(course),
			abbreviations
		};
	});

	const fuse = new Fuse(courseInfo, options);
	return fuse.search(rawQuery.trim().toLowerCase()).map((res) => courses[res.refIndex]);
};

/**
 *
 * @param semesters
 * @returns The semester filters sorted by their year and semester.
 * @description Sorts all semester filters by their year and semester,
 * then returns the id of the most recent one
 */
const sortSemestersByLatest = (semester: FilterOptions['semester']) => {
	return semester.sort((a, b) => SemesterToValue(b) - SemesterToValue(a));
};

/**
 *
 * @param semesterFiler
 * @returns a number representing the semester in the form (year + semester)
 * @description Converts the name of a semester to a number value to be compared with. Greater = more recent
 */
const SemesterToValue = (semesterFilter: FilterFragment) => {
	const [semester, year] = semesterFilter.name.toLowerCase().split(' ') as [
		'spring' | 'fall' | 'summer',
		string
	];

	return parseInt(year, 10) + SEMESTER_VALUES[semester];
};

/**
 * @description sorts the playlists alphabetically, and
 * by putting the `units` followed by the semester category at the end of the list
 */
const sortPills = (playlists: PlaylistType[]) => {
	const semesters = sortSemestersByLatest(playlists.filter((p) => p.category === 'semester'));
	const units = sortByName(playlists.filter((p) => p.category === 'units'));
	const rest = sortByName(playlists.filter((p) => !['units', 'semester'].includes(p.category)));

	return rest.concat(units, semesters.slice(0, 4) as PlaylistType[]);
};

export const sortByName = <T extends { name: string }[]>(arr: T) =>
	arr.sort((a, b) => a.name.localeCompare(b.name));

function formatEnrollment(percentage: number) {
	if (percentage === -1) return 'N/A';
	return `${Math.floor(percentage * 100)}% enrolled`;
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

const descending = (courses: CourseOverviewFragment[], sortQuery: SortOption) => {
	const keys: Record<CatalogSortKeys, keyof CourseOverviewFragment> = {
		average_grade: 'gradeAverage',
		enrolled_percentage: 'enrolledPercentage',
		open_seats: 'openSeats',
		department_name: 'title',
		relevance: 'title'
	};

	const { value } = sortQuery;
	const param = keys[value];

	switch (value) {
		case 'average_grade':
		case 'enrolled_percentage':
		case 'open_seats':
			return [
				...courses.filter((course) => course[param] === -1 || course[param] === null),
				...courses.filter((course) => course[param] !== -1 && course[param] !== null)
			].reverse();
		default:
			return courses.reverse();
	}
};

export default {
	FILTER_TEMPLATE,
	SORT_OPTIONS,
	INITIAL_FILTERS,
	processFilterData,
	putFilterOptions,
	sortByName,
	sortSemestersByLatest,
	sortPills,
	formatEnrollment,
	colorEnrollment,
	searchCatalog,
	descending
};
