import styles from "./ScrollFeatures.module.scss";

const features = [
  {
    id: 1,
    title: "Catalog: Find your fit",
    description:
      "Browse thousands of courses with filters for units, level, schedule, and requirements. Check reserved seating, read instructor notes, and see ratings—all before you enroll.",
  },
  {
    id: 2,
    title: "Grades: Know the curve",
    description:
      "Compare grade distributions across courses and instructors. See how grading has changed over time and find the right fit for your GPA goals.",
  },
  {
    id: 3,
    title: "Enrollment: Time it right",
    description:
      "Track how fast classes fill up across enrollment phases. See waitlist trends, compare demand between sections, and plan when to enroll.",
  },
  {
    id: 4,
    title: "Scheduler: Design your week",
    description:
      "Build conflict-free schedules with a visual calendar. See class locations on a map, compare multiple schedule drafts, and share with friends.",
  },
  {
    id: 5,
    title: "GradTrak: See the finish line",
    description:
      "Plan all four years across multiple majors and minors. Track degree requirements in real time so nothing stands between you and graduation.",
  },
];

export default function ScrollFeatures() {
  const lastFeature = features[features.length - 1];
  const otherFeatures = features.slice(0, -1);

  return (
    <div className={styles.wrapper}>
      <section className={styles.container}>
        {/* Wrapper for sticky header + all slides except last */}
        <div className={styles.stickyScope}>
          <div className={styles.header}>
            <h2 className={styles.title}>Your academic toolkit</h2>
          </div>

          <div className={styles.content}>
            {otherFeatures.map((feature) => (
              <div key={feature.id} className={styles.slide}>
                <div className={styles.slideContent}>
                  <h3 className={styles.slideTitle}>{feature.title}</h3>
                  <p className={styles.slideDescription}>
                    {feature.description}
                  </p>
                </div>
                <div className={styles.slidePlaceholder}>
                  <span>Feature Preview</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Last slide outside sticky scope - header unsticks here */}
        <div className={styles.lastSlide}>
          <div className={styles.slide}>
            <div className={styles.slideContent}>
              <h3 className={styles.slideTitle}>{lastFeature.title}</h3>
              <p className={styles.slideDescription}>
                {lastFeature.description}
              </p>
            </div>
            <div className={styles.slidePlaceholder}>
              <span>Feature Preview</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
