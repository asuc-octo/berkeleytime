import styles from "./HomeFeature.module.scss";

const Scheduler = () => {
  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <div className={styles.panelLeft}>
          {/*<div className={styles.scheduler1}>
            <img src={scheduler1} className={styles.image} alt="" />
          </div>
          <div className={styles.scheduler2}>
            <img src={scheduler2} className={styles.image} alt="" />
  </div>*/}
        </div>
        <div className={styles.panelRight}>
          <button className={styles.badge}>NEW!</button>
          <h1 className={styles.heading}>Easy scheduling starts here!</h1>
          <p className={styles.content}>
            Plan out, save, & compare schedules on Scheduler
          </p>
          <button className={styles.button}>Try Scheduler Now!</button>
        </div>
      </div>
      {/* <div className={styles.section}>
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
		</div> */}
    </div>
  );
};
export default Scheduler;
