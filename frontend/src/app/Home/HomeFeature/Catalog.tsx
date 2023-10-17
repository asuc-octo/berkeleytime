import styles from './HomeFeature.module.scss';
import catalog1 from '../../../assets/img/landing/catalog1.png';
import catalog2 from '../../../assets/img/landing/catalog2.png';
import catalog3 from '../../../assets/img/landing/catalog3.png';

const Catalog = () => {
	return (
		<div className={styles.root}>
			<div className={styles.container}>
				<div className={styles.panelLeft}>
					<div className={styles.catalog}>
						<div className={styles.catalog1}>
							<img src={catalog1} className={styles.image} alt="" />
						</div>
						<div className={styles.catalog2}>
							<img src={catalog2} className={styles.image} alt="" />
						</div>
					</div>

					<div className={styles.catalog3}>
						<img src={catalog3} className={styles.image} alt="" />
					</div>
				</div>
				<div className={styles.panelRight}>
					<h1 className={styles.heading}>Find the right classes for you.</h1>
					<p className={styles.content}>All UC Berkeley courses in one place.</p>
					<button className={styles.button}>Search Class Catalog</button>
				</div>
			</div>
		</div>
	);
};
export default Catalog;
