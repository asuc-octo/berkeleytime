import styles from "./LandingExperiment.module.scss";

// Get upcoming semester (what students are likely registering for)
const getUpcomingSemester = () => {
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const year = now.getFullYear();

  // Nov-Dec: Spring of next year, Jan-Apr: Fall of same year, May-Oct: Spring of next year
  if (month >= 10) return { year: year + 1, semester: "Spring" }; // Nov-Dec -> Spring next year
  if (month <= 3) return { year, semester: "Fall" }; // Jan-Apr -> Fall same year
  return { year: year + 1, semester: "Spring" }; // May-Oct -> Spring next year
};

const LandingExperiment = () => {
  const { year, semester } = getUpcomingSemester();
  const defaultClassUrl = `/catalog/${year}/${semester}/COMPSCI/61A/001?embed=true`;

  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <div className={styles.previewSection}>
          <div className={styles.previewHeader}>
            <h1 className={styles.previewTitle}>
              Berkeley's largest course discovery platform
              <br />
              built and run by students, for students
            </h1>
          </div>
          <div className={styles.previewWrapper}>
            <div className={styles.previewBackground}>
              <div className={styles.gradientLayer1} />
              <div className={styles.gradientLayer2} />
            </div>
            <div className={styles.previewContainer}>
              <iframe
                src={defaultClassUrl}
                className={styles.previewIframe}
                title="Catalog Preview"
              />
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardText}>
              <h2 className={styles.cardTitle}>Find the right classes for you</h2>
              <p>Instead of spending hours sifting through courses on the Berkeley course catalog, instantly filter and sort courses by average grade, number of open seats, and more.</p>
            </div>
            <div className={styles.innerCard} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingExperiment;
