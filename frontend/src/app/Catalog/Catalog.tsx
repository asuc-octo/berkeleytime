import styles from './Catalog.module.scss';
import CatalogFilters from './CatalogFilters';
import CatalogList from './CatalogList';
import CatalogView from './CatalogView';
import { CatalogProvider } from './useCatalog';

const Catalog = () => {

	return (
		<div className={styles.root}>
			<CatalogProvider>
				<CatalogFilters />
				<CatalogList />
				<CatalogView />
			</CatalogProvider>
		</div>
	);
};

export default Catalog;
