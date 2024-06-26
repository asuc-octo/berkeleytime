import {
	Dispatch,
	memo,
	SetStateAction,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState
} from 'react';
import { ActionMeta } from 'react-select';
import BTSelect from '../../../components/Custom/Select';

import catalogService from '../service';
import { ReactComponent as SearchIcon } from '../../../assets/svg/common/search.svg';
import { ReactComponent as FilterIcon } from '../../../assets/svg/catalog/filter.svg';
import BTInput from '../../../components/Custom/Input';
import { CurrentFilters, FilterOption, SortOption, CatalogFilterKeys, CatalogSlug } from '../types';

import { useGetFiltersQuery } from '../../../graphql';
import BTLoader from '../../../components/Common/BTLoader';
import { useNavigate, useParams } from 'react-router-dom';

import styles from './CatalogFilters.module.scss';
import { SortDown, SortUp } from 'iconoir-react';

type CatalogFilterProps = {
	currentFilters: CurrentFilters;
	sortQuery: SortOption;
	searchQuery: string;
	setCurrentFilters: Dispatch<SetStateAction<CurrentFilters>>;
	setSortQuery: Dispatch<SetStateAction<SortOption>>;
	setSearchQuery: Dispatch<SetStateAction<string>>;
	setDir: Dispatch<SetStateAction<boolean>>;
	sortDir: boolean;
};

const { SORT_OPTIONS, FILTER_TEMPLATE, INITIAL_FILTERS } = catalogService;

const CatalogFilters = (props: CatalogFilterProps) => {
	const {
		currentFilters,
		setCurrentFilters,
		sortQuery,
		searchQuery,
		setSortQuery,
		setSearchQuery,
		setDir,
		sortDir
	} = props;

	const { data, loading, error } = useGetFiltersQuery();
	const [isOpen, setOpen] = useState(false);
	const filters = useMemo(() => catalogService.processFilterData(data), [data]);
	const navigate = useNavigate();
	const slug = useParams<CatalogSlug>();
	const modalRef = useRef<HTMLDivElement>(null);

	const filterList = useMemo(
		() => catalogService.putFilterOptions(FILTER_TEMPLATE, filters),
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

	useEffect(() => {
		const ref = modalRef;

		const listener = (event: MouseEvent | TouchEvent) => {
			if (ref.current && isOpen && (event.target as HTMLDivElement)?.contains(ref.current))
				setOpen(!isOpen);
		};

		document.addEventListener('click', listener);

		return () => {
			document.removeEventListener('click', listener);
		};
	}, [isOpen, modalRef, setOpen]);

	const handleFilterReset = useCallback(() => {
		setSortQuery(SORT_OPTIONS[0]);
		setSearchQuery('');

		if (filterList) {
			const semester = filterList.semester.options[0] as FilterOption;
			setCurrentFilters({
				...INITIAL_FILTERS,
				semester
			});

			navigate({ pathname: `/catalog/${semester.value.name}` });
		}
	}, [filterList, navigate, setCurrentFilters, setSearchQuery, setSortQuery]);

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
			navigate({
				pathname: `/catalog/${(newValue as FilterOption)?.value?.name}`
					.concat(slug?.abbreviation ? `/${slug.abbreviation}` : '')
					.concat(slug?.courseNumber ? `/${slug.courseNumber}` : ''),
				search: location.search
			});
		}
	};

	return (
		<div className={styles.root} data-modal={isOpen}>
			<div className={styles.toggle}>
				<BTInput
					style={{ border: 'none', width: '100%' }}
					value={searchQuery}
					onChange={(e) => {
						navigate({ pathname: location.pathname, search: `q=${e.target.value}` });
						setSearchQuery(e.target.value);
					}}
					type="search"
					placeholder="Search for a class..."
					icon={<SearchIcon />}
				/>
				<button onClick={() => setOpen((prev) => !prev)}>
					<FilterIcon fill={'red'} width={32} height={24} />
				</button>
			</div>
			<div ref={modalRef} className={styles.container} data-modal={isOpen}>
				<div className={styles.wrapper} data-modal={isOpen}>
					<div className={styles.header}>
						<h3>Filters</h3>
						<button type="button" onClick={handleFilterReset}>
							Clear
						</button>
					</div>
					<BTInput
						value={searchQuery}
						onChange={(e) => {
							navigate({ pathname: location.pathname, search: `q=${e.target.value}` });
							setSearchQuery(e.target.value);
						}}
						type="search"
						placeholder="Search for a class..."
						icon={<SearchIcon />}
					/>

					<div className={styles.searchContainer}>
						<BTSelect
							className={styles.sort}
							value={sortQuery}
							isClearable={false}
							options={SORT_OPTIONS}
							isSearchable={false}
							onChange={(newValue) => setSortQuery(newValue as SortOption)}
						/>
						<button onClick={() => setDir((prev) => !prev)}>
							{sortDir ? <SortUp color="#8A8A8A" /> : <SortDown color="#8A8A8A" />}
						</button>
					</div>

					{filterList &&
						Object.entries(filterList).map(([key, filter]) => (
							<div className={styles.item} key={key}>
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
					{loading && <BTLoader />}
					{error && <div className={styles.error}>Failed to fetch catalog filters.</div>}
				</div>
			</div>
		</div>
	);
};

export default memo(CatalogFilters);
