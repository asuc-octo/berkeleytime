import { ArrowRight } from "iconoir-react";
import { Link } from "react-router-dom";

import Container from "@/components/Container";

import styles from "./Features.module.scss";
import calendar from "./calendar.png";
import schedule from "./schedule.png";

export default function Features() {
  return (
    <div className={styles.root}>
      <Container>
        <div className={styles.row}>
          <div className={styles.gallery}>
            <img src={calendar} className={styles.calendar} />
            <img src={schedule} className={styles.schedule} />
          </div>
          <div className={styles.text}>
            <div className={styles.badge}>New</div>
            <h3 className={styles.heading}>Simple schedule planning</h3>
            <p className={styles.description}>
              Plan, save, and share schedules. An alternative to CalCentral,
              Berkeleytime makes scheduling your semester easy and
              user-friendly.
            </p>
            <Link to="/schedules" className={styles.link}>
              Start planning
              <ArrowRight />
            </Link>
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.text}>
            <h3 className={styles.heading}>Find the right classes for you</h3>
            <p className={styles.description}>
              Instead of spending hours sifting through courses on the Berkeley
              course catalog, instantly filter and sort courses by average
              grade, number of open seats, and more.
            </p>
            <Link to="/schedules" className={styles.link}>
              Browse courses
              <ArrowRight />
            </Link>
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.text}>
            <h3 className={styles.heading}>Get ahead of the curve</h3>
            <p className={styles.description}>
              View grade distributions for classes based on the semester and
              professor. Stop worrying about the A, and make informed decisions
              about your schedule.
            </p>
            <Link to="/schedules" className={styles.link}>
              Go to Grades
              <ArrowRight />
            </Link>
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.text}>
            <h3 className={styles.heading}>Secure your seat</h3>
            <p className={styles.description}>
              Track enrollment for courses and sections in real-time. View
              enrollment history over time and know when to enroll, and when you
              can wait.
            </p>
            <Link to="/schedules" className={styles.link}>
              Go to Enrollment
              <ArrowRight />
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
