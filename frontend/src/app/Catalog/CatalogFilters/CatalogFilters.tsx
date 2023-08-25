import { memo, useEffect, useRef, useState } from 'react';
import { ActionMeta } from 'react-select';
import BTSelect from 'components/Custom/Select';
import { ReactComponent as SearchIcon } from 'assets/svg/common/search.svg';
import { ReactComponent as FilterIcon } from 'assets/svg/catalog/filter.svg';
import BTInput from 'components/Custom/Input';
import { FilterOption, SortOption, CatalogFilterKeys, CatalogSlug, FilterTemplate } from '../types';
import { useGetFiltersQuery } from 'graphql';
import BTLoader from 'components/Common/BTLoader';
import { useHistory, useLocation, useParams } from 'react-router';
import styles from './CatalogFilters.module.scss';
import { SortDown, SortUp } from 'iconoir-react';
import useCatalog, { CatalogActions } from '../useCatalog';
import { FILTER_TEMPLATE, SORT_OPTIONS, putFilterOptions } from '../service';

const CatalogFilters = () => {
	const [template, setTemplate] = useState<FilterTemplate | null>(null);
	const { loading, error } = useGetFiltersQuery({
		onCompleted: (data) => setTemplate(putFilterOptions(FILTER_TEMPLATE, data))
	});

	const history = useHistory();
	const location = useLocation();
	const slug = useParams<CatalogSlug>();
	const [isOpen, setOpen] = useState(false);
	const modalRef = useRef<HTMLDivElement>(null);
	const [{ sortDir, sortQuery, searchQuery, filters }, dispatch] = useCatalog();

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		dispatch({ type: CatalogActions.Search, query: params.get('q') ?? '' });
	}, [dispatch, location.search]);

	useEffect(() => {
		if (template?.semester) {
			const options = template.semester.options as FilterOption[];
			const semester = options.find(({ label }) => label === slug?.semester) ?? null;

			dispatch({
				type: CatalogActions.Filter,
				filters: {
					semester: semester ?? options[0]
				}
			});
		}
	}, [template, slug?.semester, dispatch]);

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

	const handleFilterReset = () => {
		if (template) {
			const semester = template.semester.options[0] as FilterOption;
			dispatch({ type: CatalogActions.Reset, filters: { semester } });
			history.push({ pathname: `/catalog/${semester.value.name}` });
		}
	};

	const handleFilterChange = (
		newValue: FilterOption | readonly FilterOption[] | null,
		meta: ActionMeta<FilterOption>
	) => {
		dispatch({ type: CatalogActions.Filter, filters: { [meta.name as CatalogFilterKeys]: newValue } });
		// Update the url slug if semester filter changes.
		if (meta.name === 'semester') {
			history.push({
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
						history.replace({ pathname: location.pathname, search: `q=${e.target.value}` });
						dispatch({ type: CatalogActions.Search, query: e.target.value });
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
							history.replace({ pathname: location.pathname, search: `q=${e.target.value}` });
							dispatch({ type:  CatalogActions.Search, query: e.target.value });
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
							onChange={(newValue) => dispatch({ type: CatalogActions.Sort, query: newValue as SortOption })}
						/>
						<button onClick={() => dispatch({ type: CatalogActions.SortDir })}>
							{sortDir === 'DESC' ? <SortUp color="#8A8A8A" /> : <SortDown color="#8A8A8A" />}
						</button>
					</div>

					{template &&
						Object.entries(template).map(([key, filter]) => (
							<div className={styles.item} key={key}>
								<p>{filter.name}</p>
								<BTSelect
									name={key}
									value={filters[key as CatalogFilterKeys]}
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
