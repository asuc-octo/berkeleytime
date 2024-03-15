import styles from "./Calendar.module.scss";

export default function Calendar() {
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.timeZone}>PST</div>
        <div className={styles.week}>
          <div className={styles.day}>Sunday</div>
          <div className={styles.day}>Monday</div>
          <div className={styles.day}>Tuesday</div>
          <div className={styles.day}>Wednesday</div>
          <div className={styles.day}>Thursday</div>
          <div className={styles.day}>Friday</div>
          <div className={styles.day}>Saturday</div>
        </div>
      </div>
      <div className={styles.view}>
        <div className={styles.sideBar}>
          {[...Array(17)].map((_, hour) => (
            <div key={hour} className={styles.hour}>
              {hour + 7 < 12
                ? `${hour + 7} AM`
                : `${hour + 7 === 12 ? 12 : hour - 5} PM`}
            </div>
          ))}
        </div>
        <div className={styles.week}>
          {[...Array(7)].map((_, day) => (
            <div key={day} className={styles.day}>
              {[...Array(18)].map((_, hour) => (
                <div key={hour} className={styles.hour}></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
