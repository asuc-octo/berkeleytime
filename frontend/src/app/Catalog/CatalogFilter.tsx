import { Dispatch, SetStateAction, useCallback, useEffect, useMemo } from 'react';
import { ActionMeta } from 'react-select';
import BTSelect from 'components/Custom/Select';
// import FilterModal from '../../components/Catalog/FilterModal';

import catalogService from './service';

import { ReactComponent as SearchIcon } from '../../assets/svg/common/search.svg';
import BTInput from 'components/Custom/Input';
import {
	CurrentFilters,
	FilterOption,
	CatalogFilters,
	SortOption,
	CatalogFilterKeys,
	DEFAULT_SORT
} from './types';
// import { useSelector } from 'react-redux';
// import { ReduxState } from 'redux/store';

import styles from './Catalog.module.scss';

const SORT_OPTIONS: SortOption[] = [
	{ value: 'relevance', label: 'Sort By: Relevance' },
	{ value: 'average_grade', label: 'Sort By: Average Grade' },
	{ value: 'department_name', label: 'Sort By: Department Name' },
	{ value: 'open_seats', label: 'Sort By: Open Seats' },
	{ value: 'enrolled_percentage', label: 'Sort By: Percent Enrolled' }
];

type CatalogFilterProps = {
	filters: CatalogFilters;
	currentFilters: CurrentFilters;
	sortQuery: SortOption;
	searchQuery: string;
	setCurrentFilters: Dispatch<SetStateAction<CurrentFilters>>;
	setSortQuery: Dispatch<SetStateAction<SortOption>>;
	setSearchQuery: Dispatch<SetStateAction<string>>;
};

const CatalogFilter = (props: CatalogFilterProps) => {
	const {
		filters,
		currentFilters,
		setCurrentFilters,
		sortQuery,
		searchQuery,
		setSortQuery,
		setSearchQuery
	} = props;
	// const isMobile = useSelector((state: ReduxState) => state.common.mobile);

	const filterList = useMemo(
		() => catalogService.processFilterListOptions(catalogService.defaultFilters, filters),
		[filters]
	);

	useEffect(() => {
		if (filterList.semester) {
			setCurrentFilters((prev) => ({
				...prev,
				semester: filterList.semester.options[0] as FilterOption
			}));
		}
	}, [filterList.semester, setCurrentFilters]);

	/**
	 * @description Removes all active filters and replaces them with the current semester filter.
	 *
	 */
	const handleFilterReset = useCallback(() => {
		if (filterList.semester)
			setCurrentFilters((prev) => ({
				...prev,
				semester: filterList.semester.options[0] as FilterOption
			}));
		setSortQuery(DEFAULT_SORT);
		setSearchQuery('');
	}, [filterList.semester, setCurrentFilters, setSearchQuery, setSortQuery]);

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
	};

	return (
		<div id="filter" className={styles.catalogFilterRoot}>
			<div className={styles.catalogFilterHeader}>
				<h3>Filters</h3>
				<button type="button" onClick={handleFilterReset}>
					Reset
				</button>
			</div>
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
			<div id="filter-end"></div>
		</div>
	);
	// <div id="filter" className="filter">
	// 	<div className="filter-search">
	// 		<BTInput
	// 			value={search}
	// 			onChange={(e) => setSearch(e.target.value)}
	// 			type="search"
	// 			placeholder="Search for a class..."
	// 			icon={<SearchIcon />}
	// 		/>
	// 	</div>
	// 	<div className="filter-scroll">
	//     <button
	//       className="btn-bt-border filter-scroll-btn blue-text"
	//       onClick={resetFilters}
	//     >
	//       Reset{' '}
	//     </button>
	//     <button
	//       className="btn-bt-border filter-scroll-btn"
	//       onClick={() =>
	//         showModal({
	//           selected: SORT_OPTIONS.filter((o) => o.value === sort),
	//           options: SORT_OPTIONS,
	//           handler: (p) => setSort((p[0] as SortOption).value),
	//           isMulti: false,
	//         })
	//       }
	//     >
	//       Sort&nbsp;By{' '}
	//     </button>
	//     {filters.map((option) => (
	//       <button
	//         key={option.type}
	//         className="btn-bt-border filter-scroll-btn"
	//         onClick={() =>
	//           showModal({
	//             selected: getOverlappingValues(activeFilters, option.options),
	//             options: option.options,
	//             handler: filterHandler(option.options),
	//             isMulti: filterTypeIsMulti(option.type),
	//           })
	//         }
	//       >
	//         {`${filterTypeToString(option.type)} `}
	//       </button>
	//     ))}
	//   </div>
	// 	<FilterModal
	//     options={modal.options}
	//     defaultSelection={modal.default}
	//     showFilters={showFilterModal}
	//     hideModal={hideModal}
	//     storeSelection={modal.handler}
	//     displayRadio={!modal.isMulti}
	//   />
	// </div>
};

export default CatalogFilter;
