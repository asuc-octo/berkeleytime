import { ReactNode, Suspense, lazy, useMemo } from "react";

import * as Tabs from "@radix-ui/react-tabs";
import classNames from "classnames";
import {
  Bookmark,
  BookmarkSolid,
  Expand,
  GridPlus,
  Link as LinkIcon,
  Pin,
  PinSolid,
  ShareIos,
  Xmark,
} from "iconoir-react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

import {
  Boundary,
  Container,
  Dialog,
  IconButton,
  LoadingIndicator,
  MenuItem,
  Tooltip,
} from "@repo/theme";

import AverageGrade from "@/components/AverageGrade";
import CourseContext from "@/contexts/CourseContext";
import { CoursePin } from "@/contexts/PinsContext";
import { useReadCourse, useReadUser, useUpdateUser } from "@/hooks/api";
import usePins from "@/hooks/usePins";
import { ICourse } from "@/lib/api";

import styles from "./Class.module.scss";

const Classes = lazy(() => import("./Classes"));
const Enrollment = lazy(() => import("./Enrollment"));
const Grades = lazy(() => import("./Grades"));
const Overview = lazy(() => import("./Overview"));

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
      {dialog ? children : <Outlet />}
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

interface BaseProps {
  dialog?: boolean;
}

interface ControlledProps extends BaseProps {
  course: ICourse;
  subject?: never;
  number?: never;
}

interface UncontrolledProps extends BaseProps {
  course?: never;
  subject: string;
  number: string;
}

export type CourseProps = ControlledProps | UncontrolledProps;

export default function Course({
  subject,
  number,
  dialog,
  course: providedCourse,
}: CourseProps) {
  const { pins, addPin, removePin } = usePins();

  const location = useLocation();

  const { data: user, loading: userLoading } = useReadUser();

  const [updateUser] = useUpdateUser();

  const { data, loading } = useReadCourse(subject as string, number as string, {
    // Allow course to be provided
    skip: !!providedCourse,
  });

  const course = useMemo(() => providedCourse ?? data, [providedCourse, data]);

  const input = useMemo(() => {
    if (!course) return;

    return {
      subject: course.subject,
      number: course.number,
    };
  }, [course]);

  const pin = useMemo(() => {
    if (!input) return;

    return {
      id: `${input.subject}-${input.number}`,
      type: "course",
      data: input,
    } as CoursePin;
  }, [input]);

  const pinned = useMemo(() => {
    if (!input) return;

    return pins.find(
      (pin) =>
        pin.type === "course" &&
        pin.data.subject === input.subject &&
        pin.data.number === input.number
    );
  }, [input, pins]);

  const bookmarked = useMemo(() => {
    if (!user || !input) return;

    return user.bookmarkedCourses.some(
      (course) =>
        course.subject === input.subject && course.number === input.number
    );
  }, [user, input]);

  const context = useMemo(() => {
    if (!course) return;

    return {
      title: `${course.subject} ${course.number}`,
      text: course.title,
      url: `${window.location.origin}/courses/${course.subject}/${course.number}`,
    };
  }, [course]);

  const canShare = useMemo(
    () => context && navigator.canShare && navigator.canShare(context),
    [context]
  );

  const bookmark = async () => {
    if (!user || !course) return;

    const bookmarked = user.bookmarkedCourses.some(
      (course) =>
        course.subject === course.subject && course.number === course.number
    );

    const bookmarkedCourses = bookmarked
      ? user.bookmarkedCourses.filter(
          (course) =>
            course.subject !== course.subject || course.number !== course.number
        )
      : user.bookmarkedCourses.concat(course);

    await updateUser(
      {
        bookmarkedCourses: bookmarkedCourses.map((course) => ({
          subject: course.subject,
          number: course.number,
        })),
      },
      {
        optimisticResponse: {
          updateUser: {
            ...user,
            bookmarkedCourses,
          },
        },
      }
    );
  };

  const share = () => {
    if (!context) return;

    if (canShare) {
      try {
        navigator.share(context);
      } catch {
        // TODO: Handle error
      }

      return;
    }

    try {
      navigator.clipboard.writeText(context.url);
    } catch {
      // TODO: Handle error
    }
  };

  // TODO: Loading state
  if (loading) {
    return <></>;
  }

  // TODO: Error state
  if (!course || !pin) {
    return <></>;
  }

  // TODO: Differentiate between class and course
  return (
    <Root dialog={dialog}>
      <div className={styles.header}>
        <Container size="sm">
          <div className={styles.row}>
            <div className={styles.group}>
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
              <Tooltip content="Add to plan">
                <IconButton>
                  <GridPlus />
                </IconButton>
              </Tooltip>
            </div>
            <div className={styles.group}>
              {canShare ? (
                <Tooltip content="Share">
                  <IconButton onClick={() => share()}>
                    <ShareIos />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip content="Copy link">
                  <IconButton onClick={() => share()}>
                    <LinkIcon />
                  </IconButton>
                </Tooltip>
              )}
              {dialog && (
                <Tooltip content="Expand">
                  <IconButton as={Link} to={`/courses/${subject}/${number}`}>
                    <Expand />
                  </IconButton>
                </Tooltip>
              )}
              {dialog && (
                <Tooltip content="Close">
                  <Dialog.Close asChild>
                    <IconButton>
                      <Xmark />
                    </IconButton>
                  </Dialog.Close>
                </Tooltip>
              )}
            </div>
          </div>
          <h1 className={styles.heading}>
            {subject} {number}
          </h1>
          <p className={styles.description}>{course.title}</p>
          <div className={styles.group}>
            <AverageGrade gradeDistribution={course.gradeDistribution} />
          </div>
          {dialog ? (
            <Tabs.List className={styles.menu} defaultValue="overview">
              <Tabs.Trigger value="overview" asChild>
                <MenuItem>Overview</MenuItem>
              </Tabs.Trigger>
              <Tabs.Trigger value="classes" asChild>
                <MenuItem>Classes</MenuItem>
              </Tabs.Trigger>
              <Tabs.Trigger value="enrollment" asChild>
                <MenuItem>Enrollment</MenuItem>
              </Tabs.Trigger>
              <Tabs.Trigger value="grades" asChild>
                <MenuItem>Grades</MenuItem>
              </Tabs.Trigger>
            </Tabs.List>
          ) : (
            <div className={styles.menu}>
              <NavLink to={{ ...location, pathname: "." }} end>
                {({ isActive }) => (
                  <MenuItem active={isActive}>Overview</MenuItem>
                )}
              </NavLink>
              <NavLink to={{ ...location, pathname: "classes" }}>
                {({ isActive }) => (
                  <MenuItem active={isActive}>Classes</MenuItem>
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
            </div>
          )}
        </Container>
      </div>
      <Container size="sm">
        <CourseContext
          value={{
            course,
          }}
        >
          <Body dialog={dialog}>
            <Tabs.Content value="overview" asChild>
              <Overview />
            </Tabs.Content>
            <Tabs.Content value="classes" asChild>
              <Classes />
            </Tabs.Content>
            <Tabs.Content value="enrollment" asChild>
              <Enrollment />
            </Tabs.Content>
            <Tabs.Content value="grades" asChild>
              <Grades />
            </Tabs.Content>
          </Body>
        </CourseContext>
      </Container>
    </Root>
  );
}
