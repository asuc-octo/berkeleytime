import {
  ReactNode,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useMutation, useQuery } from "@apollo/client/react";
import classNames from "classnames";
import {
  Bookmark,
  BookmarkSolid,
  InfoCircle,
  OpenNewWindow,
} from "iconoir-react";
import { Tabs } from "radix-ui";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { MetricName, REQUIRED_METRICS } from "@repo/shared";
import { USER_REQUIRED_RATINGS_TO_UNLOCK } from "@repo/shared";
import {
  Badge,
  Box,
  Color,
  Container,
  Flex,
  IconButton,
  MenuItem,
  Tooltip as ThemeTooltip,
} from "@repo/theme";

import { AverageGrade } from "@/components/AverageGrade";
import CCN from "@/components/CCN";
import EnrollmentDisplay from "@/components/EnrollmentDisplay";
import Units from "@/components/Units";
import ClassContext from "@/contexts/ClassContext";
import { useReadCourseForClass, useUpdateUser } from "@/hooks/api";
import { useReadClass } from "@/hooks/api/classes/useReadClass";
import useUser from "@/hooks/useUser";
import { IClass, IClassCourse, signIn } from "@/lib/api";
import {
  CreateRatingDocument,
  GetUserRatingsDocument,
  Semester,
} from "@/lib/generated/graphql";
import { RecentType, addRecent } from "@/lib/recent";
import { getExternalLink } from "@/lib/section";

import SuspenseBoundary from "../SuspenseBoundary";
import styles from "./Class.module.scss";
import UnlockRatingsModal from "./Ratings/UnlockRatingsModal";
import { MetricData } from "./Ratings/metricsUtil";
import { type RatingsTabClasses, RatingsTabLink } from "./locks";

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
  course?: IClassCourse;
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

// TODO: Determine whether a controlled input is even necessary
type ClassProps = { dialog?: boolean } & (ControlledProps | UncontrolledProps);

const ratingsTabClasses: RatingsTabClasses = {
  badge: styles.badge,
  dot: styles.dot,
  tooltipArrow: styles.tooltipArrow,
  tooltipContent: styles.tooltipContent,
  tooltipDescription: styles.tooltipDescription,
  tooltipTitle: styles.tooltipTitle,
};

const METRIC_NAMES = Object.values(MetricName) as MetricName[];

const formatClassNumber = (number: string | undefined | null): string => {
  if (!number) return "";
  const num = parseInt(number, 10);
  if (isNaN(num)) return number;
  // If > 99, show as-is. Otherwise pad to 2 digits with leading zeros
  if (num > 99) return num.toString();
  return num.toString().padStart(2, "0");
};

export default function Class({
  year,
  semester,
  subject,
  courseNumber,
  number,
  class: providedClass,
  course: providedCourse,
  dialog,
}: ClassProps) {
  // const { pins, addPin, removePin } = usePins();
  const location = useLocation();
  const navigate = useNavigate();

  const { user, loading: userLoading } = useUser();

  const { data: userRatingsData } = useQuery(GetUserRatingsDocument, {
    skip: !user,
  });

  const [createUnlockRating] = useMutation(CreateRatingDocument);
  const [updateUser] = useUpdateUser();
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [unlockModalGoalCount, setUnlockModalGoalCount] = useState(0);
  const [isUnlockThankYouOpen, setIsUnlockThankYouOpen] = useState(false);

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
  const primarySection = _class?.primarySection ?? null;

  useEffect(() => {
    if (!_class?.primarySection?.enrollment) return;

    const enrollment = _class.primarySection.enrollment;
    const seatReservationTypes = enrollment.seatReservationTypes ?? [];
    const seatReservationCounts = enrollment.latest?.seatReservationCount ?? [];

    if (seatReservationCounts.length === 0) {
      return;
    }

    const typeMap = new Map<number, string>();
    seatReservationTypes.forEach((type) => {
      typeMap.set(type.number, type.requirementGroup);
    });
  }, [_class]);

  const _course = useMemo(
    () => providedCourse ?? course,
    [course, providedCourse]
  );

  const userRatingsCount = useMemo(
    () => userRatingsData?.userRatings?.classes?.length ?? 0,
    [userRatingsData]
  );

  const userRatedClasses = useMemo(() => {
    const ratedClasses =
      userRatingsData?.userRatings?.classes?.map((cls) => ({
        subject: cls.subject,
        courseNumber: cls.courseNumber,
      })) ?? [];

    const seen = new Set<string>();
    return ratedClasses.filter((cls) => {
      const key = `${cls.subject}-${cls.courseNumber}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [userRatingsData]);

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

  const ratingsCount = useMemo<number | false>(() => {
    const metrics = _course?.aggregatedRatings?.metrics;
    if (!metrics || metrics.length === 0) {
      return false;
    }

    return Math.max(...metrics.map((metric) => metric.count));
  }, [_course]);

  const ratingsLockContext = useMemo(() => {
    if (!user) {
      return {
        requiresLogin: true,
        requiredRatingsCount: USER_REQUIRED_RATINGS_TO_UNLOCK,
      };
    }
    return {
      userRatingsCount,
      requiredRatingsCount: USER_REQUIRED_RATINGS_TO_UNLOCK,
    };
  }, [user, userRatingsCount]);
  const shouldShowRatingsTab = RatingsTabLink.shouldDisplay(ratingsLockContext);
  const ratingsLocked = RatingsTabLink.isLocked(ratingsLockContext);
  const ratingsNeeded = RatingsTabLink.ratingsNeeded(ratingsLockContext) ?? 0;

  useEffect(() => {
    if (dialog || !ratingsLocked) return;
    if (!location.pathname.endsWith("/ratings")) return;

    const redirectPath = location.pathname.replace(/\/ratings$/, "");
    navigate(`${redirectPath}${location.search}${location.hash}`, {
      replace: true,
    });
  }, [dialog, ratingsLocked, location, navigate]);

  const handleLockedTabClick = useCallback(() => {
    if (!ratingsLocked) return;
    if (!user) {
      const redirectPath = window.location.href;
      signIn(redirectPath);
      return;
    }

    const goalCount =
      ratingsNeeded <= 0 ? USER_REQUIRED_RATINGS_TO_UNLOCK : ratingsNeeded;
    setUnlockModalGoalCount(goalCount);
    setIsUnlockModalOpen(true);
    setIsUnlockThankYouOpen(false);
  }, [ratingsLocked, ratingsNeeded, user]);

  const handleUnlockModalClose = useCallback(() => {
    setIsUnlockModalOpen(false);
    setUnlockModalGoalCount(0);
    setIsUnlockThankYouOpen(false);
  }, []);

  const handleUnlockRatingSubmit = useCallback(
    async (
      metricValues: MetricData,
      termInfo: { semester: Semester; year: number },
      classInfo?: { subject: string; courseNumber: string; number: string }
    ) => {
      if (!classInfo) {
        throw new Error("Class information is required to submit a rating.");
      }

      const populatedMetrics = METRIC_NAMES.filter(
        (metric) => typeof metricValues[metric] === "number"
      );
      if (populatedMetrics.length === 0) {
        throw new Error(`No populated metrics`);
      }

      const missingRequiredMetrics = REQUIRED_METRICS.filter(
        (metric) => !populatedMetrics.includes(metric)
      );
      if (missingRequiredMetrics.length > 0) {
        throw new Error(
          `Missing required metrics: ${missingRequiredMetrics.join(", ")}`
        );
      }

      for (let index = 0; index < populatedMetrics.length; index++) {
        const metric = populatedMetrics[index];
        const value = metricValues[metric];
        if (value === undefined) continue;

        const isFinalMutation = index === populatedMetrics.length - 1;
        await createUnlockRating({
          variables: {
            subject: classInfo.subject,
            courseNumber: classInfo.courseNumber,
            semester: termInfo.semester,
            year: termInfo.year,
            classNumber: classInfo.number,
            metricName: metric,
            value,
          },
          refetchQueries: isFinalMutation
            ? [{ query: GetUserRatingsDocument }]
            : undefined,
          awaitRefetchQueries: isFinalMutation,
        });
      }
    },
    [createUnlockRating]
  );

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

    const pnpPercentage = courseGradeDistribution.pnpPercentage;
    if (typeof pnpPercentage === "number" && Number.isFinite(pnpPercentage)) {
      return true;
    }

    return courseGradeDistribution.distribution?.some((grade) => {
      const count = grade.count ?? 0;
      return count > 0;
    });
  }, [courseGradeDistribution]);

  const reservedSeatingMaxCount = useMemo(() => {
    const seatReservationCount =
      _class?.primarySection?.enrollment?.latest?.seatReservationCount ?? [];
    return seatReservationCount.reduce(
      (sum, reservation) => sum + (reservation.maxEnroll ?? 0),
      0
    );
  }, [_class]);

  if (loading || courseLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingHeader} />
        <div className={styles.loadingBody} />
      </div>
    );
  }

  // TODO: Error state
  if (!_course || !_class) {
    return <></>;
  }

  return (
    <>
      <Root dialog={dialog}>
        <Flex direction="column" flexGrow="1" className={styles.root}>
          <Box className={styles.header} pt="5" px="5">
            <Container size="3">
              <Flex direction="column" gap="4">
                <Flex justify="between" align="start" mt="2">
                  <Flex direction="column" gap="2">
                    <h1 className={styles.heading}>
                      {_class.subject} {_class.courseNumber}{" "}
                      <span className={styles.sectionNumber}>
                        #{formatClassNumber(_class.number)}
                      </span>
                    </h1>
                    <p className={styles.description}>
                      {_class.title || _class.course.title}
                    </p>
                  </Flex>
                  <Flex gap="3">
                    {/* TODO: Reusable bookmark button */}
                    <ThemeTooltip
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
                    </ThemeTooltip>
                    <ThemeTooltip content="Open in Berkeley Catalog">
                      <IconButton
                        as="a"
                        href={getExternalLink(_class)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <OpenNewWindow />
                      </IconButton>
                    </ThemeTooltip>
                  </Flex>
                </Flex>
                <Flex gap="3" align="center" mb="5">
                  <EnrollmentDisplay
                    enrolledCount={
                      primarySection?.enrollment?.latest?.enrolledCount
                    }
                    maxEnroll={primarySection?.enrollment?.latest?.maxEnroll}
                    time={primarySection?.enrollment?.latest?.endTime}
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
                  <Units
                    unitsMax={_class.unitsMax}
                    unitsMin={_class.unitsMin}
                  />
                  {primarySection?.sectionId && (
                    <CCN sectionId={primarySection.sectionId} />
                  )}
                  {reservedSeatingMaxCount > 0 && (
                    <Badge
                      label="Reserved Seating"
                      color={Color.Orange}
                      icon={<InfoCircle />}
                    />
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
                    {shouldShowRatingsTab && (
                      <RatingsTabLink
                        dialog
                        classes={ratingsTabClasses}
                        locked={ratingsLocked}
                        onLockedClick={handleLockedTabClick}
                        loginRequired={!user}
                        ratingsNeededValue={ratingsNeeded}
                        ratingsCount={ratingsCount}
                        to={`/catalog/${_class.year}/${_class.semester}/${_class.subject}/${_class.courseNumber}/${_class.number}/ratings`}
                      />
                    )}
                    <Tabs.Trigger value="grades" asChild>
                      <MenuItem>Grades</MenuItem>
                    </Tabs.Trigger>
                    <Tabs.Trigger value="enrollment" asChild>
                      <MenuItem>Enrollment</MenuItem>
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
                  {shouldShowRatingsTab && (
                    <RatingsTabLink
                      classes={ratingsTabClasses}
                      locked={ratingsLocked}
                      onLockedClick={handleLockedTabClick}
                      loginRequired={!user}
                      ratingsNeededValue={ratingsNeeded}
                      ratingsCount={ratingsCount}
                      to={{ ...location, pathname: "ratings" }}
                    />
                  )}
                  <NavLink to={{ ...location, pathname: "grades" }}>
                    {({ isActive }) => (
                      <MenuItem active={isActive}>Grades</MenuItem>
                    )}
                  </NavLink>
                  <NavLink to={{ ...location, pathname: "enrollment" }}>
                    {({ isActive }) => (
                      <MenuItem active={isActive}>Enrollment</MenuItem>
                    )}
                  </NavLink>
                </Flex>
              )}
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
                  <Tabs.Content value="grades" asChild>
                    <SuspenseBoundary>
                      <Grades />
                    </SuspenseBoundary>
                  </Tabs.Content>
                  {!ratingsLocked && (
                    <Tabs.Content value="ratings" asChild>
                      <SuspenseBoundary>
                        <Ratings />
                      </SuspenseBoundary>
                    </Tabs.Content>
                  )}
                  <Tabs.Content value="enrollment" asChild>
                    <SuspenseBoundary>
                      <Enrollment />
                    </SuspenseBoundary>
                  </Tabs.Content>
                </>
              )}
            </Body>
          </ClassContext>
        </Flex>
      </Root>
      {user &&
        ((ratingsLocked && unlockModalGoalCount > 0) ||
          isUnlockModalOpen ||
          isUnlockThankYouOpen) && (
          <UnlockRatingsModal
            isOpen={isUnlockModalOpen}
            onClose={handleUnlockModalClose}
            onSubmit={handleUnlockRatingSubmit}
            userRatedClasses={userRatedClasses}
            requiredRatingsCount={unlockModalGoalCount}
            onSubmitPopupChange={setIsUnlockThankYouOpen}
          />
        )}
    </>
  );
}
