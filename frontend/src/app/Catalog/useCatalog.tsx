import { useReducer, createContext, Dispatch, useContext, useEffect } from 'react';
import { DEFAULT_FILTERS, SORT_OPTIONS, buildCourseIndex } from './service';
import { CatalogFilters, CourseInfo, SortOption } from './types';
import { CourseFragment, CourseOverviewFragment, PlaylistType } from 'graphql';
import { searchCatalog, flipCourses } from './service';
import { byAttribute } from 'lib/courses/sorting';
import Fuse from 'fuse.js';

type CatalogContext = {
	filters: CatalogFilters;
	sortQuery: SortOption;
	sortDir: 'ASC' | 'DESC';
	searchQuery: string;
	allCourses: CourseOverviewFragment[];
	courses: CourseOverviewFragment[];
	course: CourseFragment | null;
	courseIndex: Fuse<CourseInfo> | null;
};

type CatalogAction =
	| { type: 'sortDir' }
	| { type: 'setCourse'; course: CatalogContext['course'] }
	| { type: 'search'; query?: CatalogContext['searchQuery'] }
	| { type: 'sort'; query: CatalogContext['sortQuery'] }
	| { type: 'filter'; filters: Partial<CatalogContext['filters']> }
	| { type: 'setCourses'; courses: CatalogContext['courses'] }
	| { type: 'reset'; filters?: Partial<CatalogContext['filters']> }
	| { type: 'setPill'; pillItem: PlaylistType };

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

	useEffect(() => {
		dispatch({ type: 'search' });
	}, [catalog.allCourses, catalog.filters]);

	return (
		<Context.Provider value={catalog}>
			<CatalogDispatch.Provider value={dispatch}>{children}</CatalogDispatch.Provider>
		</Context.Provider>
	);
};

function catalogReducer(catalog: CatalogContext, action: CatalogAction): CatalogContext {
	const { allCourses, courses, sortQuery, sortDir, searchQuery } = catalog;

	switch (action.type) {
		case 'sortDir': {
			const newDir = sortDir === 'ASC' ? 'DESC' : 'ASC';

			return {
				...catalog,
				sortDir: newDir,
				courses: flipCourses(courses, sortQuery)
			};
		}

		case 'setCourse': {
			return {
				...catalog,
				course: action.course
			};
		}

		case 'search': {
			const query = action.query ?? searchQuery;
			const { value } = sortQuery;
			const courses = searchCatalog(catalog.courseIndex, query, allCourses).sort(
				byAttribute(value)
			);

			return {
				...catalog,
				searchQuery: query,
				courses
			};
		}

		case 'sort': {
			return {
				...catalog,
				sortQuery: action.query,
				courses: courses.sort(byAttribute(action.query.value))
			};
		}

		case 'filter': {
			return {
				...catalog,
				filters: {
					...catalog.filters,
					...action.filters
				}
			};
		}

		case 'setCourses': {
			// Here we filter to ensure there are no duplicate course entries, since it was occurring.
			const newCourses = action.courses.filter(
				(v, i, a) => a.findIndex((t) => t.id === v.id) === i
			);
			return {
				...catalog,
				allCourses: newCourses,
				courseIndex: buildCourseIndex(newCourses)
			};
		}

		case 'reset': {
			return {
				...catalog,
				searchQuery: '',
				sortQuery: SORT_OPTIONS[0],
				sortDir: 'ASC',
				filters: { ...DEFAULT_FILTERS, ...action.filters }
			};
		}

		case 'setPill': {
			const { filters } = catalog;
			const { pillItem } = action;
			let result: Partial<CatalogFilters> = {};
			if (['haas', 'ls', 'engineering', 'university'].includes(pillItem.category)) {
				if (filters.requirements) {
					const reqs = filters.requirements;
					if (reqs?.find((el) => el.label === pillItem.name)) return catalog;

					result = {
						requirements: [...filters.requirements, { label: pillItem.name, value: pillItem }]
					};
				}
			} else {
				result = {
					[pillItem.category]: { label: pillItem.name, value: pillItem }
				};
			}

			return {
				...catalog,
				filters: {
					...filters,
					...result
				}
			};
		}

		default:
			return catalog;
	}
}

function useCatalog(): [CatalogContext, Dispatch<CatalogAction>] {
	return [useContext(Context), useContext(CatalogDispatch)];
}

export function useCatalogDispatch(): Dispatch<CatalogAction> {
	return useContext(CatalogDispatch);
}

export default useCatalog;
