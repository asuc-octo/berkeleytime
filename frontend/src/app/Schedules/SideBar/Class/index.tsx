import classNames from "classnames";
import { ArrowSeparateVertical, ArrowUnionVertical } from "iconoir-react";

import CCN from "@/components/CCN";
import Units from "@/components/Units";
import { IClass } from "@/lib/api";

import styles from "./Class.module.scss";

interface ClassProps {
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
}

export default function Class({
  expanded,
  setExpanded,
  title,
  course,
  unitsMin,
  unitsMax,
  primarySection,
  number,
}: ClassProps & IClass) {
  return (
    <div className={styles.root}>
      <div className={styles.border} />
      <div className={styles.body}>
        <div className={styles.header} onClick={() => setExpanded(!expanded)}>
          <div className={styles.icon}>
            {expanded ? <ArrowUnionVertical /> : <ArrowSeparateVertical />}
          </div>
          <div className={styles.text}>
            <p className={styles.heading}>
              {course.subject} {course.number} {number}
            </p>
            <p className={styles.description}>{title ?? course.title}</p>
            <div className={styles.row}>
              <Units unitsMin={unitsMin} unitsMax={unitsMax} />
              <CCN ccn={primarySection.ccn} />
            </div>
          </div>
        </div>
        {expanded && (
          <>
            <div className={styles.group}>
              <p className={styles.label}>Lectures</p>
              <div className={classNames(styles.section, styles.active)}>
                <div className={styles.radioButton} />
                <div className={styles.text}>
                  <p className={styles.title}>
                    <span className={styles.important}>Lecture 001</span> (CCN:
                    23546)
                  </p>
                </div>
              </div>
              <div className={styles.section}>
                <div className={styles.radioButton}></div>
                <div className={styles.text}>
                  <p className={styles.title}>Lecture 001</p>
                </div>
              </div>
            </div>
            <div className={styles.group}>
              <p className={styles.label}>Discussions</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
