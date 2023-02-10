import { CourseFragment, CourseOverviewFragment, FilterFragment } from 'graphql';
import { GroupBase } from 'react-select';

export const DEFAULT_SORT: SortOption = { value: 'relevance', label: 'Sort By: Relevance' };

export type CurrentCourse = CourseFragment & {__typename?: 'CourseType'} | CourseOverviewFragment & {__typename?: 'CourseOverviewFragment'} | null

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

export type CatalogFilters = {
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

export type FilterOptions = {
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
