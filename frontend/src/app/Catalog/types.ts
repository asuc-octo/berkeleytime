import { FilterFragment } from 'graphql';
import { GroupBase } from 'react-select';

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

export type CatalogOptionKeys = Exclude<
	CatalogCategoryKeys,
	'haas' | 'ls' | 'engineering' | 'university'
>;

export type CatalogFilters = {
	[category in CatalogCategoryKeys]: FilterFragment[];
};

export type ActiveFilters = {
	[category in CatalogCategoryKeys]: string;
};

export type CatalogSortKeys =
	| 'relevance'
	| 'average_grade'
	| 'department_name'
	| 'open_seats'
	| 'enrolled_percentage';

export type SortOption = { value: CatalogSortKeys; label: string };

export type FilterOption = { value: FilterFragment; label: string }

export type FilterOptions = {
	[key in CatalogOptionKeys]: {
		name: string;
		isClearable: boolean;
		isMulti: boolean;
		closeMenuOnSelect: boolean;
		isSearchable: boolean;
		options: (FilterOption | GroupBase<FilterOption>)[];
		placeholder: string;
	};
};
