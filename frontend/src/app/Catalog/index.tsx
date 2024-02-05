import { ArrowSeparateVertical, Bookmark, Plus, Xmark } from "iconoir-react";

import AverageGrade from "@/components/AverageGrade";
import Button from "@/components/Button";
import Capacity from "@/components/Capacity";
import IconButton from "@/components/IconButton";
import MenuItem from "@/components/MenuItem";

import styles from "./Catalog.module.scss";
import Course from "./Course";

const courses = [
  {
    title: "Intermediate Microeconomics with Applications to Sustainability",
    subject: "ENVECON",
    number: "100",
    gradeAverage: 3.6,
    classes: [
      {
        title:
          "Intermediate Microeconomics with Applications to Sustainability",
        unitsMax: 4,
        unitsMin: 4,
        enrollCount: 101,
        enrollMax: 121,
        waitlistCount: 0,
      },
    ],
  },
  {
    title: "Physics for Scientists and Engineers",
    subject: "PHYSICS",
    number: "7A",
    gradeAverage: 3.2,
    classes: [
      {
        title: "Physics for Scientists and Engineers",
        unitsMax: 4,
        unitsMin: 4,
        enrollCount: 216,
        enrollMax: 216,
        waitlistCount: 13,
      },
      {
        title: "Physics for Scientists and Engineers",
        unitsMax: 4,
        unitsMin: 4,
        enrollCount: 192,
        enrollMax: 192,
        waitlistCount: 7,
      },
      {
        title: "Physics for Scientists and Engineers",
        unitsMax: 4,
        unitsMin: 4,
        enrollCount: 216,
        enrollMax: 216,
        waitlistCount: 10,
      },
    ],
  },
];

export default function Catalog() {
  return (
    <div className={styles.root}>
      <div className={styles.column}>
        <div className={styles.placeholder} />
      </div>
      <div className={styles.body}>
        <div className={styles.wrapper}>
          {courses.map((course) => (
            <Course course={course} />
          ))}
        </div>
        <div className={styles.footer}>2 results</div>
      </div>
      <div className={styles.course}>
        <div className={styles.header}>
          <div className={styles.details}>
            <div className={styles.text}>
              <h1 className={styles.heading}>ENVECON 100</h1>
              <p className={styles.description}>
                Intermediate Microeconomics with Applications to Sustainability
              </p>
            </div>
            <div className={styles.group}>
              <IconButton>
                <Plus />
              </IconButton>
              <IconButton>
                <Bookmark />
              </IconButton>
              <IconButton>
                <Xmark />
              </IconButton>
            </div>
          </div>
          <div className={styles.information}>
            <Button secondary>
              <ArrowSeparateVertical />
              Spring 2024
            </Button>
            <AverageGrade averageGrade={3.6} />
            <Capacity enrolled={101} capacity={121} waitlisted={0} />
            <div className={styles.units}>4 units</div>
          </div>
          <div className={styles.row}>
            <div className={styles.detail}>
              <div className={styles.title}>Time</div>
              <div className={styles.description}>TuTh 6:30 PM – 7:59 PM</div>
            </div>
            <div className={styles.detail}>
              <div className={styles.title}>Location</div>
              <div className={styles.description}>
                Anthro/Art Practice Bldg 160
              </div>
            </div>
            <div className={styles.detail}>
              <div className={styles.title}>Instructor</div>
              <div className={styles.description}>CISSE A</div>
            </div>
          </div>
          <div className={styles.menu}>
            <MenuItem active>Overview</MenuItem>
            <MenuItem>Sections</MenuItem>
            <MenuItem>Grades</MenuItem>
            <MenuItem>Enrollment</MenuItem>
          </div>
        </div>
        <div className={styles.placeholder} />
      </div>
    </div>
  );
}
