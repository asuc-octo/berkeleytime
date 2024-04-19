import CCN from "@/components/CCN";
import Details from "@/components/Details";
import { IClass } from "@/lib/api";

import Capacity from "../../../../components/Capacity";
import styles from "./Sections.module.scss";

interface SectionsProps {
  currentClass?: IClass;
}

export default function Sections({ currentClass }: SectionsProps) {
  return (
    <div className={styles.root}>
      <div className={styles.menu}>
        <div className={styles.item}>Discussions</div>
        <div className={styles.item}>Labs</div>
      </div>
      <div className={styles.view}>
        {currentClass?.sections.map((section) => (
          <div className={styles.section} key={section.ccn}>
            <div className={styles.header}>
              <div className={styles.text}>
                <p className={styles.title}>
                  {section.kind === "Laboratory" ? "Lab" : section.kind}{" "}
                  {section.number}
                </p>
                <CCN ccn={section.ccn} />
              </div>
              <Capacity
                count={section.enrollCount}
                capacity={section.enrollMax}
                waitlistCount={section.waitlistCount}
                waitlistCapacity={section.waitlistMax}
              />
            </div>
            <Details
              days={section.days ?? []}
              timeStart={section.timeStart}
              timeEnd={section.timeEnd}
              location={section.location}
              instructors={section.instructors ?? []}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
