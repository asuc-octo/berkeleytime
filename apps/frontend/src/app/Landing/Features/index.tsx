import { ReactNode } from "react";

import classNames from "classnames";
import { Link } from "react-router-dom";

import { Badge, Button } from "@repo/theme";

import catalogClass from "../assets/catalog-class.png";
import catalogFilters from "../assets/catalog-filters.png";
import catalogResults from "../assets/catalog-results.png";
import enrollmentCardA from "../assets/enrollment-card-a.png";
import enrollmentCardB from "../assets/enrollment-card-b.png";
import enrollmentChart from "../assets/enrollment-chart.png";
import enrollmentHeader from "../assets/enrollment-header.png";
import gradesCardA from "../assets/grades-card-a.png";
import gradesCardB from "../assets/grades-card-b.png";
import gradesChart from "../assets/grades-chart.png";
import gradesHeader from "../assets/grades-header.png";
import schedulerMain from "../assets/scheduler-main.png";
import schedulerSidebar from "../assets/scheduler-sidebar.png";
import styles from "./Features.module.scss";

interface FeatureTextProps {
  title: string;
  description: ReactNode;
  cta: string;
  to: string;
  isNew?: boolean;
  className?: string;
}

function FeatureText({
  title,
  description,
  cta,
  to,
  isNew,
  className,
}: FeatureTextProps) {
  return (
    <div className={classNames(styles.text, className)}>
      {isNew && (
        <Badge
          label="NEW!"
          color="orange"
          className={styles.badge}
          style={{ color: "white", backgroundColor: "var(--orange-600)" }}
        />
      )}
      <div className={styles.copy}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
      </div>
      <Button as={Link} to={to} className={styles.button}>
        {cta}
      </Button>
    </div>
  );
}

export default function Features() {
  return (
    <section className={styles.root}>
      <div className={styles.feature}>
        <div className={classNames(styles.collage, styles.scheduler)}>
          <div className={classNames(styles.card, styles.schedulerSidebar)}>
            <div className={styles.crop}>
              <img src={schedulerSidebar} alt="" />
            </div>
          </div>
          <div className={classNames(styles.shot, styles.schedulerMain)}>
            <img src={schedulerMain} alt="Berkeleytime Scheduler" />
          </div>
        </div>
        <FeatureText
          isNew
          title="Easy scheduling starts here!"
          description="Plan out, save, & compare schedules on Scheduler"
          cta="Try Scheduler now!"
          to="/schedules"
          className={styles.schedulerText}
        />
      </div>

      <div className={styles.feature}>
        <div className={classNames(styles.collage, styles.catalog)}>
          <div className={classNames(styles.shot, styles.catalogFilters)}>
            <img src={catalogFilters} alt="" />
          </div>
          <div className={classNames(styles.shot, styles.catalogResults)}>
            <img src={catalogResults} alt="" />
          </div>
          <div className={classNames(styles.shot, styles.catalogClass)}>
            <img src={catalogClass} alt="Berkeleytime Class Catalog" />
          </div>
          <div className={styles.catalogPatch} />
        </div>
        <FeatureText
          title="Find the right classes for you."
          description="All UC Berkeley courses in one place."
          cta="Search Class Catalog"
          to="/catalog"
          className={styles.catalogText}
        />
      </div>

      <div className={styles.feature}>
        <div className={classNames(styles.collage, styles.grades)}>
          <div className={classNames(styles.shot, styles.gradesCardA)}>
            <img src={gradesCardA} alt="" />
          </div>
          <div className={classNames(styles.card, styles.gradesMain)}>
            <div className={styles.gradesChart}>
              <img src={gradesChart} alt="Berkeleytime Grades" />
            </div>
            <div className={styles.gradesHeader}>
              <img src={gradesHeader} alt="" />
            </div>
            <div className={styles.gradesPatch} />
          </div>
          <div className={classNames(styles.shot, styles.gradesCardB)}>
            <img src={gradesCardB} alt="" />
          </div>
        </div>
        <FeatureText
          title="Get ahead of the curve."
          description={
            <>
              Check out the grade history of different courses
              <br />
              based on professor or semester.
            </>
          }
          cta="Check Grade Distributions"
          to="/grades"
          className={styles.gradesText}
        />
      </div>

      <div className={styles.feature}>
        <div className={classNames(styles.collage, styles.enrollment)}>
          <div className={classNames(styles.card, styles.enrollmentMain)}>
            <div className={styles.enrollmentChart}>
              <img src={enrollmentChart} alt="Berkeleytime Enrollment" />
            </div>
            <div className={styles.enrollmentHeader}>
              <img src={enrollmentHeader} alt="" />
            </div>
          </div>
          <div className={classNames(styles.shot, styles.enrollmentCardA)}>
            <img src={enrollmentCardA} alt="" />
          </div>
          <div className={classNames(styles.card, styles.enrollmentCardB)}>
            <div className={styles.enrollmentCardBImage}>
              <img src={enrollmentCardB} alt="" />
            </div>
          </div>
        </div>
        <FeatureText
          title="Secure your class seat."
          description={
            <>
              Track course enrollment trends and decide
              <br />
              when to enroll.
            </>
          }
          cta="Go to Enrollment"
          to="/enrollment"
          className={styles.enrollmentText}
        />
      </div>
    </section>
  );
}
