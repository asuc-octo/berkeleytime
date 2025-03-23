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

import AverageGrade from "@/components/AverageGrade";
import CCN from "@/components/CCN";
import Capacity from "@/components/Capacity";
import CourseDrawer from "@/components/CourseDrawer";
import Units from "@/components/Units";
import ClassContext from "@/contexts/ClassContext";
import { ClassPin } from "@/contexts/PinsContext";
import { useReadCourse, useReadUser, useUpdateUser } from "@/hooks/api";
import { useReadClass } from "@/hooks/api/classes/useReadClass";
import usePins from "@/hooks/usePins";
import { IAggregatedRatings, IClass, Semester } from "@/lib/api";
import { addRecentClass } from "@/lib/recent";
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

  const { data: _class, loading } = useReadClass(
    year as number,
    semester as Semester,
    subject as string,
    courseNumber as string,
    number as string,
    {
      skip: !!providedClass,
    }
  );

  const _classData = useMemo(() => providedClass ?? _class, [_class, providedClass]);

  const bookmarked = useMemo(
    () =>
      user?.bookmarkedClasses.some(
        (bookmarkedClass) =>
          bookmarkedClass.subject === _classData?.subject &&
          bookmarkedClass.courseNumber === _classData?.courseNumber &&
          bookmarkedClass.number === _classData?.number &&
          bookmarkedClass.year === _classData?.year &&
          bookmarkedClass.semester === _classData?.semester
      ),
    [user, _classData]
  );

  const pin = useMemo(() => {
    if (!_classData) return;

    const { year, semester, subject, courseNumber, number } = _classData;

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
  }, [_classData]);

  // const pinned = useMemo(() => pins.some((p) => p.id === pin?.id), [pins, pin]);

  const bookmark = useCallback(async () => {
    if (!user || !_classData) return;

    const bookmarkedClasses = bookmarked
      ? user.bookmarkedClasses.filter(
          (bookmarkedClass) =>
            !(
              bookmarkedClass.subject === _classData?.subject &&
              bookmarkedClass.courseNumber === _classData?.courseNumber &&
              bookmarkedClass.number === _classData?.number &&
              bookmarkedClass.year === _classData?.year &&
              bookmarkedClass.semester === _classData?.semester
            )
        )
      : user.bookmarkedClasses.concat(_classData);
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
            bookmarkedClasses,
          },
        },
      }
    );
  }, [_classData, bookmarked, updateUser, user]);

  useEffect(() => {
    if (!_classData) return;

    addRecentClass({
      subject: _classData.subject,
      year: _classData.year,
      semester: _classData.semester,
      courseNumber: _classData.courseNumber,
      number: _classData.number,
    });
  }, [_classData]);

  const ratingsCount = useMemo(() => {
    if (!_classData?.course?.aggregatedRatings?.metrics) {
      return 0;
    }
    return _classData.course.aggregatedRatings.metrics.reduce(
      (max: number, metric: IAggregatedRatings["metrics"][number]) =>
        Math.max(max, metric.count),
      0
    );
  }, [_classData?.course?.aggregatedRatings?.metrics]);

  // TODO: Loading state
  if (loading || courseLoading) {
    return null;
  }

  if (!_classData || !course) {
    return null;
  }

  return (
    <Root dialog={dialog}>
      <Box className={styles.root}>
        <Box className={classNames(styles.header, { [styles.expanded]: expanded })}>
          <Container>
            <Flex justify="between" align="center">
              <Flex gap="sm">
                <Tooltip content="Expand">
                  <IconButton onClick={() => onExpandedChange(!expanded)}>
                    {expanded ? <SidebarCollapse /> : <SidebarExpand />}
                  </IconButton>
                </Tooltip>
                <Tooltip content="Open in new tab">
                  <IconButton
                    as={Link}
                    to={`/classes/${_classData.year}/${_classData.semester}/${_classData.subject}/${_classData.courseNumber}/${_classData.number}`}
                  >
                    <OpenNewWindow />
                  </IconButton>
                </Tooltip>
                <Tooltip content="Add to schedule">
                  <IconButton as={Link} to={`/schedules/add/${_classData._id}`}>
                    <CalendarPlus />
                  </IconButton>
                </Tooltip>
                <Tooltip content={bookmarked ? "Remove bookmark" : "Bookmark"}>
                  <IconButton onClick={() => bookmark()}>
                    {bookmarked ? <BookmarkSolid /> : <Bookmark />}
                  </IconButton>
                </Tooltip>
                <Tooltip content="View on Berkeley Academic Guide">
                  <IconButton
                    as="a"
                    href={getExternalLink(_classData)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <OpenBook />
                  </IconButton>
                </Tooltip>
              </Flex>
              <Flex gap="sm">
                {dialog ? (
                  <Dialog.Close asChild>
                    <Tooltip content="Close">
                      <IconButton>
                        <Xmark />
                      </IconButton>
                    </Tooltip>
                  </Dialog.Close>
                ) : (
                  <Tooltip content="Close">
                    <IconButton
                      as={Link}
                      to={{
                        ...location,
                        pathname: `/catalog/${_classData.year}/${_classData.semester}`,
                      }}
                      onClick={() => onClose()}
                    >
                      <Xmark />
                    </IconButton>
                  </Tooltip>
                )}
              </Flex>
            </Flex>
            <h1 className={styles.heading}>
              {_classData.subject} {_classData.courseNumber} #{_classData.number}
            </h1>
            <p className={styles.description}>
              {_classData.title || _classData.course.title}
            </p>
            <div className={styles.group}>
              <AverageGrade gradeDistribution={_classData.course.gradeDistribution} />
              <Capacity
                enrollCount={_classData.primarySection.enrollCount}
                enrollMax={_classData.primarySection.enrollMax}
                waitlistCount={_classData.primarySection.waitlistCount}
                waitlistMax={_classData.primarySection.waitlistMax}
              />
              <Units unitsMax={_classData.unitsMax} unitsMin={_classData.unitsMin} />
              {_classData && <CCN ccn={_classData.primarySection.ccn} />}
            </div>
            {dialog ? (
              <Tabs.List className={styles.menu}>
                <Flex gap="md">
                  <Tabs.Trigger value="overview" asChild>
                    <MenuItem>Overview</MenuItem>
                  </Tabs.Trigger>
                  <Tabs.Trigger value="sections" asChild>
                    <MenuItem>Sections</MenuItem>
                  </Tabs.Trigger>
                  <Tabs.Trigger value="enrollment" asChild>
                    <MenuItem>Enrollment</MenuItem>
                  </Tabs.Trigger>
                  <Tabs.Trigger value="grades" asChild>
                    <MenuItem>Grades</MenuItem>
                  </Tabs.Trigger>
                  <Tabs.Trigger value="ratings" asChild>
                    <MenuItem>
                      Ratings
                      {ratingsCount > 0 && (
                        <span className={styles.badge}>{ratingsCount}</span>
                      )}
                    </MenuItem>
                  </Tabs.Trigger>
                </Flex>
              </Tabs.List>
            ) : (
              <Flex gap="md" className={styles.menu}>
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
                <NavLink to={{ ...location, pathname: "enrollment" }}>
                  {({ isActive }) => (
                    <MenuItem active={isActive}>Enrollment</MenuItem>
                  )}
                </NavLink>
                <NavLink to={{ ...location, pathname: "grades" }}>
                  {({ isActive }) => (
                    <MenuItem active={isActive}>Grades</MenuItem>
                  )}
                </NavLink>
                <NavLink to={{ pathname: "ratings" }}>
                  {({ isActive }) => (
                    <MenuItem active={isActive}>
                      Ratings
                      {ratingsCount > 0 && (
                        <span className={styles.badge}>{ratingsCount}</span>
                      )}
                    </MenuItem>
                  )}
                </NavLink>
              </Flex>
            )}
          </Container>
        </Box>
        <ClassContext.Provider
          value={{
            class: _classData,
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
          </Body>
        </ClassContext.Provider>
      </Box>
    </Root>
  );
}
