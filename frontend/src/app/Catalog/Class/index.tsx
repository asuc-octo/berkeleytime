import { useMemo, useState } from "react";

import { useQuery } from "@apollo/client";
import {
  BookmarkSolid,
  CalendarPlus,
  Heart,
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
import Units from "@/components/Units";
import {
  GET_CLASS,
  ICatalogClass,
  ICatalogCourse,
  IClass,
  Semester,
} from "@/lib/api";
import { getExternalLink } from "@/lib/section";

import styles from "./Class.module.scss";
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
    Component: () => null,
  },
  {
    text: "Enrollment",
    Component: () => null,
  },
];

interface ClassProps {
  partialCurrentCourse: ICatalogCourse;
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
      partialCurrentCourse.classes.find(
        (class_) => class_.number === currentClassNumber
      ) as ICatalogClass,
    [partialCurrentCourse, currentClassNumber]
  );

  const currentClass = useMemo(() => data?.class, [data?.class]);

  const Component = useMemo(() => views[view].Component, [view]);

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.row}>
          <div className={styles.group}>
            <Button secondary>
              <Heart />
              23
            </Button>
            <IconButton>
              <BookmarkSolid />
            </IconButton>
            <IconButton>
              <CalendarPlus />
            </IconButton>
          </div>
          <div className={styles.group}>
            {/* TODO: Previously offered
            <Select.Root defaultValue={`${currentSemester} ${currentYear}`}>
              <Select.Trigger asChild>
                <Button secondary>
                  <Select.Value />
                  <Select.Icon asChild>
                    <ArrowSeparateVertical />
                  </Select.Icon>
                </Button>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content
                  position="popper"
                  className={styles.content}
                  align="end"
                >
                  {currentClass?.course?.classes.map(
                    ({ year, semester }, index) => (
                      <Select.Item key={index} value={`${semester} ${year}`}>
                        <Select.ItemText>
                          {semester} {year}
                        </Select.ItemText>
                      </Select.Item>
                    )
                  )}
                </Select.Content>
              </Select.Portal>
                </Select.Root>*/}
            {currentClass && (
              <IconButton
                as="a"
                href={getExternalLink(
                  currentYear,
                  currentSemester,
                  currentSubject,
                  currentCourseNumber,
                  currentClass.primarySection.number,
                  currentClass.primarySection.kind
                )}
                target="_blank"
              >
                <OpenNewWindow />
              </IconButton>
            )}
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
              currentClass?.enrollCount ?? partialCurrentClass.enrollCount
            }
            enrollMax={currentClass?.enrollMax ?? partialCurrentClass.enrollMax}
            waitlistCount={
              currentClass?.waitlistCount ?? partialCurrentClass.waitlistCount
            }
            waitlistMax={
              currentClass?.waitlistMax ?? partialCurrentClass.waitlistMax
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
