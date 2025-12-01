import {
  ReactNode,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useMutation, useQuery } from "@apollo/client/react";
import classNames from "classnames";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { ArrowUp, Bookmark, BookmarkSolid, Circle, OpenNewWindow, PinSolid, Plus } from "iconoir-react";
import { Popover, Tabs } from "radix-ui";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import { MetricName, REQUIRED_METRICS } from "@repo/shared";
import { USER_REQUIRED_RATINGS_TO_UNLOCK } from "@repo/shared";
import {
  Box,
  Container,
  DropdownMenu,
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
import { useGetClassOverview, useUpdateUser } from "@/hooks/api";
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
import styles from "./Class.module.scss";
import UserFeedbackModal from "./Ratings/UserFeedbackModal";
import { MetricData } from "./Ratings/metricsUtil";
import { type RatingsTabClasses, RatingsTabLink } from "./locks";

const Enrollment = lazy(() => import("./Enrollment"));
const Grades = lazy(() => import("./Grades"));
const Overview = lazy(() => import("./Overview"));
const Sections = lazy(() => import("./Sections"));
const Ratings = lazy(() => import("./Ratings"));

const COLORS = [
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
];

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
  const [updateUser] = useUpdateUser();
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [unlockModalGoalCount, setUnlockModalGoalCount] = useState(0);
  const [isUnlockThankYouOpen, setIsUnlockThankYouOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [savedCollections, setSavedCollections] = useState<Set<string>>(
    new Set()
  );
  // TEMPORARY: In production, unpinned collections should be sorted by last edited date.
  // For now, we use createdAt to sort newest first among unpinned collections.
  const initialCollectionNames = useRef(new Set([
    "All saved", "Fall 2025", "Spring 2026", "Breadths",
    "Testing this really long name for a collection, Major Requirements"
  ]));
  const [collections, setCollections] = useState([
    { name: "All saved", count: 4, color: null as string | null, pinned: false, createdAt: 0 },
    { name: "Fall 2025", count: 8, color: null as string | null, pinned: true, createdAt: 1 },
    { name: "Spring 2026", count: 12, color: null as string | null, pinned: false, createdAt: 2 },
    { name: "Breadths", count: 5, color: null as string | null, pinned: true, createdAt: 3 },
    { name: "Testing this really long name for a collection, Major Requirements", count: 15, color: null as string | null, pinned: false, createdAt: 4 },
  ]);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionColor, setNewCollectionColor] = useState<string | null>(null);

  const { data: course } = useGetClassOverview(
    providedClass?.subject ?? (subject as string),
    providedClass?.courseNumber ?? (courseNumber as string),
    {
      skip: !!providedCourse,
    }
  );

  const { data } = useGetClass(
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

    const bookmarkEntry: (typeof user.bookmarkedClasses)[number] = {
      __typename: "Class",
      ..._class,
      course: {
        __typename: "Course",
        title: _course?.title ?? "",
      },
      gradeDistribution: {
        __typename: "GradeDistribution",
        average: _course?.gradeDistribution?.average ?? null,
      },
    };

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
      : user.bookmarkedClasses.concat(bookmarkEntry);
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
  }, [_class, _course, bookmarked, updateUser, user]);

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
    const aggregatedRatings = _course?.aggregatedRatings;
    if (!aggregatedRatings) {
      return false;
    }

    type Metric = NonNullable<
      NonNullable<IClassCourse["aggregatedRatings"]>["metrics"]
    >[number];
    const metrics =
      (aggregatedRatings.metrics ?? []).filter((metric): metric is Metric =>
        Boolean(metric)
      ) ?? [];
    if (metrics.length === 0) {
      return false;
    }

    const counts = metrics.map((metric) => metric.count);
    return counts.length > 0 ? Math.max(...counts) : false;
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
                    {/* TODO: Reusable bookmark button */}
                    <Popover.Root
                      onOpenChange={(open) => {
                        if (!open) {
                          setIsCreateFormOpen(false);
                          setNewCollectionName("");
                          setNewCollectionColor(null);
                        }
                      }}
                    >
                      <Popover.Trigger asChild>
                        <IconButton
                          className={classNames(styles.bookmark, {
                            [styles.active]: savedCollections.size > 0,
                          })}
                          disabled={userLoading}
                          onClick={() => {
                            setSavedCollections((prev) => {
                              if (prev.has("All saved")) {
                                return prev;
                              }
                              const next = new Set(prev);
                              next.add("All saved");
                              return next;
                            });
                          }}
                        >
                          {savedCollections.size > 0 ? (
                            <BookmarkSolid />
                          ) : (
                            <Bookmark />
                          )}
                        </IconButton>
                      </Popover.Trigger>
                      <Popover.Portal>
                        <Popover.Content
                          side="bottom"
                          align="end"
                          sideOffset={8}
                          className={styles.bookmarkPopover}
                        >
                          <div
                            className={styles.collectionList}
                            onClick={() => {
                              if (isCreateFormOpen) {
                                setIsCreateFormOpen(false);
                                setNewCollectionName("");
                                setNewCollectionColor(null);
                              }
                            }}
                          >
                            {(() => {
                              const existingNames = collections.map((c) =>
                                c.name.toLowerCase()
                              );
                              const hasConflict =
                                newCollectionName.trim() !== "" &&
                                existingNames.includes(
                                  newCollectionName.trim().toLowerCase()
                                );

                              // Sort: "All saved" first, then pinned, then unpinned (newest first)
                              const sortedCollections = [...collections].sort((a, b) => {
                                if (a.name === "All saved") return -1;
                                if (b.name === "All saved") return 1;
                                if (a.pinned && !b.pinned) return -1;
                                if (!a.pinned && b.pinned) return 1;
                                // For unpinned items, sort by createdAt descending (newest first)
                                if (!a.pinned && !b.pinned) return b.createdAt - a.createdAt;
                                return 0;
                              });

                              return (
                                <>
                                  <LayoutGroup>
                                    {sortedCollections.map((collection) => {
                                      const isSaved = savedCollections.has(
                                        collection.name
                                      );
                                      const isNew = !initialCollectionNames.current.has(collection.name);
                                      return (
                                        <motion.div
                                          key={collection.name}
                                          layout
                                          initial={isNew ? { opacity: 0, y: 50 } : false}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{
                                            layout: { type: "spring", stiffness: 500, damping: 35 },
                                            opacity: { duration: 0.2 },
                                            y: { type: "spring", stiffness: 400, damping: 25 },
                                          }}
                                          className={styles.collectionRow}
                                        >
                                          <span className={styles.collectionName}>
                                            {collection.pinned && (
                                              <PinSolid width={14} height={14} className={styles.pinIcon} />
                                            )}
                                            <span>
                                              {collection.name}{" "}
                                              <span className={styles.collectionCount}>
                                                ({collection.count})
                                              </span>
                                            </span>
                                          </span>
                                          <IconButton
                                            className={classNames(styles.bookmark, {
                                              [styles.active]: isSaved,
                                            })}
                                            onClick={() => {
                                              setSavedCollections((prev) => {
                                                const next = new Set(prev);
                                                if (collection.name === "All saved") {
                                                  if (next.has("All saved")) {
                                                    return new Set();
                                                  } else {
                                                    next.add("All saved");
                                                  }
                                                } else {
                                                  if (next.has(collection.name)) {
                                                    next.delete(collection.name);
                                                  } else {
                                                    next.add("All saved");
                                                    next.add(collection.name);
                                                  }
                                                }
                                                return next;
                                              });
                                            }}
                                          >
                                            {isSaved ? (
                                              <BookmarkSolid width={16} height={16} />
                                            ) : (
                                              <Bookmark width={16} height={16} />
                                            )}
                                          </IconButton>
                                        </motion.div>
                                      );
                                    })}
                                  </LayoutGroup>
                                  <motion.div
                                    layout
                                    transition={{ layout: { type: "spring", stiffness: 500, damping: 35 } }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <AnimatePresence mode="popLayout" initial={false}>
                                      {isCreateFormOpen ? (
                                        <motion.div
                                          key="form"
                                          className={styles.createCollectionForm}
                                          initial={{ opacity: 0, scale: 0.96 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          exit={{ opacity: 0, scale: 0.96 }}
                                          transition={{ duration: 0.15 }}
                                        >
                                          <div className={styles.createCollectionInputRow}>
                                            <input
                                              type="text"
                                              className={classNames(
                                                styles.createCollectionInput,
                                                { [styles.inputError]: hasConflict }
                                              )}
                                              placeholder="New collection name"
                                              value={newCollectionName}
                                              onChange={(e) =>
                                                setNewCollectionName(e.target.value)
                                              }
                                              onKeyDown={(e) => {
                                                if (e.key === "Enter" && newCollectionName.trim() && !hasConflict) {
                                                  const trimmedName = newCollectionName.trim();
                                                  setCollections((prev) => [
                                                    ...prev,
                                                    {
                                                      name: trimmedName,
                                                      count: 0,
                                                      color: newCollectionColor,
                                                      pinned: false,
                                                      createdAt: Date.now(),
                                                    },
                                                  ]);
                                                  setSavedCollections((prev) => {
                                                    const next = new Set(prev);
                                                    next.add("All saved");
                                                    next.add(trimmedName);
                                                    return next;
                                                  });
                                                  setNewCollectionName("");
                                                  setNewCollectionColor(null);
                                                  setIsCreateFormOpen(false);
                                                }
                                              }}
                                              autoFocus
                                            />
                                            <DropdownMenu.Root modal={false}>
                                              <DropdownMenu.Trigger asChild>
                                                <button className={styles.colorSelectButton}>
                                                  {newCollectionColor ? (
                                                    <>
                                                      <span
                                                        className={styles.colorDot}
                                                        data-color={newCollectionColor}
                                                      />
                                                      {newCollectionColor.charAt(0).toUpperCase() + newCollectionColor.slice(1)}
                                                    </>
                                                  ) : (
                                                    <>
                                                      <Circle width={14} height={14} />
                                                      No color
                                                    </>
                                                  )}
                                                </button>
                                              </DropdownMenu.Trigger>
                                              <DropdownMenu.Portal>
                                                <DropdownMenu.Content sideOffset={5} align="start" className={styles.colorDropdown}>
                                                  <DropdownMenu.Item onSelect={() => setNewCollectionColor(null)}>
                                                    <span className={styles.colorDotOutline} /> No color
                                                  </DropdownMenu.Item>
                                                  {COLORS.map((color) => (
                                                    <DropdownMenu.Item
                                                      key={color}
                                                      onSelect={() => setNewCollectionColor(color)}
                                                    >
                                                      <span className={styles.colorDot} data-color={color} />{" "}
                                                      {color.charAt(0).toUpperCase() + color.slice(1)}
                                                    </DropdownMenu.Item>
                                                  ))}
                                                </DropdownMenu.Content>
                                              </DropdownMenu.Portal>
                                            </DropdownMenu.Root>
                                            <IconButton
                                              className={styles.createCollectionSubmit}
                                              disabled={!newCollectionName.trim() || hasConflict}
                                              onClick={() => {
                                                if (newCollectionName.trim() && !hasConflict) {
                                                  const trimmedName = newCollectionName.trim();
                                                  setCollections((prev) => [
                                                    ...prev,
                                                    {
                                                      name: trimmedName,
                                                      count: 0,
                                                      color: newCollectionColor,
                                                      pinned: false,
                                                      createdAt: Date.now(),
                                                    },
                                                  ]);
                                                  setSavedCollections((prev) => {
                                                    const next = new Set(prev);
                                                    next.add("All saved");
                                                    next.add(trimmedName);
                                                    return next;
                                                  });
                                                  setNewCollectionName("");
                                                  setNewCollectionColor(null);
                                                  setIsCreateFormOpen(false);
                                                }
                                              }}
                                            >
                                              <ArrowUp width={16} height={16} />
                                            </IconButton>
                                          </div>
                                          <AnimatePresence>
                                            {hasConflict && (
                                              <motion.span
                                                className={styles.createCollectionError}
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.15 }}
                                              >
                                                A collection with this name already exists
                                              </motion.span>
                                            )}
                                          </AnimatePresence>
                                        </motion.div>
                                      ) : (
                                        <motion.button
                                          key="button"
                                          className={styles.createCollectionBtn}
                                          onClick={() => setIsCreateFormOpen(true)}
                                          initial={{ opacity: 0, scale: 0.96 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          exit={{ opacity: 0, scale: 0.96 }}
                                          transition={{ duration: 0.15 }}
                                        >
                                          <Plus width={16} height={16} />
                                          Create new collection
                                        </motion.button>
                                      )}
                                    </AnimatePresence>
                                  </motion.div>
                                </>
                              );
                            })()}
                          </div>
                        </Popover.Content>
                      </Popover.Portal>
                    </Popover.Root>
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
