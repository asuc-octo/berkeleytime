import { useMemo } from "react";

import { FrameAltEmpty, OpenNewWindow } from "iconoir-react";

import CCN from "@/components/CCN";
import Details from "@/components/Details";
import IconButton from "@/components/IconButton";
import LoadingIndicator from "@/components/LoadingIndicator";
import { IClass, Semester } from "@/lib/api";
import { getExternalLink } from "@/lib/section";

import Capacity from "../../../../components/Capacity";
import styles from "./Sections.module.scss";

interface SectionsProps {
  currentClass?: IClass;
  currentYear: number;
  currentSemester: Semester;
}

export default function Sections({
  currentClass,
  currentYear,
  currentSemester,
}: SectionsProps) {
  const types = useMemo(
    () =>
      Array.from(
        new Set(currentClass?.sections.map((section) => section.component))
      ),
    [currentClass]
  );

  return currentClass ? (
    currentClass.sections.length === 0 ? (
      <div className={styles.placeholder}>
        <FrameAltEmpty width={32} height={32} />
        <p className={styles.title}>No associated sections</p>
        <p className={styles.description}>
          Please refer to the class syllabus or instructor for the most accurate
          information regarding class attendance requirements.
        </p>
      </div>
    ) : (
      <div className={styles.root}>
        <div className={styles.menu}>
          {types.map((type) => (
            <div className={styles.item}>{type}</div>
          ))}
        </div>
        <div className={styles.view}>
          {currentClass.sections.map((section) => (
            <div className={styles.section} key={section.ccn}>
              <div className={styles.header}>
                <div className={styles.text}>
                  <p className={styles.title}>
                    {section.component} {section.number}
                  </p>
                  <CCN ccn={section.ccn} />
                </div>
                <Capacity
                  enrollCount={section.enrollCount}
                  enrollMax={section.enrollMax}
                  waitlistCount={section.waitlistCount}
                  waitlistMax={section.waitlistMax}
                />
                {currentClass && (
                  <IconButton
                    as="a"
                    href={getExternalLink(
                      currentYear,
                      currentSemester,
                      currentClass.course.subject,
                      currentClass.course.number,
                      section.number,
                      section.component
                    )}
                    target="_blank"
                  >
                    <OpenNewWindow />
                  </IconButton>
                )}
              </div>
              <Details
                days={section.meetings[0].days}
                startTime={section.meetings[0].startTime}
                endTime={section.meetings[0].endTime}
                location={section.meetings[0].location}
                instructors={section.meetings[0].instructors}
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
