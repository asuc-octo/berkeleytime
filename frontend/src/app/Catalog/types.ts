import { FilterFragment } from 'graphql';
import { GroupBase } from 'react-select';

export type CatalogSlug = {
	abbreviation?: string;
	courseNumber?: string;
	semester?: string;
};

export type CatalogCategoryKeys =
	| 'department'
	| 'engineering'
	| 'haas'
	| 'level'
	| 'ls'
	| 'semester'
	| 'units'
	| 'university'
	| 'requirements';

export type CatalogFilterKeys = Exclude<
	CatalogCategoryKeys,
	'haas' | 'ls' | 'engineering' | 'university'
>;

export type FilterOptions = {
	[category in CatalogCategoryKeys]: FilterFragment[];
};

export type CurrentFilters = {
	department: FilterOption | null;
	level: FilterOption[] | null;
	units: FilterOption[] | null;
	semester: FilterOption | null;
	requirements: FilterOption[] | null;
};

export type CatalogSortKeys =
	| 'relevance'
	| 'average_grade'
	| 'department_name'
	| 'open_seats'
	| 'enrolled_percentage';

export type SortOption = { value: CatalogSortKeys; label: string };
export type FilterOption = { value: FilterFragment; label: string };

export type FilterTemplate = {
	[key in CatalogFilterKeys]: {
		name: string;
		isClearable: boolean;
		isMulti: boolean;
		closeMenuOnSelect: boolean;
		isSearchable: boolean;
		options: (FilterOption | GroupBase<FilterOption>)[];
		placeholder: string;
	};
};

export type CourseInfo = {
	title: string;
	abbreviation: string;
	courseNumber: string;
	fullCourseCode: string;
	abbreviations: string[];
};