import { useState } from 'react';
import { CurrentFilters, SortOption } from './types';
import catalogService from './service';
import styles from './Catalog.module.scss';
import { CourseOverviewFragment } from 'graphql';
import CatalogFilters from './CatalogFilters';
import CatalogList from './CatalogList';
import CatalogView from './CatalogView';

export const initialFilters: CurrentFilters = {
	department: null,
	semester: null,
	units: null,
	level: null,
	requirements: null
};

const { SORT_OPTIONS } = catalogService;

const Catalog = () => {
	const [currentFilters, setCurrentFilters] = useState<CurrentFilters>(initialFilters);
	const [currentCourse, setCurrentCourse] = useState<CourseOverviewFragment | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [sortQuery, setSortQuery] = useState<SortOption>(SORT_OPTIONS[0]);

	return (
		<div className={styles.catalogRoot}>
			<CatalogList
				currentFilters={currentFilters}
				setCurrentCourse={setCurrentCourse}
				searchQuery={searchQuery}
				sortQuery={sortQuery}
			/>
			<CatalogFilters
				sortQuery={sortQuery}
				searchQuery={searchQuery}
				currentFilters={currentFilters}
				setCurrentFilters={setCurrentFilters}
				setSearchQuery={setSearchQuery}
				setSortQuery={setSortQuery}
			/>
			<CatalogView coursePreview={currentCourse} />
		</div>
	);
};

export default Catalog;
