import { ReactNode, Suspense, lazy, useCallback, useMemo } from "react";

import { DialogClose } from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import classNames from "classnames";
import {
  Bookmark,
  BookmarkSolid,
  CalendarPlus,
  OpenBook,
  OpenNewWindow,
  Pin,
  PinSolid,
  SidebarCollapse,
  SidebarExpand,
  Xmark,
} from "iconoir-react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

import {
  Boundary,
  Container,
  IconButton,
  LoadingIndicator,
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
import { IClass, Semester } from "@/lib/api";
import { getExternalLink } from "@/lib/section";

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
  return (
    <Suspense
      fallback={
        <Boundary>
          <LoadingIndicator size="lg" />
        </Boundary>
      }
    >
      <Container size="sm">{dialog ? children : <Outlet />}</Container>
    </Suspense>
  );
}

interface RootProps {
  dialog?: boolean;
  children: ReactNode;
}

function Root({ dialog, children }: RootProps) {
  return dialog ? (
    <Tabs.Root defaultValue="overview" className={styles.root}>
      {children}
    </Tabs.Root>
  ) : (
    <div className={styles.root}>{children}</div>
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
  const { pins, addPin, removePin } = usePins();
  const location = useLocation();

  const { data: user, loading: userLoading } = useReadUser();

  const [updateUser] = useUpdateUser();

  const { data: course, loading: courseLoading } = useReadCourse(
    providedClass?.subject || (subject as string),
    providedClass?.courseNumber || (courseNumber as string)
  );

  const { data, loading } = useReadClass(
    year as number,
    semester as Semester,
    subject as string,
    courseNumber as string,
    number as string,
    {
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

  const pinned = useMemo(() => pins.some((p) => p.id === pin?.id), [pins, pin]);

  const bookmark = useCallback(async () => {
    if (!user || !_class) return;

    const bookmarkedClasses = bookmarked
      ? user.bookmarkedClasses.filter(
          (bookmarkedClass) =>
            bookmarkedClass.subject === _class?.subject &&
            bookmarkedClass.courseNumber === _class?.courseNumber &&
            bookmarkedClass.number === _class?.number &&
            bookmarkedClass.year === _class?.year &&
            bookmarkedClass.semester === _class?.semester
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
  }, [_class, bookmarked, updateUser, user]);

  // TODO: courseAggregatedRatings should be updated on mutations. This also affects userSubmitted section
  function getRatingsCount() {
    if (!_class?.course?.aggregatedRatings?.metrics?.length) {
      return 0;
    }
    return _class.course.aggregatedRatings.metrics.reduce(
      (max: number, metric: any) => Math.max(max, metric.count),
      0
    );
  }

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
      <div className={styles.header}>
        <Container size="sm">
          <div className={styles.row}>
            <div className={styles.group}>
              {!dialog && (
                <Tooltip content={expanded ? "Expand" : "Collapse"}>
                  <IconButton onClick={() => onExpandedChange(!expanded)}>
                    {expanded ? <SidebarCollapse /> : <SidebarExpand />}
                  </IconButton>
                </Tooltip>
              )}
              {/* TODO: Reusable bookmark button */}
              <Tooltip content={bookmarked ? "Remove bookmark" : "Bookmark"}>
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
              {/* TODO: Reusable pin button */}
              <Tooltip content={pinned ? "Remove pin" : "Pin"}>
                <IconButton
                  className={classNames(styles.bookmark, {
                    [styles.active]: pinned,
                  })}
                  onClick={() => (pinned ? removePin(pin) : addPin(pin))}
                >
                  {pinned ? <PinSolid /> : <Pin />}
                </IconButton>
              </Tooltip>
              <Tooltip content="Add to schedule">
                <IconButton>
                  <CalendarPlus />
                </IconButton>
              </Tooltip>
            </div>
            <div className={styles.group}>
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
                  <DialogClose asChild>
                    <IconButton
                      as={Link}
                      to={`/catalog/${_class.year}/${_class.semester}/${_class.subject}/${_class.courseNumber}/${_class.number}`}
                    >
                      <Xmark />
                    </IconButton>
                  </DialogClose>
                </Tooltip>
              )}
              <Tooltip content="Close">
                {dialog ? (
                  <DialogClose asChild>
                    <IconButton>
                      <Xmark />
                    </IconButton>
                  </DialogClose>
                ) : (
                  <IconButton
                    as={Link}
                    to={{
                      ...location,
                      pathname: `/catalog/${year}/${semester}`,
                    }}
                    onClick={() => onClose()}
                  >
                    <Xmark />
                  </IconButton>
                )}
              </Tooltip>
            </div>
          </div>
          <h1 className={styles.heading}>
            {_class.subject} {_class.courseNumber} #{_class.number}
          </h1>
          <p className={styles.description}>
            {_class.title || _class.course.title}
          </p>
          <div className={styles.group}>
            <AverageGrade gradeDistribution={_class.course.gradeDistribution} />
            <Capacity
              enrollCount={_class.primarySection.enrollCount}
              enrollMax={_class.primarySection.enrollMax}
              waitlistCount={_class.primarySection.waitlistCount}
              waitlistMax={_class.primarySection.waitlistMax}
            />
            <Units unitsMax={_class.unitsMax} unitsMin={_class.unitsMin} />
            {_class && <CCN ccn={_class.primarySection.ccn} />}
          </div>
          {dialog ? (
            <Tabs.List className={styles.menu} defaultValue="overview">
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
                  {(() => {
                    const count = getRatingsCount();
                    return (
                      count > 0 && <span className={styles.badge}>{count}</span>
                    );
                  })()}
                </MenuItem>
              </Tabs.Trigger>
            </Tabs.List>
          ) : (
            <div className={styles.menu}>
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
                    {(() => {
                      const count = getRatingsCount();
                      return (
                        count > 0 && (
                          <span className={styles.badge}>{count}</span>
                        )
                      );
                    })()}
                  </MenuItem>
                )}
              </NavLink>
            </div>
          )}
        </Container>
      </div>
      <Container size="sm">
        <ClassContext.Provider
          value={{
            class: _class,
            course,
          }}
        >
          <Body dialog={dialog}>
            <Tabs.Content value="overview" asChild>
              <Overview />
            </Tabs.Content>
            <Tabs.Content value="sections" asChild>
              <Sections />
            </Tabs.Content>
            <Tabs.Content value="enrollment" asChild>
              <Enrollment />
            </Tabs.Content>
            <Tabs.Content value="grades" asChild>
              <Grades />
            </Tabs.Content>
            <Tabs.Content value="ratings" asChild>
              <Ratings />
            </Tabs.Content>
          </Body>
        </ClassContext.Provider>
      </Container>
    </Root>
  );
}
