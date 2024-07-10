import { Suspense, useMemo, useState } from "react";

import { useQuery } from "@apollo/client";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import classNames from "classnames";
import {
  Bookmark,
  BookmarkSolid,
  CalendarPlus,
  GridPlus,
  Heart,
  HeartSolid,
  MoreVert,
  OpenInWindow,
  OpenNewWindow,
  Xmark,
} from "iconoir-react";
import { Link, NavLink, Outlet, useSearchParams } from "react-router-dom";

import AverageGrade from "@/components/AverageGrade";
import Boundary from "@/components/Boundary";
import Button from "@/components/Button";
import CCN from "@/components/CCN";
import Capacity from "@/components/Capacity";
import CourseDrawer from "@/components/CourseDrawer";
import IconButton from "@/components/IconButton";
import LoadingIndicator from "@/components/LoadingIndicator";
import MenuItem from "@/components/MenuItem";
import Tooltip from "@/components/Tooltip";
import Units from "@/components/Units";
import useCatalog from "@/hooks/useCatalog";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { GET_CLASS, IClass } from "@/lib/api";
import { getExternalLink } from "@/lib/section";

import styles from "./Class.module.scss";

export default function Class() {
  const [searchParams] = useSearchParams();

  const { width } = useWindowDimensions();

  const { subject, courseNumber, classNumber, semester, year, partialClass } =
    useCatalog();

  // Because Class will only be rendered when partialClass or _class has been set,
  // we can render accordingly and not worry about loading or error states
  const { data, loading } = useQuery<{ class: IClass }>(GET_CLASS, {
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

  const _class = useMemo(() => data?.class, [data]);

  const gradeAverage = useMemo(
    () =>
      (_class?.course.gradeAverage ??
        partialClass?.course.gradeAverage) as number,
    [_class, partialClass]
  );

  const enrollCount = useMemo(
    () =>
      (_class?.primarySection.enrollCount ??
        partialClass?.primarySection.enrollCount) as number,
    [_class, partialClass]
  );

  const enrollMax = useMemo(
    () =>
      (_class?.primarySection.enrollMax ??
        partialClass?.primarySection.enrollMax) as number,
    [_class, partialClass]
  );

  const waitlistCount = useMemo(
    () =>
      (_class?.primarySection.waitlistCount ??
        partialClass?.primarySection.waitlistCount) as number,
    [_class, partialClass]
  );

  const waitlistMax = useMemo(
    () =>
      (_class?.primarySection.waitlistMax ??
        partialClass?.primarySection.waitlistMax) as number,
    [_class, partialClass]
  );

  const unitsMax = useMemo(
    () => (_class?.unitsMax ?? partialClass?.unitsMax) as number,
    [_class, partialClass]
  );

  const unitsMin = useMemo(
    () => (_class?.unitsMin ?? partialClass?.unitsMin) as number,
    [_class, partialClass]
  );

  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [course, setCourse] = useState(false);

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
            <CourseDrawer
              subject={subject}
              number={courseNumber}
              open={course}
              onOpenChange={setCourse}
            />
            {width > 992 ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <IconButton>
                    <MoreVert />
                  </IconButton>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className={styles.dropdown}
                    sideOffset={8}
                    alignOffset={-5}
                    align="start"
                  >
                    <DropdownMenu.Item
                      className={styles.item}
                      onClick={() => setCourse(true)}
                    >
                      <OpenInWindow />
                      View course
                    </DropdownMenu.Item>
                    <DropdownMenu.Item className={styles.item}>
                      <CalendarPlus />
                      Add class to schedule
                    </DropdownMenu.Item>
                    <DropdownMenu.Item className={styles.item}>
                      <GridPlus />
                      Add course to plan
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            ) : (
              <>
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
                <CourseDrawer subject={subject} number={courseNumber}>
                  <Tooltip content="Open course">
                    <IconButton>
                      <OpenInWindow />
                    </IconButton>
                  </Tooltip>
                </CourseDrawer>
              </>
            )}
          </div>
          <div className={styles.group}>
            {_class && (
              <Tooltip content="Berkeley Academic Guide">
                <IconButton
                  as="a"
                  href={getExternalLink(
                    year,
                    semester,
                    subject,
                    courseNumber,
                    _class.primarySection.number,
                    _class.primarySection.component
                  )}
                  target="_blank"
                >
                  <OpenNewWindow />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip content="Close">
              <Link
                to={{
                  pathname: `/catalog/${year}/${semester}`,
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
          {subject} {courseNumber} #{classNumber}
        </h1>
        <p className={styles.description}>
          {_class?.title ?? partialClass?.title ?? partialClass?.course.title}
        </p>
        <div className={styles.group}>
          <AverageGrade gradeAverage={gradeAverage} />
          <Capacity
            enrollCount={enrollCount}
            enrollMax={enrollMax}
            waitlistCount={waitlistCount}
            waitlistMax={waitlistMax}
          />
          <Units unitsMax={unitsMax} unitsMin={unitsMin} />
          {_class && <CCN ccn={_class.primarySection.ccn} />}
        </div>
      </div>
      <div className={styles.menu}>
        <NavLink to="." end>
          {({ isActive }) => <MenuItem active={isActive}>Overview</MenuItem>}
        </NavLink>
        <NavLink to="sections">
          {({ isActive }) => <MenuItem active={isActive}>Sections</MenuItem>}
        </NavLink>
        <NavLink to="enrollment">
          {({ isActive }) => <MenuItem active={isActive}>Enrollment</MenuItem>}
        </NavLink>
        <NavLink to="grades">
          {({ isActive }) => <MenuItem active={isActive}>Grades</MenuItem>}
        </NavLink>
      </div>
      {_class ? (
        <Suspense
          fallback={
            <Boundary>
              <LoadingIndicator />
            </Boundary>
          }
        >
          <Outlet />
        </Suspense>
      ) : loading ? (
        <Boundary>
          <LoadingIndicator />
        </Boundary>
      ) : (
        <></>
      )}
    </div>
  );
}
