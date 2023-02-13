import { Dispatch, SetStateAction, useCallback, useEffect, useMemo } from 'react';
import { ActionMeta } from 'react-select';
import BTSelect from 'components/Custom/Select';
// import FilterModal from '../../components/Catalog/FilterModal';

import catalogService from './service';
import { ReactComponent as SearchIcon } from '../../assets/svg/common/search.svg';
import BTInput from 'components/Custom/Input';
import { CurrentFilters, FilterOption, SortOption, CatalogFilterKeys, DEFAULT_SORT } from './types';

import styles from './Catalog.module.scss';
import { useGetFiltersQuery } from 'graphql';
import BTLoader from 'components/Common/BTLoader';
import { useHistory, useParams } from 'react-router';

type CatalogFilterProps = {
	currentFilters: CurrentFilters;
	sortQuery: SortOption;
	searchQuery: string;
	setCurrentFilters: Dispatch<SetStateAction<CurrentFilters>>;
	setSortQuery: Dispatch<SetStateAction<SortOption>>;
	setSearchQuery: Dispatch<SetStateAction<string>>;
};

const { SORT_OPTIONS, FILTER_TEMPLATE } = catalogService;

const CatalogFilter = (props: CatalogFilterProps) => {
	const {
		currentFilters,
		setCurrentFilters,
		sortQuery,
		searchQuery,
		setSortQuery,
		setSearchQuery
	} = props;

	const { data, loading, error } = useGetFiltersQuery();
	const filters = useMemo(() => (data ? catalogService.processFilterData(data) : null), [data]);
	const history = useHistory();
	const slug = useParams<{
		abbreviation: string;
		courseNumber: string;
		semester: string;
	}>();

	const filterList = useMemo(
		() => (filters ? catalogService.processFilterOptions(FILTER_TEMPLATE, filters) : null),
		[filters]
	);

	useEffect(() => {
		if (filterList?.semester) {
			const options = filterList.semester.options as FilterOption[];
			const semester = options.find(({ label }) => label === slug?.semester) ?? null;

			setCurrentFilters((prev) => ({
				...prev,
				semester: semester ?? options[0]
			}));
		}
	}, [filterList, setCurrentFilters, slug?.semester]);

	/**
	 * @description Removes all active filters and replaces them with the current semester filter.
	 *
	 */
	const handleFilterReset = useCallback(() => {
		if (filterList?.semester)
			setCurrentFilters((prev) => ({
				...prev,
				semester: filterList.semester.options[0] as FilterOption
			}));
		setSortQuery(DEFAULT_SORT);
		setSearchQuery('');
	}, [filterList, setCurrentFilters, setSearchQuery, setSortQuery]);

	// const [showFilterModal, setShowFilterModal] = useState(false);
	// const [modal, setModal] = useState({
	//   options: [] as PlaylistDescription,
	//   default: null as FilterParameter[] | null,
	//   handler: (_filters: FilterParameter[]) => {},
	//   isMulti: true,
	// });

	//show the mobile modals
	// function showModal({
	//   options,
	//   selected,
	//   handler,
	//   isMulti = true,
	// }: {
	//   options: PlaylistDescription;
	//   selected: FilterParameter[];
	//   handler: (filters: FilterParameter[]) => void;
	//   isMulti?: boolean;
	// }) {
	//   setModal({
	//     options: options,
	//     default: selected,
	//     handler: handler,
	//     isMulti: isMulti,
	//   });
	//   setShowFilterModal(true);
	// }

	// function hideModal() {
	//   setModal({
	//     options: [],
	//     default: null,
	//     handler: () => {},
	//     isMulti: false,
	//   });
	//   setShowFilterModal(false);
	// }

	const handleFilterChange = (
		newValue: FilterOption | readonly FilterOption[] | null,
		meta: ActionMeta<FilterOption>
	) => {
		const key = meta.name as CatalogFilterKeys;
		setCurrentFilters((prev) => ({
			...prev,
			[key]: newValue
		}));
	
		// Update the url slug if semester filter changes.
		if (key === 'semester') {
			history.push(
				`/catalog/${(newValue as FilterOption)?.value?.name}/${slug?.abbreviation}/${
					slug?.courseNumber
				}/`
			);
		}
	};

	return (
		<div id="filter" className={styles.catalogFilterRoot}>
			<div className={styles.catalogFilterHeader}>
				<h3>Filters</h3>
				<button type="button" onClick={handleFilterReset}>
					Reset
				</button>
			</div>
			{filterList && (
				<>
					<div className="filter-search">
						<BTInput
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							type="search"
							placeholder="Search for a class..."
							icon={<SearchIcon />}
						/>
					</div>
					<div className="filter-sort">
						<BTSelect
							value={sortQuery}
							isClearable={false}
							options={SORT_OPTIONS}
							isSearchable={false}
							onChange={(newValue) => setSortQuery(newValue as SortOption)}
						/>
					</div>
					{Object.entries(filterList).map(([key, filter]) => (
						<div className={styles.filterItem} key={key}>
							<p>{filter.name}</p>
							<BTSelect
								className={styles.select}
								name={key}
								value={currentFilters[key as CatalogFilterKeys]}
								isClearable={filter.isClearable}
								isMulti={filter.isMulti}
								closeMenuOnSelect={filter.closeMenuOnSelect}
								isSearchable={filter.isSearchable}
								options={filter.options}
								onChange={handleFilterChange}
								placeholder={filter.placeholder}
							/>
						</div>
					))}
				</>
			)}
			{loading && <BTLoader />}
			{error && <div>Unable to fetch catalog filters.</div>}
		</div>
	);
};

export default CatalogFilter;
