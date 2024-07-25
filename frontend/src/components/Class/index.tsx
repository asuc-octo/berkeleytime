import { ReactNode, Suspense, useMemo, useState } from "react";

import { useQuery } from "@apollo/client";
import { DialogClose } from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import classNames from "classnames";
import {
  Bookmark,
  BookmarkSolid,
  CalendarPlus,
  Collapse,
  Expand,
  OpenInWindow,
  OpenNewWindow,
  Xmark,
} from "iconoir-react";
import { Link, NavLink, Outlet, useSearchParams } from "react-router-dom";

import AverageGrade from "@/components/AverageGrade";
import Boundary from "@/components/Boundary";
import CCN from "@/components/CCN";
import Capacity from "@/components/Capacity";
import Container from "@/components/Container";
import CourseDrawer from "@/components/CourseDrawer";
import IconButton from "@/components/IconButton";
import LoadingIndicator from "@/components/LoadingIndicator";
import MenuItem from "@/components/MenuItem";
import Tooltip from "@/components/Tooltip";
import Units from "@/components/Units";
import { GET_CLASS, GetClassResponse, IClass, Semester } from "@/lib/api";
import { getExternalLink } from "@/lib/section";

import styles from "./Class.module.scss";
import Enrollment from "./Enrollment";
import Grades from "./Grades";
import Overview from "./Overview";
import Sections from "./Sections";
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

interface BaseClassProps {
  year: number;
  semester: Semester;
  subject: string;
  courseNumber: string;
  classNumber: string;
  partialClass?: IClass | null;
}

interface CatalogClassProps extends BaseClassProps {
  dialog?: never;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  onClose: () => void;
}

interface DialogClassProps extends BaseClassProps {
  dialog: true;
  expanded?: never;
  onExpandedChange?: never;
  onClose?: never;
}

type ClassProps = CatalogClassProps | DialogClassProps;

export default function Class({
  year,
  semester,
  subject,
  courseNumber,
  classNumber,
  partialClass,
  expanded,
  onExpandedChange,
  onClose,
  dialog,
}: ClassProps) {
  const [searchParams] = useSearchParams();
  const [bookmarked, setBookmarked] = useState(false);

  const { data, loading } = useQuery<GetClassResponse>(GET_CLASS, {
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

  // TODO: Properly type a partial IClass
  const _class = useMemo(() => (data?.class ?? partialClass) as IClass, [data]);

  const search = useMemo(() => searchParams.toString(), [searchParams]);

  return (
    <Root dialog={dialog}>
      <div className={styles.header}>
        <Container size="small">
          <div className={styles.row}>
            <div className={styles.group}>
              {!dialog && (
                <Tooltip content={expanded ? "Expand" : "Collapse"}>
                  <IconButton onClick={() => onExpandedChange(!expanded)}>
                    {expanded ? <Expand /> : <Collapse />}
                  </IconButton>
                </Tooltip>
              )}
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
              <CourseDrawer subject={subject} number={courseNumber}>
                <Tooltip content="Open course">
                  <IconButton>
                    <OpenInWindow />
                  </IconButton>
                </Tooltip>
              </CourseDrawer>
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
                      pathname: `/catalog/${year}/${semester}`,
                      search: searchParams.toString(),
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
            {subject} {courseNumber} #{classNumber}
          </h1>
          <p className={styles.description}>
            {_class.title || _class.course.title}
          </p>
          <div className={styles.group}>
            <AverageGrade gradeAverage={_class.course.gradeAverage} />
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
            </Tabs.List>
          ) : (
            <div className={styles.menu}>
              <MenuItem as={NavLink} to={{ pathname: ".", search }} end>
                Overview
              </MenuItem>
              <MenuItem as={NavLink} to={{ pathname: "sections", search }}>
                Sections
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
              year,
              semester,
              subject,
              courseNumber,
              classNumber,
              partialClass,
              dialog,
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
