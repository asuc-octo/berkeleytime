import { useState } from 'react';
import { CurrentFilters, SortOption } from './types';
import catalogService from './service';
import styles from './Catalog.module.scss';
import CatalogFilters from './CatalogFilters';
import CatalogList from './CatalogList';
import CatalogView from './CatalogView';
import { CourseFragment } from 'graphql';

const { SORT_OPTIONS, INITIAL_FILTERS } = catalogService;

const Catalog = () => {
	const [currentFilters, setCurrentFilters] = useState<CurrentFilters>(INITIAL_FILTERS);
	const [currentCourse, setCurrentCourse] = useState<CourseFragment | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [sortQuery, setSortQuery] = useState<SortOption>(SORT_OPTIONS[0]);

	return (
		<div className={styles.root}>
			<CatalogFilters
				sortQuery={sortQuery}
				searchQuery={searchQuery}
				currentFilters={currentFilters}
				setCurrentFilters={setCurrentFilters}
				setSearchQuery={setSearchQuery}
				setSortQuery={setSortQuery}
			/>
			<CatalogList
				currentFilters={currentFilters}
				setCurrentCourse={setCurrentCourse}
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
