import styles from './Home.module.scss';
import { ReactComponent as Camp } from './campanille.svg';

const Home = () => {
	return (
		<div className={styles.root}>
			<div className={styles.container}>
				<div className={styles.hero}>
					<div className={styles.heroWrapper}>
						<h1>Hello World</h1>
					</div>
					<Camp />
				</div>
			</div>
		</div>
	);
};

export default Home;
