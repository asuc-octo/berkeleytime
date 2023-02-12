import { FilterFragment, GetFiltersQuery } from 'graphql';
import { CatalogCategoryKeys, FilterOptions, CatalogFilterKeys, CatalogFilters, SortOption } from './types';

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

const FILTER_TEMPLATE: FilterOptions = {
	requirements: {
		name: 'Requirements',
		isClearable: true,
		isMulti: true,
		closeMenuOnSelect: false,
		isSearchable: false,
		options: [],
		placeholder: 'Select requirements...'
	},
	units: {
		name: 'Units',
		isClearable: true,
		isMulti: true,
		closeMenuOnSelect: false,
		isSearchable: false,
		options: [],
		placeholder: 'Specify units...'
	},
	department: {
		name: 'Department',
		isClearable: true,
		isMulti: false,
		closeMenuOnSelect: true,
		isSearchable: true,
		options: [],
		placeholder: 'Choose a department...'
	},
	level: {
		name: 'Class Level',
		isClearable: true,
		isMulti: true,
		closeMenuOnSelect: false,
		isSearchable: false,
		options: [],
		placeholder: 'Select class levels...'
	},
	semester: {
		name: 'Semesters',
		isClearable: false,
		isMulti: false,
		closeMenuOnSelect: true,
		isSearchable: false,
		options: [],
		placeholder: 'Specify Semester...'
	}
};

/**
 * @param data The raw, unprocessed query data from the server
 * @returns An object where the keys are filter categories and the values are
 * a sorted array of `FilterFragments`
 */
const processFilterData = (data: GetFiltersQuery) => {
	const filters = data.allPlaylists.edges
		.map((edge) => edge.node)
		.reduce((prev, filter) => {
			const category = filter.category as CatalogCategoryKeys;
			return {
				...prev,
				[category]: [...(prev[category] || []), filter]
			};
		}, {} as CatalogFilters);

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

const processFilterOptions = (filterItems: FilterOptions, filters: CatalogFilters) => {
	const result = { ...filterItems };

	result['requirements'].options = [
		{
			label: 'University Requirements',
			options: filters['university']?.map((filter) => ({ label: filter.name, value: filter })) || []
		},
		{
			label: 'L&S Breadths',
			options: filters['ls']?.map((filter) => ({ label: filter.name, value: filter })) || []
		},
		{
			label: 'College of Engineering',
			options: filters['engineering']?.map((filter) => ({ label: filter.name, value: filter })) || []
		},
		{
			label: 'Haas Breadths',
			options: filters['haas']?.map((filter) => ({ label: filter.name, value: filter })) || []
		}
	];

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
const sortSemestersByLatest = (semester: CatalogFilters['semester']) => {
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

export const sortByName = <T extends {name: string}[]>(arr: T) => {
	return arr.sort((a, b) => a.name.localeCompare(b.name));
};

export default {
	FILTER_TEMPLATE,
	SORT_OPTIONS,
	processFilterData,
	processFilterOptions,
	sortByName,
	sortSemestersByLatest
};
