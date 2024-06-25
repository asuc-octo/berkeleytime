import { useMemo, useState } from "react";

import { useQuery } from "@apollo/client";
import classNames from "classnames";
import {
  Bookmark,
  BookmarkSolid,
  CalendarPlus,
  GridPlus,
  Heart,
  HeartSolid,
  OpenInWindow,
  OpenNewWindow,
  Xmark,
} from "iconoir-react";
import { Link, useSearchParams } from "react-router-dom";

import AverageGrade from "@/components/AverageGrade";
import Button from "@/components/Button";
import CCN from "@/components/CCN";
import Capacity from "@/components/Capacity";
import IconButton from "@/components/IconButton";
import MenuItem from "@/components/MenuItem";
import Tooltip from "@/components/Tooltip";
import Units from "@/components/Units";
import { GET_CLASS, IClass, ICourse, Semester } from "@/lib/api";
import { getExternalLink } from "@/lib/section";

import styles from "./Class.module.scss";
import Enrollment from "./Enrollment";
import Grades from "./Grades";
import Overview from "./Overview";
import Sections from "./Sections";

const views = [
  {
    text: "Overview",
    Component: Overview,
  },
  {
    text: "Sections",
    Component: Sections,
  },
  {
    text: "Grades",
    Component: Grades,
  },
  {
    text: "Enrollment",
    Component: Enrollment,
  },
];

interface ClassProps {
  partialCurrentCourse: ICourse | null;
  currentSemester: Semester;
  currentYear: number;
  currentClassNumber: string;
  currentCourseNumber: string;
  currentSubject: string;
}

export default function Class({
  partialCurrentCourse,
  currentSemester,
  currentYear,
  currentClassNumber,
  currentCourseNumber,
  currentSubject,
}: ClassProps) {
  const [searchParams] = useSearchParams();
  const [view, setView] = useState(0);

  // TODO: Query for enrollment and grades data in the background

  const { data } = useQuery<{ class: IClass }>(GET_CLASS, {
    variables: {
      term: {
        semester: currentSemester,
        year: currentYear,
      },
      subject: currentSubject,
      courseNumber: currentCourseNumber,
      classNumber: currentClassNumber,
    },
  });

  const partialCurrentClass = useMemo(
    () =>
      partialCurrentCourse?.classes.find(
        (class_) => class_.number === currentClassNumber
      ),
    [partialCurrentCourse, currentClassNumber]
  );

  const currentClass = useMemo(() => data?.class, [data]);

  const Component = useMemo(() => views[view].Component, [view]);

  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.row}>
          <div className={styles.group}>
            <Tooltip content={liked ? "Remove like" : "Like course"}>
              <Button
                secondary
                className={classNames(styles.like, { [styles.active]: liked })}
                onClick={() => setLiked(!liked)}
              >
                {liked ? <HeartSolid /> : <Heart />}
                23
              </Button>
            </Tooltip>
            <Tooltip
              content={bookmarked ? "Remove bookmark" : "Bookmark course"}
            >
              <IconButton
                className={classNames(styles.bookmark, {
                  [styles.active]: bookmarked,
                })}
                onClick={() => setBookmarked(!bookmarked)}
              >
                {bookmarked ? <BookmarkSolid /> : <Bookmark />}
              </IconButton>
            </Tooltip>
            <Tooltip content="Add class to schedule">
              <IconButton>
                <CalendarPlus />
              </IconButton>
            </Tooltip>
            <Tooltip content="Add course to plan">
              <IconButton>
                <GridPlus />
              </IconButton>
            </Tooltip>
          </div>
          <div className={styles.group}>
            <Tooltip content="Open course">
              <IconButton>
                <OpenInWindow />
              </IconButton>
            </Tooltip>
            {currentClass && (
              <Tooltip content="Open on the Berkeley Academic Guide">
                <a
                  href={getExternalLink(
                    currentYear,
                    currentSemester,
                    currentSubject,
                    currentCourseNumber,
                    currentClass.primarySection.number,
                    currentClass.primarySection.component
                  )}
                  target="_blank"
                >
                  <IconButton>
                    <OpenNewWindow />
                  </IconButton>
                </a>
              </Tooltip>
            )}
            <Tooltip content="Close">
              <Link
                to={{
                  pathname: `/catalog/${currentYear}/${currentSemester}`,
                  search: searchParams.toString(),
                }}
              >
                <IconButton>
                  <Xmark />
                </IconButton>
              </Link>
            </Tooltip>
          </div>
        </div>
        <h1 className={styles.heading}>
          {currentSubject} {currentCourseNumber}
        </h1>
        <p className={styles.description}>
          {currentClass?.title ??
            partialCurrentClass.title ??
            partialCurrentCourse.title}
        </p>
        <div className={styles.group}>
          <AverageGrade
            gradeAverage={
              currentClass?.course?.gradeAverage ??
              partialCurrentCourse.gradeAverage
            }
          />
          <Capacity
            enrollCount={
              currentClass?.primarySection.enrollCount ??
              partialCurrentClass.primarySection.enrollCount
            }
            enrollMax={
              currentClass?.primarySection.enrollMax ??
              partialCurrentClass.primarySection.enrollMax
            }
            waitlistCount={
              currentClass?.primarySection.waitlistCount ??
              partialCurrentClass.primarySection.waitlistCount
            }
            waitlistMax={
              currentClass?.primarySection.waitlistMax ??
              partialCurrentClass.primarySection.waitlistMax
            }
          />
          <Units
            unitsMax={currentClass?.unitsMax ?? partialCurrentClass.unitsMax}
            unitsMin={currentClass?.unitsMin ?? partialCurrentClass.unitsMin}
          />
          {currentClass && <CCN ccn={currentClass.primarySection.ccn} />}
        </div>
      </div>
      <div className={styles.menu}>
        {views.map(({ text }, index) => (
          <MenuItem
            key={index}
            active={index === view}
            onClick={() => setView(index)}
          >
            {text}
          </MenuItem>
        ))}
      </div>
      <Component
        currentClass={currentClass}
        currentYear={currentYear}
        currentSemester={currentSemester}
      />
    </div>
  );
}
