import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useMutation, useQuery } from "@apollo/client/react";
import { AnimatePresence, motion } from "framer-motion";
import { NavArrowRight } from "iconoir-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { MetricName, REQUIRED_METRICS } from "@repo/shared";
import { USER_REQUIRED_RATINGS_TO_UNLOCK } from "@repo/shared";
import { Flex } from "@repo/theme";

import Class from "@/components/Class";
import {
  ErrorDialog,
  SubmitRatingPopup,
} from "@/components/Class/Ratings/RatingDialog";
import UserFeedbackModal from "@/components/Class/Ratings/UserFeedbackModal";
import { MetricData } from "@/components/Class/Ratings/metricsUtil";
import ClassBrowser from "@/components/ClassBrowser";
import { useToast } from "@/components/Toast";
import { useReadTerms } from "@/hooks/api";
import { useGetClass } from "@/hooks/api/classes/useGetClass";
import useUser from "@/hooks/useUser";
import {
  CreateRatingsDocument,
  GetUserRatingsDocument,
  Semester,
} from "@/lib/generated/graphql";
import { RecentType, addRecent, getRecents } from "@/lib/recent";
import { getRatingErrorMessage } from "@/utils/ratingErrorMessages";

import styles from "./Catalog.module.scss";

// Semester hierarchy for chronological ordering (latest to earliest in year)
const SEMESTER_ORDER: Record<Semester, number> = {
  [Semester.Spring]: 0,
  [Semester.Summer]: 1,
  [Semester.Fall]: 2,
  [Semester.Winter]: 3,
};

// Panel dimensions for narrow screen mode
const PANEL_WIDTH = 384;
const PANEL_VISIBLE_WHEN_COLLAPSED = 40;
const PANEL_COLLAPSED_OFFSET = PANEL_WIDTH - PANEL_VISIBLE_WHEN_COLLAPSED;

export default function Catalog() {
  const {
    year: providedYear,
    semester: providedSemester,
    subject: providedSubject,
    courseNumber,
    number,
  } = useParams();

  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [unlockModalGoalCount, setUnlockModalGoalCount] = useState(0);
  const [isUnlockThankYouOpen, setIsUnlockThankYouOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  // Default panel open when no class is selected
  const hasClassSelected = !!(providedSubject && courseNumber && number);
  const [isPanelOpen, setIsPanelOpen] = useState(!hasClassSelected);
  const [showExpandButton, setShowExpandButton] = useState(false);
  const [buttonY, setButtonY] = useState(0);
  const [isNarrowScreen, setIsNarrowScreen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Track mouse position for expand button (throttled for performance)
  useEffect(() => {
    if (!isNarrowScreen || isPanelOpen) {
      setShowExpandButton(false);
      return;
    }

    let rafId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafId) return; // Skip if already scheduled

      rafId = requestAnimationFrame(() => {
        rafId = null;
        const atLeftEdge = e.clientX <= 60;
        const rootRect = rootRef.current?.getBoundingClientRect();
        const withinYBounds = rootRect
          ? e.clientY >= rootRect.top && e.clientY <= rootRect.bottom
          : false;

        if (atLeftEdge && withinYBounds && rootRect) {
          setShowExpandButton(true);
          setButtonY(e.clientY - rootRect.top);
        } else {
          setShowExpandButton(false);
        }
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isNarrowScreen, isPanelOpen]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 900px)");
    setIsNarrowScreen(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsNarrowScreen(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const { user } = useUser();
  const { data: terms, loading: termsLoading } = useReadTerms();
  const [createUnlockRatings] = useMutation(CreateRatingsDocument);

  const { data: userRatingsData, loading: userRatingsLoading } = useQuery(
    GetUserRatingsDocument,
    {
      skip: !user,
    }
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

  const ratingsNeeded = Math.max(
    0,
    USER_REQUIRED_RATINGS_TO_UNLOCK - userRatingsCount
  );

  const openUnlockModal = useCallback(() => {
    if (!user) return;
    const goalCount =
      ratingsNeeded <= 0 ? USER_REQUIRED_RATINGS_TO_UNLOCK : ratingsNeeded;
    setUnlockModalGoalCount(goalCount);
    setIsUnlockModalOpen(true);
    setIsUnlockThankYouOpen(false);
  }, [ratingsNeeded, user]);

  const handleUnlockModalClose = useCallback(() => {
    setIsUnlockModalOpen(false);
    setUnlockModalGoalCount(0);
    setIsUnlockThankYouOpen(false);
  }, []);

  const METRIC_NAMES = Object.values(MetricName) as MetricName[];

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
    [METRIC_NAMES, createUnlockRatings]
  );

  const shouldShowUnlockModal =
    !!user &&
    ((unlockModalGoalCount > 0 && isUnlockModalOpen) || isUnlockThankYouOpen);

  const semester = useMemo(() => {
    if (!providedSemester) return null;

    return providedSemester[0].toUpperCase() + providedSemester.slice(1);
  }, [providedSemester]);

  const year = useMemo(() => {
    if (!providedYear) return null;

    return parseInt(providedYear) || null;
  }, [providedYear]);

  const term = useMemo(() => {
    if (!terms) return null;

    const recentTerm = getRecents(RecentType.CatalogTerm)[0];

    // Default to the latest term by year + semester hierarchy
    const latestTerm = terms.toSorted((a, b) => {
      // Sort by year DESC first
      if (a.year !== b.year) return b.year - a.year;
      // Then by semester hierarchy DESC
      return SEMESTER_ORDER[b.semester] - SEMESTER_ORDER[a.semester];
    })[0];

    const selectedTerm =
      terms?.find((term) => term.year === year && term.semester === semester) ??
      terms.find(
        (term) =>
          term.year === recentTerm?.year &&
          term.semester === recentTerm?.semester
      ) ??
      latestTerm;

    if (selectedTerm) {
      addRecent(RecentType.CatalogTerm, {
        year: selectedTerm.year,
        semester: selectedTerm.semester,
      });
    }

    return selectedTerm;
  }, [terms, year, semester]);

  const subject = useMemo(
    () => providedSubject?.toUpperCase(),
    [providedSubject]
  );

  const { data: _class } = useGetClass(
    term?.year as number,
    term?.semester as Semester,
    subject as string,
    courseNumber as string,
    number as string,
    {
      skip: !subject || !courseNumber || !number || !term,
    }
  );

  const handleSelect = useCallback(
    (subject: string, courseNumber: string, number: string) => {
      if (!term) return;

      setIsPanelOpen(false);
      navigate({
        ...location,
        pathname: `/catalog/${term.year}/${term.semester}/${subject}/${courseNumber}/${number}`,
      });
    },
    [navigate, location, term]
  );

  useEffect(() => {
    if (!user || userRatingsLoading || !userRatingsData || ratingsNeeded <= 0)
      return;

    showToast({
      title: "Unlock all features by reviewing classes you have taken",
      action: {
        label: "Start",
        onClick: openUnlockModal,
      },
    });
  }, [
    showToast,
    openUnlockModal,
    user,
    userRatingsLoading,
    userRatingsData,
    ratingsNeeded,
  ]);

  if (termsLoading) {
    return (
      <div>
        <div />
        <div />
      </div>
    );
  }

  // TODO: Error state
  if (!terms || !term) {
    return <></>;
  }

  // TODO: Class error state, class loading state
  return (
    <div className={styles.root} ref={rootRef}>
      <motion.div
        className={styles.panel}
        animate={
          isNarrowScreen
            ? { x: isPanelOpen ? 0 : -PANEL_COLLAPSED_OFFSET }
            : { x: 0 }
        }
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 35,
        }}
      >
        <ClassBrowser
          onSelect={handleSelect}
          semester={term.semester}
          year={term.year}
          terms={terms}
          persistent
        />
      </motion.div>

      {/* Tap zone to open panel when collapsed */}
      {isNarrowScreen && !isPanelOpen && (
        <div
          className={styles.tapZone}
          onClick={() => setIsPanelOpen(true)}
          role="button"
          aria-label="Open class browser"
        />
      )}

      {/* Expand button that follows mouse Y (mouse only) */}
      <AnimatePresence>
        {isNarrowScreen && showExpandButton && !isPanelOpen && (
          <motion.button
            className={styles.expandButton}
            style={{ top: buttonY - 40 }}
            onClick={() => setIsPanelOpen(true)}
            aria-label="Expand panel"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
          >
            <NavArrowRight width={16} height={16} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Overlay when panel is expanded */}
      <AnimatePresence>
        {isNarrowScreen && isPanelOpen && (
          <motion.div
            className={styles.overlay}
            onClick={() => setIsPanelOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="button"
            aria-label="Close class browser"
          />
        )}
      </AnimatePresence>

      <Flex direction="column" flexGrow="1" className={styles.view}>
        {_class ? <Class class={_class} /> : null}
      </Flex>

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
    </div>
  );
}
