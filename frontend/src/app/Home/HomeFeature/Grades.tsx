import styles from './HomeFeature.module.scss';
import grades1 from '../../../assets/img/landing/grades1.png';
import grades2 from '../../../assets/img/landing/grades2.png';
import grades3 from '../../../assets/img/landing/grades3.png';

const Grades = () => {
	return (
		<div className={styles.root}>
			<div className={styles.container}>
				<div className={styles.panelLeft}>
					<div className={styles.grades1}>
						<img src={grades1} className={styles.image} alt="" />
					</div>
					<div className={styles.gradesRight}>
						<div className={styles.grades2}>
							<img src={grades2} className={styles.image} alt="" />
						</div>
						<div className={styles.grades3}>
							<img src={grades3} className={styles.image} alt="" />
						</div>
					</div>
				</div>
				<div className={styles.panelRight}>
					<h1 className={styles.heading}>Get ahead of the curve.</h1>
					<p className={styles.content}>
						Check out the grade history of different courses based on professor or semester.
					</p>
					<button className={styles.button}>Check Grade Distributions</button>
				</div>
			</div>
		</div>
	);
};
export default Grades;
