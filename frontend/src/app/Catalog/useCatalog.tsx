import { useReducer, createContext, Dispatch, useContext } from 'react';
import { DEFAULT_FILTERS, SORT_OPTIONS, buildCourseIndex } from './service';
import { CatalogFilters, CatalogContext, CatalogAction } from './types';
import { searchCatalog, flipCourseList } from './service';
import { byAttribute } from 'lib/courses/sorting';

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
		case 'sortDir':
			return {
				...catalog,
				sortDir: sortDir === 'ASC' ? 'DESC' : 'ASC',
				courses: flipCourseList(courses, sortQuery)
			};
		case 'setCourse':
			return {
				...catalog,
				course: action.course
			};
		case 'search': {
			const newQuery = action.query ?? searchQuery;
			return {
				...catalog,
				searchQuery: newQuery,
				courses: setSearch(catalog, newQuery)
			};
		}
		case 'sort':
			return {
				...catalog,
				sortQuery: action.query,
				courses: courses.sort(byAttribute(action.query.value))
			};
		case 'filter':
			return {
				...catalog,
				filters: {
					...filters,
					...action.filters
				}
			};
		case 'setCourseList': {
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
		case 'reset': {
			return {
				...initialCatalog,
				allCourses: catalog.allCourses,
				filters: { ...DEFAULT_FILTERS, ...action.filters }
			};
		}
		case 'setPill': {
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
