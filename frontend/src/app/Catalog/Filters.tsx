import { useCallback, useMemo, useState } from 'react';
import { ActionMeta } from 'react-select';
import BTSelect from 'components/Custom/Select';
import FilterModal from '../../components/Catalog/FilterModal';

import catalogService from './service';

import { ReactComponent as SearchIcon } from '../../assets/svg/common/search.svg';
import BTInput from 'components/Custom/Input';
import {
	ActiveFilters,
	CatalogSortKeys,
	FilterOptions,
	FilterOption,
	CatalogFilters,
	SortOption
} from './types';
import { useSelector } from 'react-redux';
import { ReduxState } from 'redux/store';

type FilterListProps = {
	filters: CatalogFilters;
};

const DEFAULT_SORT: CatalogSortKeys = 'relevance';

const SORT_OPTIONS: SortOption[] = [
	{ value: 'relevance', label: 'Sort By: Relevance' },
	{ value: 'average_grade', label: 'Sort By: Average Grade' },
	{ value: 'department_name', label: 'Sort By: Department Name' },
	{ value: 'open_seats', label: 'Sort By: Open Seats' },
	{ value: 'enrolled_percentage', label: 'Sort By: Percent Enrolled' }
];

const defaultFilterList: FilterOptions = {
	requirements: {
		name: 'Requirements',
		isClearable: true,
		isMulti: true,
		closeMenuOnSelect: false,
		isSearchable: false,
		options: [],
		placeholder: 'Select Requirements...'
	},
	units: {
		name: 'Units',
		isClearable: true,
		isMulti: true,
		closeMenuOnSelect: false,
		isSearchable: false,
		options: [],
		placeholder: 'Specify Units...'
	},
	department: {
		name: 'Department',
		isClearable: true,
		isMulti: false,
		closeMenuOnSelect: true,
		isSearchable: false,
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
		isClearable: true,
		isMulti: false,
		closeMenuOnSelect: true,
		isSearchable: false,
		options: [],
		placeholder: 'Specify Semester...'
	}
};

const CatalogFilterList = ({ filters }: FilterListProps) => {
	const [searchQuery, setSearchQuery] = useState('');
	const [sortBy, setSortBy] = useState<CatalogSortKeys>(DEFAULT_SORT);
	const [ActiveFilters, setActiveFilters] = useState<Partial<ActiveFilters>>({});
	const isMobile = useSelector((state: ReduxState) => state.common.mobile);

	const filterList = useMemo(
		() => catalogService.processFilterListOptions(defaultFilterList, filters),
		[filters]
	);

	// const [showFilterModal, setShowFilterModal] = useState(false);
	// const [modal, setModal] = useState({
	//   options: [] as PlaylistDescription,
	//   default: null as FilterParameter[] | null,
	//   handler: (_filters: FilterParameter[]) => {},
	//   isMulti: true,
	// });

	const latestSemesterId = useMemo(() => filters.semester[0].id, [filters]);

	/**
	 * @description
	 * Removes all active filters and replaces them with the current semester filter.
	 */
	const resetFilters = useCallback(() => {
		if (latestSemesterId) setActiveFilters({ semester: latestSemesterId });
		setSortBy(DEFAULT_SORT);
		setSearchQuery('');
	}, [latestSemesterId]);

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
		return
	};

	return (
		<div id="filter" className="filter">
			<div className="filter-name">
				<p>Filters</p>
				<button type="button" onClick={resetFilters}>
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
					isClearable={false}
					options={SORT_OPTIONS}
					isSearchable={false}
					onChange={(e) => setSortBy(e?.value ?? 'relevance')}
					value={SORT_OPTIONS.find((o) => o.value === sortBy)}
				/>
			</div>
			{Object.entries(filterList).map(([key, filter]) => (
				<div className="filter-option" key={key}>
					<p>{filter.name}</p>
					<BTSelect
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

export default CatalogFilterList;
