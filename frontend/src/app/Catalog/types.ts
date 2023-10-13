import { FilterFragment } from 'graphql';
import { GroupBase } from 'react-select';
import { CourseFragment, CourseOverviewFragment, PlaylistType } from 'graphql';
import Fuse from 'fuse.js';

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

export type CatalogFilterKey = Exclude<
	CatalogCategoryKeys,
	'haas' | 'ls' | 'engineering' | 'university'
>;

export type FilterOptions = {
	[category in CatalogCategoryKeys]: FilterFragment[];
};

export type CatalogFilters = {
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
	[key in CatalogFilterKey]: {
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

export type SortDir = 'ASC' | 'DESC';

export type CatalogContext = {
	filters: CatalogFilters;
	sortQuery: SortOption;
	sortDir: SortDir;
	searchQuery: string;
	allCourses: CourseOverviewFragment[];
	courses: CourseOverviewFragment[];
	course: CourseFragment | null;
	courseIndex: Fuse<CourseInfo> | null;
};

export type CatalogAction =
	| { type: 'sortDir' }
	| { type: 'setCourse'; course: CatalogContext['course'] }
	| { type: 'search'; query?: CatalogContext['searchQuery'] }
	| { type: 'sort'; query: CatalogContext['sortQuery'] }
	| { type: 'filter'; filters: Partial<CatalogContext['filters']> }
	| { type: 'setCourseList'; allCourses: CatalogContext['courses'] }
	| { type: 'reset'; filters?: Partial<CatalogContext['filters']> }
	| { type: 'setPill'; pillItem: PlaylistType };

export type CatalogActions = CatalogAction[keyof CatalogAction];
