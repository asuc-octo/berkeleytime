import {
  ReactNode,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useMutation, useQuery } from "@apollo/client/react";
import { OpenNewWindow } from "iconoir-react";
import { Tabs } from "radix-ui";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import { MetricName, REQUIRED_METRICS } from "@repo/shared";
import { USER_REQUIRED_RATINGS_TO_UNLOCK } from "@repo/shared";
import {
  Box,
  Container,
  Flex,
  IconButton,
  MenuItem,
  Tooltip as ThemeTooltip,
} from "@repo/theme";

import { AverageGrade } from "@/components/AverageGrade";
import CCN from "@/components/CCN";
import {
  ErrorDialog,
  SubmitRatingPopup,
} from "@/components/Class/Ratings/RatingDialog";
import EnrollmentDisplay from "@/components/EnrollmentDisplay";
import { ReservedSeatingHoverCard } from "@/components/ReservedSeatingHoverCard";
import Units from "@/components/Units";
import ClassContext from "@/contexts/ClassContext";
import { useGetCourseOverviewById } from "@/hooks/api";
import { useGetClass } from "@/hooks/api/classes/useGetClass";
import useUser from "@/hooks/useUser";
import { IClassCourse, IClassDetails, signIn } from "@/lib/api";
import {
  CreateRatingsDocument,
  GetUserRatingsDocument,
  Semester,
} from "@/lib/generated/graphql";
import { RecentType, addRecent } from "@/lib/recent";
import { getExternalLink } from "@/lib/section";
import { getRatingErrorMessage } from "@/utils/ratingErrorMessages";

import SuspenseBoundary from "../SuspenseBoundary";
import BookmarkPopover from "./BookmarkPopover";
import styles from "./Class.module.scss";
import UserFeedbackModal from "./Ratings/UserFeedbackModal";
import { MetricData } from "./Ratings/metricsUtil";
import { type RatingsTabClasses, RatingsTabLink } from "./locks";

const Enrollment = lazy(() => import("./Enrollment"));
const Grades = lazy(() => import("./Grades"));
const Overview = lazy(() => import("./Overview"));
const Sections = lazy(() => import("./Sections"));
const Ratings = lazy(() => import("./Ratings"));

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
  class: IClassDetails;
  course?: IClassCourse;
  year?: never;
  semester?: never;
  sessionId?: never;
  subject?: never;
  courseNumber?: never;
  number?: never;
}

interface UncontrolledProps {
  class?: never;
  course?: never;
  year: number;
  semester: Semester;
  sessionId: string;
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

const getCurrentTab = (pathname: string): string => {
  if (pathname.endsWith("/sections")) return "sections";
  if (pathname.endsWith("/grades")) return "grades";
  if (pathname.endsWith("/ratings")) return "ratings";
  if (pathname.endsWith("/enrollment")) return "enrollment";
  return "overview";
};

export default function Class({
  year,
  semester,
  sessionId,
  subject,
  courseNumber,
  number,
  class: providedClass,
  course: providedCourse,
  dialog,
}: ClassProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const { user, loading: userLoading } = useUser();

  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(() => {
    return new Set([getCurrentTab(location.pathname)]);
  });

  useEffect(() => {
    const currentTab = getCurrentTab(location.pathname);
    setVisitedTabs((prev) => {
      if (prev.has(currentTab)) return prev;
      return new Set(prev).add(currentTab);
    });
  }, [location.pathname]);

  const { data: userRatingsData } = useQuery(GetUserRatingsDocument, {
    skip: !user,
  });

  const [createUnlockRatings] = useMutation(CreateRatingsDocument);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [unlockModalGoalCount, setUnlockModalGoalCount] = useState(0);
  const [isUnlockThankYouOpen, setIsUnlockThankYouOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);

  const { data } = useGetClass(
    year as number,
    semester as Semester,
    sessionId as string,
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

  // Use courseId from class data to fetch course info (handles cross-listed courses)
  const { data: course } = useGetCourseOverviewById(_class?.courseId ?? "", {
    skip: !!providedCourse || !_class?.courseId,
  });

  const _course = useMemo(
    () => providedCourse ?? course,
    [course, providedCourse]
  );

  type ClassSectionAttribute = NonNullable<
    NonNullable<IClassDetails["primarySection"]>["sectionAttributes"]
  >[number];

  const sectionAttributes = useMemo<ClassSectionAttribute[]>(
    () => _class?.primarySection?.sectionAttributes ?? [],
    [_class?.primarySection?.sectionAttributes]
  );

  const specialTitleAttribute = useMemo(
    () =>
      sectionAttributes.find(
        (attr) =>
          attr.attribute?.code === "NOTE" &&
          attr.attribute?.formalDescription === "Special Title"
      ),
    [sectionAttributes]
  );

  const classTitle = useMemo(() => {
    if (specialTitleAttribute?.value?.formalDescription) {
      return specialTitleAttribute.value.formalDescription;
    }

    return _course?.title ?? "";
  }, [specialTitleAttribute?.value?.formalDescription, _course?.title]);

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
    const count = _course?.ratingsCount;
    return count && count > 0 ? count : false;
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
      classInfo: { subject: string; courseNumber: string; classNumber: string }
    ) => {
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

      // Build metrics array for batch submission
      const metrics = populatedMetrics.map((metric) => ({
        metricName: metric,
        value: metricValues[metric] as number,
      }));

      await createUnlockRatings({
        variables: {
          subject: classInfo.subject,
          courseNumber: classInfo.courseNumber,
          semester: termInfo.semester,
          year: termInfo.year,
          classNumber: classInfo.classNumber,
          metrics,
        },
        refetchQueries: [{ query: GetUserRatingsDocument }],
        awaitRefetchQueries: true,
      });
    },
    [createUnlockRatings]
  );

  const shouldShowUnlockModal =
    !!user &&
    ((ratingsLocked && unlockModalGoalCount > 0) ||
      isUnlockModalOpen ||
      isUnlockThankYouOpen);

  // seat reservation logic pending design + consideration for performance.
  // const seatReservationTypeMap = useMemo(() => {
  //   const reservationTypes =
  //     _class?.primarySection.enrollment?.seatReservationTypes ?? [];

  //   const reservationMap = new Map<number, string>();
  //   for (const type of reservationTypes) {
  //     reservationMap.set(type.number, type.requirementGroup.description);
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

  const courseGradeDistribution = _course?.gradeDistribution;

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

    return false;
  }, [courseGradeDistribution]);

  const activeReservedMaxCount =
    _class?.primarySection?.enrollment?.latest?.activeReservedMaxCount ?? 0;

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
                    <p className={styles.description}>{classTitle}</p>
                  </Flex>
                  <Flex gap="3">
                    <BookmarkPopover
                      disabled={userLoading}
                      classInfo={
                        _class
                          ? {
                              year: _class.year,
                              semester: _class.semester,
                              sessionId: _class.sessionId,
                              subject: _class.subject,
                              courseNumber: _class.courseNumber,
                              classNumber: _class.number,
                            }
                          : undefined
                      }
                    />
                    <ThemeTooltip
                      content="Open in Berkeley Catalog"
                      trigger={
                        <IconButton
                          as="a"
                          href={getExternalLink(_class)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <OpenNewWindow />
                        </IconButton>
                      }
                    />
                  </Flex>
                </Flex>
                <Flex gap="3" align="center" mb="5">
                  <EnrollmentDisplay
                    enrolledCount={
                      primarySection?.enrollment?.latest?.enrolledCount
                    }
                    maxEnroll={primarySection?.enrollment?.latest?.maxEnroll}
                    waitlistedCount={
                      primarySection?.enrollment?.latest?.waitlistedCount
                    }
                    maxWaitlist={
                      primarySection?.enrollment?.latest?.maxWaitlist
                    }
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
                        gradeDistribution={
                          _course?.gradeDistribution ?? {
                            average: null,
                            pnpPercentage: null,
                          }
                        }
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
                  {activeReservedMaxCount > 0 && (
                    <div className={styles.reservedSeatingBadgeContainer}>
                      <ReservedSeatingHoverCard
                        seatReservationCount={
                          _class?.primarySection?.enrollment?.latest
                            ?.seatReservationCount ?? []
                        }
                      />
                    </div>
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
              class: _class as IClassDetails,
              course: _course as IClassCourse,
            }}
          >
            {dialog ? (
              <>
                <Tabs.Content value="overview" asChild>
                  <SuspenseBoundary fallback={<></>}>
                    <Overview />
                  </SuspenseBoundary>
                </Tabs.Content>
                <Tabs.Content value="sections" asChild>
                  <SuspenseBoundary fallback={<></>}>
                    <Sections />
                  </SuspenseBoundary>
                </Tabs.Content>
                <Tabs.Content value="grades" asChild>
                  <SuspenseBoundary fallback={<></>}>
                    <Grades />
                  </SuspenseBoundary>
                </Tabs.Content>
                {!ratingsLocked && (
                  <Tabs.Content value="ratings" asChild>
                    <SuspenseBoundary fallback={<></>}>
                      <Ratings />
                    </SuspenseBoundary>
                  </Tabs.Content>
                )}
                <Tabs.Content value="enrollment" asChild>
                  <SuspenseBoundary fallback={<></>}>
                    <Enrollment />
                  </SuspenseBoundary>
                </Tabs.Content>
              </>
            ) : (
              <>
                {/* Lazy mount: only render tabs that have been visited, keep them mounted */}
                {visitedTabs.has("sections") && (
                  <div
                    style={{
                      display:
                        getCurrentTab(location.pathname) === "sections"
                          ? "block"
                          : "none",
                    }}
                  >
                    <SuspenseBoundary fallback={<></>}>
                      <Sections />
                    </SuspenseBoundary>
                  </div>
                )}
                {visitedTabs.has("grades") && (
                  <div
                    style={{
                      display:
                        getCurrentTab(location.pathname) === "grades"
                          ? "block"
                          : "none",
                    }}
                  >
                    <SuspenseBoundary fallback={<></>}>
                      <Grades />
                    </SuspenseBoundary>
                  </div>
                )}
                {!ratingsLocked && visitedTabs.has("ratings") && (
                  <div
                    style={{
                      display:
                        getCurrentTab(location.pathname) === "ratings"
                          ? "block"
                          : "none",
                    }}
                  >
                    <SuspenseBoundary fallback={<></>}>
                      <Ratings />
                    </SuspenseBoundary>
                  </div>
                )}
                {visitedTabs.has("enrollment") && (
                  <div
                    style={{
                      display:
                        getCurrentTab(location.pathname) === "enrollment"
                          ? "block"
                          : "none",
                    }}
                  >
                    <SuspenseBoundary fallback={<></>}>
                      <Enrollment />
                    </SuspenseBoundary>
                  </div>
                )}
                {visitedTabs.has("overview") && (
                  <div
                    style={{
                      display:
                        getCurrentTab(location.pathname) === "overview"
                          ? "block"
                          : "none",
                    }}
                  >
                    <SuspenseBoundary fallback={<></>}>
                      <Overview />
                    </SuspenseBoundary>
                  </div>
                )}
              </>
            )}
          </ClassContext>
        </Flex>
      </Root>
      {shouldShowUnlockModal && (
        <UserFeedbackModal
          isOpen={isUnlockModalOpen}
          onClose={handleUnlockModalClose}
          title="Unlock Ratings"
          subtitle={`Rate ${Math.max(unlockModalGoalCount, 1)} classes to unlock all other ratings.`}
          onSubmit={handleUnlockRatingSubmit}
          userRatedClasses={userRatedClasses}
          requiredRatingsCount={unlockModalGoalCount || 1}
          onSubmitPopupChange={setIsUnlockThankYouOpen}
          disableRatedCourses={true}
          onError={(error) => {
            const message = getRatingErrorMessage(error);
            setErrorMessage(message);
            setIsErrorDialogOpen(true);
          }}
        />
      )}
      <SubmitRatingPopup
        isOpen={isUnlockThankYouOpen}
        onClose={() => setIsUnlockThankYouOpen(false)}
      />
      <ErrorDialog
        isOpen={isErrorDialogOpen}
        onClose={() => setIsErrorDialogOpen(false)}
        errorMessage={errorMessage}
      />
    </>
  );
}
