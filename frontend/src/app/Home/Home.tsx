import HomeHero from './HomeHero';
import HomeFeature from './HomeFeature';
import styles from './home.module.scss';

const Home = () => {
	return (
		<div className={styles.root}>
			<HomeHero />

			<HomeFeature />
		</div>
	);
};

export default Home;
