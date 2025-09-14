import { ReactNode, lazy, useCallback, useEffect, useMemo } from "react";

import classNames from "classnames";
import {
  Bookmark,
  BookmarkSolid,
  CalendarPlus,
  Expand,
  OpenBook,
  OpenNewWindow,
  SidebarCollapse,
  SidebarExpand,
  Xmark,
} from "iconoir-react";
import { Dialog, Tabs } from "radix-ui";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

import {
  Box,
  Container,
  Flex,
  IconButton,
  MenuItem,
  Tooltip,
} from "@repo/theme";

import { AverageGrade } from "@/components/AverageGrade";
import CCN from "@/components/CCN";
import Capacity from "@/components/Capacity";
import CourseDrawer from "@/components/CourseDrawer";
import Units from "@/components/Units";
import ClassContext from "@/contexts/ClassContext";
import { ClassPin } from "@/contexts/PinsContext";
import { useReadCourse, useReadUser, useUpdateUser } from "@/hooks/api";
import { useReadClass } from "@/hooks/api/classes/useReadClass";
import { IClass, Semester } from "@/lib/api";
import { RecentType, addRecent } from "@/lib/recent";
import { getExternalLink } from "@/lib/section";

import SuspenseBoundary from "../SuspenseBoundary";
import styles from "./Class.module.scss";

const Enrollment = lazy(() => import("./Enrollment"));
const Grades = lazy(() => import("./Grades"));
const Overview = lazy(() => import("./Overview"));
const Sections = lazy(() => import("./Sections"));
const Ratings = lazy(() => import("./Ratings"));
const Discussion = lazy(() => import("./Discussion"));

interface BodyProps {
  children: ReactNode;
  dialog?: boolean;
}

function Body({ children, dialog }: BodyProps) {
  return dialog ? children : <Outlet />;
}

interface RootProps {
  dialog?: boolean;
  children: ReactNode;
}

function Root({ dialog, children }: RootProps) {
  return dialog ? (
    <Tabs.Root asChild defaultValue="overview">
      {children}
    </Tabs.Root>
  ) : (
    children
  );
}

interface ControlledProps {
  class: IClass;
  year?: never;
  semester?: never;
  subject?: never;
  courseNumber?: never;
  number?: never;
}

interface UncontrolledProps {
  class?: never;
  year: number;
  semester: Semester;
  subject: string;
  courseNumber: string;
  number: string;
}

interface CatalogClassProps {
  dialog?: never;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  onClose: () => void;
}

interface DialogClassProps {
  dialog: true;
  expanded?: never;
  onExpandedChange?: never;
  onClose?: never;
}

// TODO: Determine whether a controlled input is even necessary
type ClassProps = (CatalogClassProps | DialogClassProps) &
  (ControlledProps | UncontrolledProps);

export default function Class({
  year,
  semester,
  subject,
  courseNumber,
  number,
  class: providedClass,
  expanded,
  onExpandedChange,
  onClose,
  dialog,
}: ClassProps) {
  // const { pins, addPin, removePin } = usePins();
  const location = useLocation();

  const { data: user, loading: userLoading } = useReadUser();

  const [updateUser] = useUpdateUser();

  const { data: course, loading: courseLoading } = useReadCourse(
    providedClass?.subject ?? (subject as string),
    providedClass?.courseNumber ?? (courseNumber as string)
  );

  const { data, loading } = useReadClass(
    year as number,
    semester as Semester,
    subject as string,
    courseNumber as string,
    number as string,
    {
      // Allow class to be provided
      skip: !!providedClass,
    }
  );

  const _class = useMemo(() => providedClass ?? data, [data, providedClass]);

  const bookmarked = useMemo(
    () =>
      user?.bookmarkedClasses.some(
        (bookmarkedClass) =>
          bookmarkedClass.subject === _class?.subject &&
          bookmarkedClass.courseNumber === _class?.courseNumber &&
          bookmarkedClass.number === _class?.number &&
          bookmarkedClass.year === _class?.year &&
          bookmarkedClass.semester === _class?.semester
      ),
    [user, _class]
  );

  const pin = useMemo(() => {
    if (!_class) return;

    const { year, semester, subject, courseNumber, number } = _class;

    const id = `${year}-${semester}-${subject}-${courseNumber}-${number}`;

    return {
      id,
      type: "class",
      data: {
        year,
        semester,
        subject,
        courseNumber,
        number,
      },
    } as ClassPin;
  }, [_class]);

  // const pinned = useMemo(() => pins.some((p) => p.id === pin?.id), [pins, pin]);

  const bookmark = useCallback(async () => {
    if (!user || !_class) return;

    const bookmarkedClasses = bookmarked
      ? user.bookmarkedClasses.filter(
          (bookmarkedClass) =>
            !(
              bookmarkedClass.subject === _class?.subject &&
              bookmarkedClass.courseNumber === _class?.courseNumber &&
              bookmarkedClass.number === _class?.number &&
              bookmarkedClass.year === _class?.year &&
              bookmarkedClass.semester === _class?.semester
            )
        )
      : user.bookmarkedClasses.concat(_class);
    await updateUser(
      {
        bookmarkedClasses: bookmarkedClasses.map((bookmarkedClass) => ({
          subject: bookmarkedClass.subject,
          number: bookmarkedClass.number,
          courseNumber: bookmarkedClass.courseNumber,
          year: bookmarkedClass.year,
          semester: bookmarkedClass.semester,
          sessionId: bookmarkedClass.sessionId,
        })),
      },
      {
        optimisticResponse: {
          updateUser: {
            ...user,
            bookmarkedClasses: user.bookmarkedClasses,
          },
        },
      }
    );
  }, [_class, bookmarked, updateUser, user]);

  useEffect(() => {
    if (!_class) return;

    addRecent(RecentType.Class, {
      subject: _class.subject,
      year: _class.year,
      semester: _class.semester,
      courseNumber: _class.courseNumber,
      number: _class.number,
    });
  }, [_class]);

  const ratingsCount = useMemo(() => {
    return (
      course &&
      course.aggregatedRatings &&
      course.aggregatedRatings.metrics.length > 0 &&
      Math.max(
        ...Object.values(course.aggregatedRatings.metrics.map((v) => v.count))
      )
    );
  }, [course]);

  // TODO: Loading state
  if (loading || courseLoading) {
    return <></>;
  }

  // TODO: Error state
  if (!course || !_class || !pin) {
    return <></>;
  }

  return (
    <Root dialog={dialog}>
      <Flex direction="column" flexGrow="1">
        <Box className={styles.header} pt="5" px="5">
          <Container size="3">
            <Flex direction="column" gap="5">
              <Flex justify="between">
                <Flex gap="3">
                  {!dialog && (
                    <Tooltip content={expanded ? "Expand" : "Collapse"}>
                      <IconButton onClick={() => onExpandedChange(!expanded)}>
                        {expanded ? <SidebarCollapse /> : <SidebarExpand />}
                      </IconButton>
                    </Tooltip>
                  )}
                  {/* TODO: Reusable bookmark button */}
                  <Tooltip
                    content={bookmarked ? "Remove bookmark" : "Bookmark"}
                  >
                    <IconButton
                      className={classNames(styles.bookmark, {
                        [styles.active]: bookmarked,
                      })}
                      onClick={() => bookmark()}
                      disabled={userLoading}
                    >
                      {bookmarked ? <BookmarkSolid /> : <Bookmark />}
                    </IconButton>
                  </Tooltip>
                  {/* TODO: Reusable pin button
              <Tooltip content={pinned ? "Remove pin" : "Pin"}>
                <IconButton
                  className={classNames(styles.bookmark, {
                    [styles.active]: pinned,
                  })}
                  onClick={() => (pinned ? removePin(pin) : addPin(pin))}
                >
                  {pinned ? <PinSolid /> : <Pin />}
                </IconButton>
              </Tooltip> */}
                  <Tooltip content="Add to schedule">
                    <IconButton>
                      <CalendarPlus />
                    </IconButton>
                  </Tooltip>
                </Flex>
                <Flex gap="3">
                  {dialog ? (
                    <Tooltip content="View course">
                      <IconButton
                        as={Link}
                        to={`/courses/${_class.subject}/${_class.courseNumber}`}
                      >
                        <OpenBook />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <CourseDrawer
                      subject={_class.subject}
                      number={_class.courseNumber}
                    >
                      <Tooltip content="View course">
                        <IconButton>
                          <OpenBook />
                        </IconButton>
                      </Tooltip>
                    </CourseDrawer>
                  )}
                  <Tooltip content="Berkeley Academic Guide">
                    <IconButton
                      as="a"
                      href={getExternalLink(
                        _class.year,
                        _class.semester,
                        _class.subject,
                        _class.courseNumber,
                        _class.primarySection.number,
                        _class.primarySection.component
                      )}
                      target="_blank"
                    >
                      <OpenNewWindow />
                    </IconButton>
                  </Tooltip>
                  {dialog && (
                    <Tooltip content="Expand">
                      <Dialog.Close asChild>
                        <IconButton
                          as={Link}
                          to={`/catalog/${_class.year}/${_class.semester}/${_class.subject}/${_class.courseNumber}/${_class.number}`}
                        >
                          <Expand />
                        </IconButton>
                      </Dialog.Close>
                    </Tooltip>
                  )}
                  <Tooltip content="Close">
                    {dialog ? (
                      <Dialog.Close asChild>
                        <IconButton>
                          <Xmark />
                        </IconButton>
                      </Dialog.Close>
                    ) : (
                      <IconButton
                        as={Link}
                        to={{
                          ...location,
                          pathname: `/catalog/${_class.year}/${_class.semester}`,
                        }}
                        onClick={() => onClose()}
                      >
                        <Xmark />
                      </IconButton>
                    )}
                  </Tooltip>
                </Flex>
              </Flex>
              <Flex direction="column" gap="4">
                <Flex direction="column" gap="1">
                  <h1 className={styles.heading}>
                    {_class.subject} {_class.courseNumber} #{_class.number}
                  </h1>
                  <p className={styles.description}>
                    {_class.title || _class.course.title}
                  </p>
                </Flex>
                <Flex gap="3" align="center">
                  <AverageGrade
                    gradeDistribution={_class.course.gradeDistribution}
                  />
                  <Capacity
                    enrolledCount={
                      _class.primarySection.enrollment?.latest.enrolledCount
                    }
                    maxEnroll={
                      _class.primarySection.enrollment?.latest.maxEnroll
                    }
                    waitlistedCount={
                      _class.primarySection.enrollment?.latest.waitlistedCount
                    }
                    maxWaitlist={
                      _class.primarySection.enrollment?.latest.maxWaitlist
                    }
                  />
                  <Units
                    unitsMax={_class.unitsMax}
                    unitsMin={_class.unitsMin}
                  />
                  {_class && (
                    <CCN sectionId={_class.primarySection.sectionId} />
                  )}
                </Flex>
              </Flex>
              {dialog ? (
                <Tabs.List asChild defaultValue="overview">
                  <Flex mx="-3" mb="3">
                    <Tabs.Trigger value="overview" asChild>
                      <MenuItem>Overview</MenuItem>
                    </Tabs.Trigger>
                    <Tabs.Trigger value="sections" asChild>
                      <MenuItem>Sections</MenuItem>
                    </Tabs.Trigger>
                    {/* <Tabs.Trigger value="enrollment" asChild>
                      <MenuItem>Enrollment</MenuItem>
                    </Tabs.Trigger>
                    <Tabs.Trigger value="grades" asChild>
                      <MenuItem>Grades</MenuItem>
                    </Tabs.Trigger>
                    */}
                    <NavLink
                      to={`/catalog/${_class.year}/${_class.semester}/${_class.subject}/${_class.courseNumber}/${_class.number}/ratings`}
                    >
                      <MenuItem styl>
                        Ratings
                        {ratingsCount ? (
                          <div className={styles.badge}>{ratingsCount}</div>
                        ) : (
                          <div className={styles.dot}></div>
                        )}
                      </MenuItem>
                    </NavLink>
                    <Tabs.Trigger value="discussion" asChild>
                      <MenuItem>Discussion</MenuItem>
                    </Tabs.Trigger>
                  </Flex>
                </Tabs.List>
              ) : (
                <Flex mx="-3" mb="3">
                  <NavLink to={{ ...location, pathname: "." }} end>
                    {({ isActive }) => (
                      <MenuItem active={isActive}>Overview</MenuItem>
                    )}
                  </NavLink>
                  <NavLink to={{ ...location, pathname: "sections" }}>
                    {({ isActive }) => (
                      <MenuItem active={isActive}>Sections</MenuItem>
                    )}
                  </NavLink>
                  {/* <NavLink to={{ ...location, pathname: "enrollment" }}>
                    {({ isActive }) => (
                      <MenuItem active={isActive}>Enrollment</MenuItem>
                    )}
                  </NavLink>
                  <NavLink to={{ ...location, pathname: "grades" }}>
                    {({ isActive }) => (
                      <MenuItem active={isActive}>Grades</MenuItem>
                    )}
                  </NavLink>
                  */}
                  <NavLink to={{ ...location, pathname: "ratings" }}>
                    {({ isActive }) => (
                      <MenuItem active={isActive}>
                        Ratings
                        {ratingsCount ? (
                          <div className={styles.badge}>{ratingsCount}</div>
                        ) : (
                          <div className={styles.dot}></div>
                        )}
                      </MenuItem>
                    )}
                  </NavLink>
                  <NavLink to={{ ...location, pathname: "discussion" }}>
                    {({ isActive }) => (
                      <MenuItem active={isActive}>Discussion</MenuItem>
                    )}
                  </NavLink>
                </Flex>
              )}
            </Flex>
          </Container>
        </Box>
        <ClassContext
          value={{
            class: _class,
            course,
          }}
        >
          <Body dialog={dialog}>
            <Tabs.Content value="overview" asChild>
              <SuspenseBoundary>
                <Overview />
              </SuspenseBoundary>
            </Tabs.Content>
            <Tabs.Content value="sections" asChild>
              <SuspenseBoundary>
                <Sections />
              </SuspenseBoundary>
            </Tabs.Content>
            <Tabs.Content value="enrollment" asChild>
              <SuspenseBoundary>
                <Enrollment />
              </SuspenseBoundary>
            </Tabs.Content>
            <Tabs.Content value="grades" asChild>
              <SuspenseBoundary>
                <Grades />
              </SuspenseBoundary>
            </Tabs.Content>
            <Tabs.Content value="ratings" asChild>
              <SuspenseBoundary>
                <Ratings />
              </SuspenseBoundary>
            </Tabs.Content>
            <Tabs.Content value="discussion" asChild>
              <SuspenseBoundary>
                <Discussion />
              </SuspenseBoundary>
            </Tabs.Content>
          </Body>
        </ClassContext>
      </Flex>
    </Root>
  );
}
