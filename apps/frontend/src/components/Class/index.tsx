import { ReactNode, lazy, useCallback, useEffect, useMemo } from "react";

import classNames from "classnames";
import {
  Bookmark,
  BookmarkSolid,
  CalendarPlus,
  OpenNewWindow,
  Xmark,
} from "iconoir-react";
import { Tabs } from "radix-ui";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Boundary,
  Box,
  Container,
  Flex,
  IconButton,
  LoadingIndicator,
  MenuItem,
  Tooltip,
} from "@repo/theme";

import { AverageGrade } from "@/components/AverageGrade";
import CCN from "@/components/CCN";
import EnrollmentDisplay from "@/components/EnrollmentDisplay";
import Units from "@/components/Units";
import ClassContext from "@/contexts/ClassContext";
import { ClassPin } from "@/contexts/PinsContext";
import { useReadCourseForClass, useUpdateUser } from "@/hooks/api";
import { useReadClass } from "@/hooks/api/classes/useReadClass";
import useUser from "@/hooks/useUser";
import { IClass, ICourse, Semester } from "@/lib/api";
import { RecentType, addRecent } from "@/lib/recent";
import { getExternalLink } from "@/lib/section";

import SuspenseBoundary from "../SuspenseBoundary";
import styles from "./Class.module.scss";

const Enrollment = lazy(() => import("./Enrollment"));
const Grades = lazy(() => import("./Grades"));
const Overview = lazy(() => import("./Overview"));
const Sections = lazy(() => import("./Sections"));
const Ratings = lazy(() => import("./Ratings"));

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
  course?: ICourse;
  year?: never;
  semester?: never;
  subject?: never;
  courseNumber?: never;
  number?: never;
}

interface UncontrolledProps {
  class?: never;
  course?: never;
  year: number;
  semester: Semester;
  subject: string;
  courseNumber: string;
  number: string;
}

interface CatalogClassProps {
  dialog?: never;
  onClose: () => void;
}

interface DialogClassProps {
  dialog: true;
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
  course: providedCourse,
  onClose,
  dialog,
}: ClassProps) {
  // const { pins, addPin, removePin } = usePins();
  const location = useLocation();
  const navigate = useNavigate();

  const { user, loading: userLoading } = useUser();

  const [updateUser] = useUpdateUser();

  const { data: course, loading: courseLoading } = useReadCourseForClass(
    providedClass?.subject ?? (subject as string),
    providedClass?.courseNumber ?? (courseNumber as string),
    {
      skip: !!providedCourse,
    }
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

  const _course = useMemo(
    () => providedCourse ?? course,
    [course, providedCourse]
  );

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
      _course &&
      _course.aggregatedRatings &&
      _course.aggregatedRatings.metrics.length > 0 &&
      Math.max(
        ...Object.values(_course.aggregatedRatings.metrics.map((v) => v.count))
      )
    );
  }, [_course]);

  // seat reservation logic pending design + consideration for performance.
  // const seatReservationTypeMap = useMemo(() => {
  //   const reservationTypes =
  //     _class?.primarySection.enrollment?.seatReservationTypes ?? [];

  //   const reservationMap = new Map<number, string>();
  //   for (const type of reservationTypes) {
  //     reservationMap.set(type.number, type.requirementGroup);
  //   }
  //   return reservationMap;
  // }, [_class]);

  // const seatReservationMaxEnroll = useMemo(() => {
  //   const maxEnroll =
  //     _class?.primarySection.enrollment?.history[0].seatReservationCount ?? [];
  //   const maxEnrollMap = new Map<number, number>();

  //   for (const type of maxEnroll) {
  //     maxEnrollMap.set(type.number, type.maxEnroll);
  //   }
  //   return maxEnrollMap;
  // }, [_class]);

  // const seatReservationCount =
  //   _class?.primarySection.enrollment?.latest?.seatReservationCount ?? [];

  const courseGradeDistribution = _class?.course.gradeDistribution;

  const hasCourseGradeSummary = useMemo(() => {
    if (!courseGradeDistribution) return false;

    const average = courseGradeDistribution.average;
    if (typeof average === "number" && Number.isFinite(average)) {
      return true;
    }

    return courseGradeDistribution.distribution?.some((grade) => {
      const count = grade.count ?? 0;
      const percentage = grade.percentage ?? 0;
      return count > 0 || percentage > 0;
    });
  }, [courseGradeDistribution]);

  const handleClose = useCallback(() => {
    if (!_class) return;

    navigate(`/catalog/${_class.year}/${_class.semester}`);

    if (onClose) {
      onClose();
    }
  }, [_class, navigate, onClose]);

  if (loading || courseLoading) {
    return (
      <Boundary>
        <LoadingIndicator size="lg" />
      </Boundary>
    );
  }

  // TODO: Error state
  if (!_course || !_class || !pin) {
    return <></>;
  }

  return (
    <Root dialog={dialog}>
      <Flex direction="column" flexGrow="1" className={styles.root}>
        <Box className={styles.header} pt="5" px="5">
          <Container size="3">
            <Flex direction="column" gap="5">
              <Flex justify="between" align="start">
                <Flex gap="3">
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
                  <Tooltip content="Open in Berkeley Catalog">
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
                      rel="noopener noreferrer"
                    >
                      <OpenNewWindow />
                    </IconButton>
                  </Tooltip>
                  {onClose && (
                    <Tooltip content="Close">
                      <IconButton onClick={handleClose}>
                        <Xmark />
                      </IconButton>
                    </Tooltip>
                  )}
                </Flex>
              </Flex>
              <Flex direction="column" gap="4">
                <Flex direction="column" gap="1">
                  <h1 className={styles.heading}>
                    {_class.subject} {_class.courseNumber}{" "}
                    <span className={styles.sectionNumber}>
                      #{_class.number}
                    </span>
                  </h1>
                  <p className={styles.description}>
                    {_class.title || _class.course.title}
                  </p>
                </Flex>
                <Flex gap="3" align="center">
                  {hasCourseGradeSummary && (
                    <Link
                      to={`/grades?input=${encodeURIComponent(
                        `${_class.subject};${_class.courseNumber}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        textDecoration: "none",
                      }}
                    >
                      <AverageGrade
                        gradeDistribution={_class.course.gradeDistribution}
                      />
                    </Link>
                  )}
                  <EnrollmentDisplay
                    enrolledCount={
                      _class.primarySection.enrollment?.latest.enrolledCount
                    }
                    maxEnroll={
                      _class.primarySection.enrollment?.latest.maxEnroll
                    }
                    time={_class.primarySection.enrollment?.latest.endTime}
                  >
                    {(content) => (
                      <Link
                        to={`/enrollment?input=${encodeURIComponent(
                          `${_class.subject};${_class.courseNumber};T;${_class.year}:${_class.semester};${_class.number}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          textDecoration: "none",
                        }}
                      >
                        {content}
                      </Link>
                    )}
                  </EnrollmentDisplay>
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
                    <Tabs.Trigger value="grades" asChild>
                      <MenuItem>Grades</MenuItem>
                    </Tabs.Trigger>
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
                  <NavLink to={{ ...location, pathname: "grades" }}>
                    {({ isActive }) => (
                      <MenuItem active={isActive}>Grades</MenuItem>
                    )}
                  </NavLink>
                  {/* <NavLink to={{ ...location, pathname: "enrollment" }}>
                    {({ isActive }) => (
                      <MenuItem active={isActive}>Enrollment</MenuItem>
                    )}
                  </NavLink> */}
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
                </Flex>
              )}
            </Flex>
          </Container>
        </Box>
        <ClassContext
          value={{
            class: _class,
            course: _course,
          }}
        >
          <Body dialog={dialog}>
            {dialog && (
              <>
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
              </>
            )}
          </Body>
        </ClassContext>
      </Flex>
    </Root>
  );
}
