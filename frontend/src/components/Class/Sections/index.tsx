import { useEffect, useMemo, useRef, useState } from "react";

import { useQuery } from "@apollo/client";
import classNames from "classnames";
import { FrameAltEmpty, OpenNewWindow } from "iconoir-react";

import CCN from "@/components/CCN";
import Capacity from "@/components/Capacity";
import Details from "@/components/Details";
import IconButton from "@/components/IconButton";
import Tooltip from "@/components/Tooltip";
import { Component, GET_CLASS, IClass, componentMap } from "@/lib/api";
import { getExternalLink } from "@/lib/section";

import useClass from "../useClass";
import styles from "./Sections.module.scss";

export default function Sections() {
  const { subject, courseNumber, classNumber, semester, year } = useClass();

  const viewRef = useRef<HTMLDivElement>(null);
  const [group, setGroup] = useState<Component | null>(null);

  // TODO: Handle loading state
  const { data } = useQuery<{ class: IClass }>(GET_CLASS, {
    variables: {
      term: {
        semester,
        year,
      },
      subject,
      courseNumber,
      classNumber,
    },
  });

  // Because Sections will only be rendered when data loaded, we do
  // not need to worry about loading or error states for right now
  const _class = useMemo(() => data?.class as IClass, [data]);

  // TODO: Include primarySection
  const groups = useMemo(() => {
    const sortedSections = _class.sections.toSorted((a, b) =>
      a.number.localeCompare(b.number)
    );

    return Object.groupBy(sortedSections, (section) => section.component);
  }, [_class]);

  useEffect(() => {
    const element = viewRef.current;
    if (!element) return;

    let currentElement: HTMLElement | null = element;

    while (currentElement) {
      const overflowY = window.getComputedStyle(currentElement).overflowY;

      if (overflowY === "auto") {
        break;
      }

      currentElement = currentElement.parentElement;
    }

    if (!currentElement) return;

    const updateGroup = () => {
      const view = viewRef.current;
      if (!view) return;

      // element is a div that can scroll, find the child with the most pixels within the viewport
      const children = Array.from(view.children) as HTMLElement[];

      const visibleIndexes = children.map((child) => {
        const rect = child.getBoundingClientRect();
        const top = Math.max(rect.top, 0);
        const bottom = Math.min(rect.bottom, window.innerHeight);

        return bottom - top;
      });

      const maxVisibleIndex = visibleIndexes.reduce(
        (maxIndex, visible, index) =>
          visible > visibleIndexes[maxIndex] ? index : maxIndex,
        0
      );

      const group = Object.keys(groups)[maxVisibleIndex] as Component;
      setGroup(group);
    };

    updateGroup();

    currentElement.addEventListener("scroll", updateGroup);

    return () => {
      currentElement.removeEventListener("scroll", updateGroup);
    };
  }, [groups]);

  const handleClick = (index: number) => {
    viewRef.current?.children[index].scrollIntoView({ behavior: "smooth" });
  };

  return _class.sections.length === 0 ? (
    <div className={styles.placeholder}>
      <FrameAltEmpty width={32} height={32} />
      <p className={styles.heading}>No associated sections</p>
      <p className={styles.paragraph}>
        Please refer to the class syllabus or instructor for the most accurate
        information regarding class attendance requirements.
      </p>
    </div>
  ) : (
    <div className={styles.root}>
      <div className={styles.menu}>
        {Object.keys(groups).map((component, index) => (
          <div
            className={classNames(styles.item, {
              [styles.active]: group === component,
            })}
            onClick={() => handleClick(index)}
          >
            <p className={styles.component}>
              {componentMap[component as Component]}
            </p>
            <p className={styles.count}>
              {groups[component as Component]?.length.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
      <div className={styles.view} ref={viewRef}>
        {Object.values(groups).map((sections) => (
          <div className={styles.group}>
            {sections.map((section) => (
              <div className={styles.section} key={section.ccn}>
                <div className={styles.header}>
                  <div className={styles.text}>
                    <p className={styles.heading}>
                      {componentMap[section.component]} {section.number}
                    </p>
                    <CCN ccn={section.ccn} />
                  </div>
                  <Capacity
                    enrollCount={section.enrollCount}
                    enrollMax={section.enrollMax}
                    waitlistCount={section.waitlistCount}
                    waitlistMax={section.waitlistMax}
                  />
                  <Tooltip content="Berkeley Academic Guide">
                    <a
                      href={getExternalLink(
                        year,
                        semester,
                        courseNumber,
                        classNumber,
                        section.number,
                        section.component
                      )}
                      target="_blank"
                    >
                      <IconButton>
                        <OpenNewWindow />
                      </IconButton>
                    </a>
                  </Tooltip>
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
        ))}
      </div>
    </div>
  );
}
