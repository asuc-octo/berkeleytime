import { useState } from 'react';
import CatalogFilter from 'app/Catalog/CatalogFilter';
import CatalogList from 'app/Catalog/CatalogList';
import CatalogView from 'app/Catalog/CatalogView';
import { CurrentFilters, DEFAULT_SORT, SortOption } from './types';
import styles from './Catalog.module.scss';
import { CourseOverviewFragment } from 'graphql';

const initialFilters: CurrentFilters = {
	department: null,
	semester: null,
	units: null,
	level: null,
	requirements: null
};

const Catalog = () => {
	const [currentFilters, setCurrentFilters] = useState<CurrentFilters>(initialFilters);
	const [currentCourse, setCurrentCourse] = useState<CourseOverviewFragment | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [sortQuery, setSortQuery] = useState<SortOption>(DEFAULT_SORT);
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
			<CatalogList currentFilters={currentFilters} setCurrentCourse={setCurrentCourse} />
			<CatalogView coursePreview={currentCourse} semesterFilter={currentFilters?.semester} />
		</div>
	);
};

export default Catalog;
