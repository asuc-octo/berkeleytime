import { ReactNode, Suspense, useMemo, useState } from "react";

import * as Tabs from "@radix-ui/react-tabs";
import classNames from "classnames";
import {
  Bookmark,
  BookmarkSolid,
  Expand,
  GridPlus,
  Link as LinkIcon,
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
import { useReadCourse } from "@/hooks/api";
import { ICourse } from "@/lib/api";

import styles from "./Class.module.scss";
import Classes from "./Classes";
import Enrollment from "./Enrollment";
import Grades from "./Grades";
import Overview from "./Overview";

interface BodyProps {
  children: ReactNode;
  dialog?: boolean;
}

function Body({ children, dialog }: BodyProps) {
  return dialog ? (
    children
  ) : (
    <Suspense
      fallback={
        <Boundary>
          <LoadingIndicator />
        </Boundary>
      }
    >
      <Outlet />
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
  const location = useLocation();

  // TODO: Bookmarks
  const [bookmarked, setBookmarked] = useState(false);

  const { data, loading } = useReadCourse(subject as string, number as string, {
    // Allow course to be provided
    skip: !!providedCourse,
  });

  const course = useMemo(() => providedCourse ?? data, [providedCourse, data]);

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
  if (!course) {
    return <></>;
  }

  // TODO: Differentiate between class and course
  return (
    <Root dialog={dialog}>
      <div className={styles.header}>
        <Container size="sm">
          <div className={styles.row}>
            <div className={styles.group}>
              <Tooltip content={bookmarked ? "Remove bookmark" : "Bookmark"}>
                <IconButton
                  className={classNames(styles.bookmark, {
                    [styles.active]: bookmarked,
                  })}
                  onClick={() => setBookmarked(!bookmarked)}
                >
                  {bookmarked ? <BookmarkSolid /> : <Bookmark />}
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
            <AverageGrade gradeAverage={course.gradeAverage} />
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
        <CourseContext.Provider
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
        </CourseContext.Provider>
      </Container>
    </Root>
  );
}
