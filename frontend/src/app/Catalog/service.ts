import { FilterFragment, GetFiltersQuery, PlaylistType, SectionFragment } from 'graphql';
import { sortSections } from 'utils/sections/sort';
import styles from './CatalogList/CatalogList.module.scss';

import {
	CatalogCategoryKeys,
	FilterTemplate,
	CatalogFilterKeys,
	FilterOptions,
	SortOption,
	CurrentFilters
} from './types';

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
 * @param sections The sections of the course. Every item in sections gets mapped to a url
 * @param semester The semester of the course. String form. Used in url
 * @param abbreviation The course abbreviation of the course. String form. Used in url
 * @param courseNumber The course number of the course. String form. Used in url
 * @returns A list of links to the official UC Berkeley catalog for each course listed on the catalog table
 */
const getLinks = (
	sections: SectionFragment[] | null,
	semester: string,
	abbreviation: string,
	courseNumber: string
) => {
	if (!sections) return [];

	const dict = new Map([
		['Field Work', 'FLD'],
		['Session', 'SES'],
		['Colloquium', 'COL'],
		['Recitation', 'REC'],
		['Internship', 'INT'],
		['Studio', 'STD'],
		['Demonstration', 'dem'],
		['Web-based Discussion', 'WBD'],
		['Discussion', 'DIS'],
		['Tutorial', 'TUT'],
		['Clinic', 'CLN'],
		['Independent Study', 'IND'],
		['Self-paced', 'SLF'],
		['Seminar', 'SEM'],
		['Lecture', 'LEC'],
		['Web-based Lecture', 'WBL'],
		['Web-Based Lecture', 'WBL'],
		['Directed Group Study', 'GRP'],
		['Laboratory', 'LAB']
	]);

	const links: string[] = [];

	if (sections) {
		sections = sortSections(sections);
		for (let i = 0; i < sections.length; i++) {
			const temp = semester.split(' ');
			const regex = new RegExp('[' + ',' + ']', 'g');
			const rmc = abbreviation.replace(regex, '');

			const res = `https://classes.berkeley.edu/content/${temp[1]}
			-${temp[0]}
			-${rmc}
			-${courseNumber}
			-${sections[i].sectionNumber}
			-${dict.get(sections[i].kind)}
			-${sections[i].sectionNumber}`.replace(/\s+/g, '');

			links.push(res);
		}
	}
	return links;
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
 * by putting the `units` category at the end of the list
 */
const sortPills = (playlists: PlaylistType[]) => {
	const semesters = sortSemestersByLatest(playlists.filter((p) => p.category === 'semester'));
	const units = sortByName(playlists.filter((p) => p.category === 'units'));
	const rest = sortByName(playlists.filter((p) => !['units', 'semester'].includes(p.category)));

	return rest.concat(units, semesters.slice(0, 4) as PlaylistType[]);
};

export const sortByName = <T extends { name: string }[]>(arr: T) => {
	return arr.sort((a, b) => a.name.localeCompare(b.name));
};

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

export default {
	FILTER_TEMPLATE,
	SORT_OPTIONS,
	INITIAL_FILTERS,
	processFilterData,
	getLinks,
	putFilterOptions,
	sortByName,
	sortSemestersByLatest,
	sortPills,
	formatEnrollment,
	colorEnrollment
};
