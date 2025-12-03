import { ReactNode, lazy, useMemo } from "react";

import {
  Expand,
  GridPlus,
  Link as LinkIcon,
  ShareIos,
  Xmark,
} from "iconoir-react";
import { Tabs } from "radix-ui";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

import {
  Box,
  Container,
  Dialog,
  Flex,
  IconButton,
  MenuItem,
  Tooltip,
} from "@repo/theme";

import { AverageGrade } from "@/components/AverageGrade";
import CourseContext from "@/contexts/CourseContext";
import { CoursePin } from "@/contexts/PinsContext";
import { useReadCourse } from "@/hooks/api";
import { ICourse } from "@/lib/api";

import SuspenseBoundary from "../SuspenseBoundary";
import styles from "./Course.module.scss";

const Classes = lazy(() => import("./Classes"));
const Enrollment = lazy(() => import("./Enrollment"));
const Grades = lazy(() => import("./Grades"));
const Overview = lazy(() => import("./Overview"));

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
  // const { pins, addPin, removePin } = usePins();

  const location = useLocation();

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

  // const pinned = useMemo(() => {
  //   if (!input) return;

  //   return pins.find(
  //     (pin) =>
  //       pin.type === "course" &&
  //       pin.data.subject === input.subject &&
  //       pin.data.number === input.number
  //   );
  // }, [input, pins]);

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
  if (!course || !pin) {
    return <></>;
  }

  // TODO: Differentiate between class and course
  return (
    <Root dialog={dialog}>
      <Flex direction="column" flexGrow="1" height="100vh" minHeight="0">
        <Box className={styles.header} px="5" pt="5" flexShrink="0">
          <Container size="3">
            <Flex direction="column" gap="5">
              <Flex justify="between">
                <Flex gap="3">
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
                  <Tooltip content="Add to plan">
                    <IconButton>
                      <GridPlus />
                    </IconButton>
                  </Tooltip>
                </Flex>
                <Flex gap="3">
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
                      <IconButton
                        as={Link}
                        to={`/courses/${subject}/${number}`}
                      >
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
                </Flex>
              </Flex>
              <Flex direction="column" gap="4">
                <Flex direction="column" gap="1">
                  <h1 className={styles.heading}>
                    {subject} {number}
                  </h1>
                  <p className={styles.description}>{course.title}</p>
                </Flex>
                <Flex gap="3" align="center">
                  <AverageGrade gradeDistribution={course.gradeDistribution} />
                </Flex>
              </Flex>
              {dialog ? (
                <Tabs.List asChild defaultValue="overview">
                  <Flex mx="-3" mb="3">
                    <Tabs.Trigger value="overview" asChild>
                      <MenuItem>Overview</MenuItem>
                    </Tabs.Trigger>
                    <Tabs.Trigger value="classes" asChild>
                      <MenuItem>Classes</MenuItem>
                    </Tabs.Trigger>
                    {/* <Tabs.Trigger value="enrollment" asChild>
                      <MenuItem>Enrollment</MenuItem>
                    </Tabs.Trigger>
                    <Tabs.Trigger value="grades" asChild>
                      <MenuItem>Grades</MenuItem>
                    </Tabs.Trigger> */}
                  </Flex>
                </Tabs.List>
              ) : (
                <Flex mx="-3" mb="3">
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
                  {/* <NavLink to={{ ...location, pathname: "enrollment" }}>
                    {({ isActive }) => (
                      <MenuItem active={isActive}>Enrollment</MenuItem>
                    )}
                  </NavLink>
                  <NavLink to={{ ...location, pathname: "grades" }}>
                    {({ isActive }) => (
                      <MenuItem active={isActive}>Grades</MenuItem>
                    )}
                  </NavLink> */}
                </Flex>
              )}
            </Flex>
          </Container>
        </Box>
        <CourseContext
          value={{
            course,
          }}
        >
          <Box flexGrow="1" minHeight="0" overflow="auto">
            <Body dialog={dialog}>
              <Tabs.Content value="overview" asChild>
                <SuspenseBoundary>
                  <Overview />
                </SuspenseBoundary>
              </Tabs.Content>
              <Tabs.Content value="classes" asChild>
                <SuspenseBoundary>
                  <Classes />
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
            </Body>
          </Box>
        </CourseContext>
      </Flex>
    </Root>
  );
}
