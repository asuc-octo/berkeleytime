import { useState } from 'react';
import CatalogFilter from 'app/Catalog/CatalogFilter';
import CatalogList from 'app/Catalog/CatalogList';
import CatalogView from 'app/Catalog/CatalogView';
import { CurrentFilters, SortOption } from './types';
import catalogService from './service';
import styles from './Catalog.module.scss';
import { CourseOverviewFragment } from 'graphql';

const initialFilters: CurrentFilters = {
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
	// The course modal on mobile
	// const [showDescription, setShowDescription] = useState(false);

	return (
		<div className={styles.catalogRoot}>
			<CatalogFilter
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
			<CatalogView coursePreview={currentCourse} />
		</div>
	);
};

export default Catalog;
