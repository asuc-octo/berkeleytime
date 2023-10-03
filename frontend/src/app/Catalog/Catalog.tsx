import { useEffect, useState } from 'react';
import { CurrentFilters, SortOption } from './types';
import catalogService from './service';
import styles from './Catalog.module.scss';
import CatalogFilters from './CatalogFilters';
import CatalogList from './CatalogList';
import CatalogView from './CatalogView';
import { CourseFragment } from 'graphql';
import { useLocation } from 'react-router-dom';

const { SORT_OPTIONS, INITIAL_FILTERS } = catalogService;

const Catalog = () => {
	const [currentFilters, setCurrentFilters] = useState<CurrentFilters>(INITIAL_FILTERS);
	const [currentCourse, setCurrentCourse] = useState<CourseFragment | null>(null);
	const [sortQuery, setSortQuery] = useState<SortOption>(SORT_OPTIONS[0]);
	const [searchQuery, setSearchQuery] = useState('');
	const location = useLocation();
	const [sortDir, setDir] = useState(false);

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		if (params.has('q')) setSearchQuery(params.get('q') ?? '');
	}, [location.search]);

	return (
		<div className={styles.root}>
			<CatalogFilters
				sortQuery={sortQuery}
				searchQuery={searchQuery}
				currentFilters={currentFilters}
				setCurrentFilters={setCurrentFilters}
				setDir={setDir}
				sortDir={sortDir}
				setSearchQuery={setSearchQuery}
				setSortQuery={setSortQuery}
			/>
			<CatalogList
				currentFilters={currentFilters}
				setCurrentCourse={setCurrentCourse}
				sortDir={sortDir}
				selectedId={currentCourse?.id ?? null}
				searchQuery={searchQuery}
				sortQuery={sortQuery}
			/>
			<CatalogView
				coursePreview={currentCourse}
				setCurrentFilters={setCurrentFilters}
				setCurrentCourse={setCurrentCourse}
			/>
		</div>
	);
};

export default Catalog;
