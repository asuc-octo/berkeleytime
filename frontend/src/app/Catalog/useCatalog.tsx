import { useReducer, createContext, Dispatch, useContext } from 'react';
import { DEFAULT_FILTERS, SORT_OPTIONS, buildCourseIndex } from './service';
import { CatalogFilters, CourseInfo, SortOption } from './types';
import { CourseFragment, CourseOverviewFragment, PlaylistType } from 'graphql';
import { searchCatalog, flipCourseList } from './service';
import { byAttribute } from 'lib/courses/sorting';
import Fuse from 'fuse.js';

type SortDir = 'ASC' | 'DESC';

type CatalogContext = {
	filters: CatalogFilters;
	sortQuery: SortOption;
	sortDir: SortDir;
	searchQuery: string;
	allCourses: CourseOverviewFragment[];
	courses: CourseOverviewFragment[];
	course: CourseFragment | null;
	courseIndex: Fuse<CourseInfo> | null;
};

export enum CatalogActions {
	SortDir = 'sortDir',
	SetCourse = 'setCourse',
	Search = 'search',
	Sort = 'sort',
	Filter = 'filter',
	SetCourseList = 'setCourseList',
	Reset = 'reset',
	SetPill = 'setPill'
}

type CatalogAction =
	| { type: CatalogActions.SortDir }
	| { type: CatalogActions.SetCourse; course: CatalogContext['course'] }
	| { type: CatalogActions.Search; query?: CatalogContext['searchQuery'] }
	| { type: CatalogActions.Sort; query: CatalogContext['sortQuery'] }
	| { type: CatalogActions.Filter; filters: Partial<CatalogContext['filters']> }
	| { type: CatalogActions.SetCourseList; allCourses: CatalogContext['courses'] }
	| { type: CatalogActions.Reset; filters?: Partial<CatalogContext['filters']> }
	| { type: CatalogActions.SetPill; pillItem: PlaylistType };

const initialCatalog: CatalogContext = {
	filters: DEFAULT_FILTERS,
	sortQuery: SORT_OPTIONS[0],
	sortDir: 'ASC',
	searchQuery: '',
	courses: [],
	allCourses: [],
	courseIndex: null,
	course: null
};

const Context = createContext<CatalogContext>(initialCatalog);
export const CatalogDispatch = createContext<Dispatch<CatalogAction>>(
	(() => null) as Dispatch<CatalogAction>
);

export const CatalogProvider = ({ children }: { children: React.ReactNode }) => {
	const [catalog, dispatch] = useReducer(catalogReducer, initialCatalog);

	return (
		<Context.Provider value={catalog}>
			<CatalogDispatch.Provider value={dispatch}>{children}</CatalogDispatch.Provider>
		</Context.Provider>
	);
};

function catalogReducer(catalog: CatalogContext, action: CatalogAction): CatalogContext {
	const { courses, sortQuery, sortDir, searchQuery, filters } = catalog;

	switch (action.type) {
		case CatalogActions.SortDir:
			return {
				...catalog,
				sortDir: sortDir === 'ASC' ? 'DESC' : 'ASC',
				courses: flipCourseList(courses, sortQuery)
			};
		case CatalogActions.SetCourse:
			return {
				...catalog,
				course: action.course
			};
		case CatalogActions.Search: {
			const newQuery = action.query ?? searchQuery;
			return {
				...catalog,
				searchQuery: newQuery,
				courses: setSearch(catalog, newQuery)
			};
		}
		case CatalogActions.Sort:
			return {
				...catalog,
				sortQuery: action.query,
				courses: courses.sort(byAttribute(action.query.value))
			};
		case CatalogActions.Filter:
			return {
				...catalog,
				filters: {
					...filters,
					...action.filters
				}
			};
		case CatalogActions.SetCourseList: {
			// Here we filter to ensure there are no duplicate course entries.
			const allCourses = action.allCourses.filter(
				(v, i, a) => a.findIndex((t) => t.id === v.id) === i
			);

			const payload = {
				...catalog,
				allCourses,
				courseIndex: buildCourseIndex(allCourses)
			};

			return {
				...payload,
				courses: setSearch(payload)
			};
		}
		case CatalogActions.Reset: {
			return {
				...initialCatalog,
				allCourses: catalog.allCourses,
				filters: { ...DEFAULT_FILTERS, ...action.filters }
			};
		}
		case CatalogActions.SetPill: {
			const { pillItem } = action;
			const newItem = { label: pillItem.name, value: pillItem };

			let newFilter: Partial<CatalogFilters> = {};
			const requirements = ['haas', 'ls', 'engineering', 'university'];
			if (requirements.includes(pillItem.category)) {
				if (filters.requirements?.find((value) => value.label === pillItem.name)) return catalog;

				newFilter = { requirements: [...(filters.requirements ?? []), newItem] };
			} else {
				newFilter = { [pillItem.category]: newItem };
			}

			return {
				...catalog,
				filters: {
					...filters,
					...newFilter
				}
			};
		}
		default:
			return catalog;
	}
}

const useCatalog = (): [
	Omit<CatalogContext, 'courseIndex' | 'allCourses'>,
	Dispatch<CatalogAction>
] => [useContext(Context), useContext(CatalogDispatch)];

export const useCatalogDispatch = (): Dispatch<CatalogAction> => useContext(CatalogDispatch);

const setSearch = (catalog: CatalogContext, query: string | null = null) => {
	const { courseIndex, searchQuery, allCourses, sortQuery } = catalog;
	return searchCatalog(courseIndex, query ?? searchQuery, allCourses).sort(
		byAttribute(sortQuery.value)
	);
};

export default useCatalog;
