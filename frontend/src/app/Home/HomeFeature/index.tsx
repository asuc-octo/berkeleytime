import styles from './HomeFeature.module.scss';
import med from '../../../assets/img/landing/medtestimg.png';
import large from '../../../assets/img/landing/scheduler.png';

const LandingContent = () => {
	return (
		<div className={styles.root}>
			<div className={styles.section}>
				<div className={styles.panelLeft}>
					<div className={styles.scheduler1}>
						<img className={styles.image} src={med}></img>
					</div>
					<div className={styles.scheduler2}>
						<img className={styles.image} src={large}></img>
					</div>
				</div>
				<div className={styles.panelRight}>
					<div>
						<span className={styles.newBadge}>NEW!</span>
					</div>
					<div>
						<h2 className={styles.header}>Easy scheduling starts here!</h2>
						<p className={styles.content}>Plan out, save & compare schedules on Scheduler!</p>
					</div>
					<a>
						<button>Try Scheduler Now!</button>
					</a>
				</div>
			</div>
		</div>
	);
};
export default LandingContent;
