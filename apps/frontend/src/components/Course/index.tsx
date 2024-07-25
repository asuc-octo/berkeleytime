import { ReactNode, Suspense, useMemo, useState } from "react";

import { useQuery } from "@apollo/client";
import { DialogClose } from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import classNames from "classnames";
import { Bookmark, BookmarkSolid, CalendarPlus, Xmark } from "iconoir-react";
import { NavLink, Outlet, useSearchParams } from "react-router-dom";

import AverageGrade from "@/components/AverageGrade";
import Boundary from "@/components/Boundary";
import Container from "@/components/Container";
import IconButton from "@/components/IconButton";
import LoadingIndicator from "@/components/LoadingIndicator";
import MenuItem from "@/components/MenuItem";
import Tooltip from "@/components/Tooltip";
import { GET_COURSE, GetCourseResponse, ICourse } from "@/lib/api";

import styles from "./Class.module.scss";
import Classes from "./Classes";
import Enrollment from "./Enrollment";
import Grades from "./Grades";
import Overview from "./Overview";
import ClassContext from "./context";

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

interface CourseProps {
  subject: string;
  number: string;
  partialCourse?: ICourse | null;
  dialog?: boolean;
}

export default function Course({
  subject,
  number,
  partialCourse,
  dialog,
}: CourseProps) {
  const [searchParams] = useSearchParams();
  const [bookmarked, setBookmarked] = useState(false);

  const { data, loading } = useQuery<GetCourseResponse>(GET_COURSE, {
    variables: {
      subject,
      number,
    },
  });

  // TODO: Properly type a partial ICourse
  const course = useMemo(
    () => (data?.course ?? partialCourse) as ICourse,
    [data]
  );

  const search = useMemo(() => searchParams.toString(), [searchParams]);

  return (
    <Root dialog={dialog}>
      <div className={styles.header}>
        <Container size="small">
          <div className={styles.row}>
            <div className={styles.group}>
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
            </div>
            <div className={styles.group}>
              {/* <Tooltip content="Berkeley Academic Guide">
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
              </Tooltip> */}
              {dialog && (
                <Tooltip content="Close">
                  <DialogClose asChild>
                    <IconButton>
                      <Xmark />
                    </IconButton>
                  </DialogClose>
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
              <MenuItem as={NavLink} to={{ pathname: ".", search }} end>
                Overview
              </MenuItem>
              <MenuItem as={NavLink} to={{ pathname: "classes", search }}>
                Classes
              </MenuItem>
              <MenuItem as={NavLink} to={{ pathname: "enrollment", search }}>
                Enrollment
              </MenuItem>
              <MenuItem as={NavLink} to={{ pathname: "grades", search }}>
                Grades
              </MenuItem>
            </div>
          )}
        </Container>
      </div>
      <Container size="small">
        {data ? (
          <ClassContext.Provider
            value={{
              subject,
              number,
              partialCourse,
              dialog,
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
          </ClassContext.Provider>
        ) : loading ? (
          <>{/* TODO: Loading */}</>
        ) : (
          <>{/* TODO: Error */}</>
        )}
      </Container>
    </Root>
  );
}
