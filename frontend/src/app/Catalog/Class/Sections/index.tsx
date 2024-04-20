import { useMemo } from "react";

import { FrameAltEmpty } from "iconoir-react";

import CCN from "@/components/CCN";
import Details from "@/components/Details";
import LoadingIndicator from "@/components/LoadingIndicator";
import { IClass } from "@/lib/api";

import Capacity from "../../../../components/Capacity";
import styles from "./Sections.module.scss";

interface SectionsProps {
  currentClass?: IClass;
}

export default function Sections({ currentClass }: SectionsProps) {
  const types = useMemo(
    () =>
      Array.from(
        new Set(currentClass?.sections.map((section) => section.kind))
      ),
    [currentClass]
  );

  return currentClass ? (
    currentClass.sections.length === 0 ? (
      <div className={styles.placeholder}>
        <FrameAltEmpty width={32} height={32} />
        <p className={styles.title}>No associated sections</p>
        <p className={styles.description}>
          This class does not have any associated sections. However, please
          refer to the class syllabus or instructor for the most accurate
          information regarding class requirements.
        </p>
      </div>
    ) : (
      <div className={styles.root}>
        <div className={styles.menu}>
          {types.map((type) => (
            <div className={styles.item}>
              {type === "Laboratory" ? "Lab" : "Discussion"}s
            </div>
          ))}
        </div>
        <div className={styles.view}>
          {currentClass.sections.map((section) => (
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
    )
  ) : (
    <div className={styles.placeholder}>
      <LoadingIndicator size={32} />
    </div>
  );
}
