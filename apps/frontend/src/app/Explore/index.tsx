import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { User } from "iconoir-react";
import { Link, useNavigate } from "react-router-dom";

import { Box, Button, Flex, LoadingIndicator } from "@repo/theme";

import { CollectionCard } from "@/app/Profile/Bookmarks/CollectionCard";
import CatalogCard from "@/components/CatalogCard";
import ClassDrawer from "@/components/ClassDrawer";
import ScrollableRow from "@/components/ScrollableRow";
import { useReadCuratedClasses, useReadTerms } from "@/hooks/api";
import { useGetAllCollectionsWithPreview } from "@/hooks/api/collections";
import useUser from "@/hooks/useUser";
import { signIn } from "@/lib/api";
import { EnrollmentFilterType, Semester } from "@/lib/generated/graphql";
import { RecentType, getRecents } from "@/lib/recent";

import styles from "./Explore.module.scss";

// Type definitions for GraphQL queries
interface Course {
  courseId: string;
  subject: string;
  number: string;
  title?: string;
  viewCount?: number;
  gradeDistribution?: {
    average?: number | null;
    distribution?: Array<{ letter: string; count: number }>;
  } | null;
}

interface CoursesQueryData {
  courses: Course[];
}

interface CatalogClassWithEnrollment {
  year: number;
  semester: string;
  sessionId: string;
  subject: string;
  courseNumber: string;
  number: string;
  title?: string | null;
  courseTitle?: string | null;
  allTimeAverageGrade?: number | null;
  enrolledCount?: number | null;
  maxEnroll?: number | null;
}

interface CatalogSearchResult {
  catalogSearch: {
    results: CatalogClassWithEnrollment[];
    totalCount: number;
  };
}

const GET_COURSES_EXPLORE = gql`
  query GetCoursesExplore {
    courses {
      courseId
      subject
      number
      title
      viewCount
      gradeDistribution {
        average
        distribution {
          letter
          count
        }
      }
    }
  }
`;

const GET_CLASSES_WITH_OPEN_SEATS = gql`
  query GetClassesWithOpenSeats(
    $year: Int!
    $semester: Semester!
    $filters: CatalogFilters
    $sortBy: CatalogSortBy
    $pageSize: Int
  ) {
    catalogSearch(
      year: $year
      semester: $semester
      filters: $filters
      sortBy: $sortBy
      pageSize: $pageSize
    ) {
      results {
        year
        semester
        sessionId
        subject
        courseNumber
        number
        title
        courseTitle
        allTimeAverageGrade
        enrolledCount
        maxEnroll
      }
      totalCount
    }
  }
`;

// Semester hierarchy for chronological ordering (latest to earliest in year)
const SEMESTER_ORDER: Record<Semester, number> = {
  [Semester.Spring]: 0,
  [Semester.Summer]: 1,
  [Semester.Fall]: 2,
  [Semester.Winter]: 3,
};

// Fallback term so the UI always renders
const FALLBACK_TERM = {
  year: new Date().getFullYear(),
  semester: Semester.Fall as Semester,
};

// Category definitions with subject mappings
const CATEGORIES = [
  {
    id: "for-you",
    label: "For You",
    subjects: [], // Special tab for personalized content (includes popular courses)
  },
  {
    id: "american-cultures",
    label: "American Cultures",
    subjects: ["AFRICAM", "AMERSTD", "CHICANO", "ASAMST", "NATAMST", "ETHSTD"],
  },
  {
    id: "arts-literature",
    label: "Arts and Literature",
    subjects: [
      "ENGLISH",
      "COMLIT",
      "THEATER",
      "ART",
      "MUSIC",
      "FILM",
      "RHETORIC",
    ],
  },
  {
    id: "eecs",
    label: "EECS",
    subjects: ["EECS", "EL ENG", "COMPSCI"],
  },
  {
    id: "history",
    label: "History",
    subjects: ["HISTORY", "HISTART", "ANTHRO"],
  },
  {
    id: "physical-sciences",
    label: "Physical Sciences",
    subjects: ["PHYSICS", "CHEM", "ASTRON", "EPS", "GEOG"],
  },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];

export default function Explore() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("for-you");
  const { user } = useUser();
  const navigate = useNavigate();
  const { data: apiCollections } = useGetAllCollectionsWithPreview();
  const allSavedCollection = apiCollections?.find((c) => c.isSystem);
  const totalBookmarks = allSavedCollection?.classes?.length ?? 0;
  const { data: coursesData, loading: coursesLoading } =
    useQuery<CoursesQueryData>(GET_COURSES_EXPLORE);
  const { data: curatedClassesData, loading: curatedClassesLoading } =
    useReadCuratedClasses();
  const { data: terms } = useReadTerms();

  // Get the latest term for queries
  const currentTerm = useMemo(() => {
    if (!terms) return FALLBACK_TERM;
    const latestTerm = terms.toSorted((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return SEMESTER_ORDER[b.semester] - SEMESTER_ORDER[a.semester];
    })[0];
    return latestTerm ?? FALLBACK_TERM;
  }, [terms]);

  // Query for classes with open seats using catalogSearch
  const { data: openSeatsData, loading: openSeatsLoading } =
    useQuery<CatalogSearchResult>(GET_CLASSES_WITH_OPEN_SEATS, {
      variables: {
        year: currentTerm.year,
        semester: currentTerm.semester,
        filters: { enrollmentFilter: EnrollmentFilterType.Open },
        sortBy: "OPEN_SEATS",
        pageSize: 4,
      },
      skip: !terms,
    });

  const recentCourseKeys = getRecents(RecentType.Course);
  const recentCoursesData = recentCourseKeys
    .map(({ subject, number }) =>
      coursesData?.courses?.find(
        (c: { subject: string; number: string }) =>
          c.subject === subject && c.number === number
      )
    )
    .filter(Boolean);

  const currentCategory = CATEGORIES.find((c) => c.id === activeCategory);

  // Filter courses by category subjects
  const filteredCourses = useMemo((): Course[] => {
    if (!coursesData?.courses) return [];
    const courses = [...coursesData.courses];

    if (activeCategory === "for-you") {
      // For for-you, show all courses sorted by view count (popular courses)
      return courses.sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
    }

    const categorySubjects: readonly string[] = currentCategory?.subjects ?? [];
    return courses
      .filter((course) => categorySubjects.includes(course.subject))
      .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
  }, [coursesData?.courses, activeCategory, currentCategory]);

  // Get courses with open seats from catalogSearch
  const coursesWithOpenSeats = useMemo((): CatalogClassWithEnrollment[] => {
    return openSeatsData?.catalogSearch?.results ?? [];
  }, [openSeatsData]);

  // Get personalized recommendations (placeholder - uses recent courses)
  const recommendedCourses = useMemo((): Course[] => {
    if (!coursesData?.courses || recentCoursesData.length === 0) return [];
    // Placeholder: recommend courses from the same subject as recently viewed
    const recentSubjects = new Set(
      recentCoursesData.map((c) => c?.subject).filter(Boolean)
    );
    return coursesData.courses
      .filter(
        (course) =>
          recentSubjects.has(course.subject) &&
          !recentCoursesData.some((r) => r?.courseId === course.courseId)
      )
      .slice(0, 4);
  }, [coursesData?.courses, recentCoursesData]);

  const lastViewedCourse = recentCoursesData[0];

  // Get curated courses (limit to 4)
  const curatedCourses = useMemo(() => {
    if (!curatedClassesData) return [];
    return curatedClassesData.slice(0, 4);
  }, [curatedClassesData]);

  const isForYouTab = activeCategory === "for-you";
  const loading = coursesLoading || openSeatsLoading || curatedClassesLoading;

  // Infinite scroll state for subject category tabs
  const catalogGridRef = useRef<HTMLDivElement>(null);
  const CARD_HEIGHT = 300; // Approximate height of a CatalogCard in pixels
  const COLUMNS = 4; // Grid columns on desktop
  const LOAD_MORE_THRESHOLD = 200; // Pixels from bottom to trigger load

  // Calculate initial visible count based on viewport
  const calculateInitialCount = useCallback(() => {
    const viewportHeight =
      typeof window !== "undefined" ? window.innerHeight : 800;
    const rowsToFill = Math.ceil(viewportHeight / CARD_HEIGHT) + 1; // +1 for buffer
    return rowsToFill * COLUMNS;
  }, []);

  const [visibleCount, setVisibleCount] = useState(() =>
    calculateInitialCount()
  );

  // Reset visible count when category changes
  useEffect(() => {
    setVisibleCount(calculateInitialCount());
  }, [activeCategory, calculateInitialCount]);

  // Scroll handler for infinite loading
  useEffect(() => {
    if (isForYouTab) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const distanceToBottom = documentHeight - (scrollTop + windowHeight);

      if (
        distanceToBottom <= LOAD_MORE_THRESHOLD &&
        visibleCount < filteredCourses.length
      ) {
        setVisibleCount((prev) =>
          Math.min(prev + COLUMNS * 2, filteredCourses.length)
        );
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isForYouTab, visibleCount, filteredCourses.length]);

  // Courses to display (sliced for infinite scroll)
  const displayedCourses = useMemo(() => {
    if (isForYouTab) return filteredCourses;
    return filteredCourses.slice(0, visibleCount);
  }, [filteredCourses, visibleCount, isForYouTab]);

  const hasMoreCourses = !isForYouTab && visibleCount < filteredCourses.length;

  return (
    <Box p="6">
      <Box>
        {/* Hero Banner - NEW FEATURE */}
        <Flex mb="6" align="center" gap="6" className={styles.heroBanner}>
          <Box className={styles.heroImageContainer}>
            <img
              src="/images/ExplorePage.png"
              alt="GradTrak feature preview"
              className={styles.heroImage}
            />
          </Box>
          <Flex direction="column" gap="2" className={styles.heroText}>
            <p className={styles.heroLabel}>NEW FEATURE</p>
            <h2 className={styles.heroTitle}>Major planning made easy</h2>
            <p className={styles.heroDescription}>
              Here is a short paragraph that explains GradTrak features, new
              launches, product updates, bug fixes, etc.
            </p>
            <Button
              variant="primary"
              onClick={() =>
                window.open("https://berkeleytime.com/gradtrak", "_blank")
              }
              style={{ width: "fit-content" }}
            >
              Explore Gradtrak
            </Button>
          </Flex>
        </Flex>

        {/* Category Tabs */}
        <div className={styles.categoryTabs}>
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`${styles.categoryTab} ${
                activeCategory === category.id ? styles.categoryTabActive : ""
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {loading && <LoadingIndicator size="md" />}

        {/* For You Tab Content */}
        {isForYouTab && (
          <Flex direction="column" gap="6">
            {!user ? (
              <Flex
                direction="column"
                align="center"
                gap="3"
                className={styles.signInBanner}
              >
                <User width={32} height={32} />
                <h3 className={styles.signInTitle}>Sign in Banner</h3>
                <p className={styles.signInDescription}>
                  The for you feature can only be accessible if you are signed
                  in to personalize results
                </p>
                <Button variant="primary" onClick={() => signIn()}>
                  Sign in →
                </Button>
              </Flex>
            ) : (
              <>
                {/* Row 1: Bookmarks + Recently Viewed (side by side) */}
                <div className={styles.bookmarksRow}>
                  <div className={styles.bookmarksCardWrapper}>
                    <CollectionCard
                      name="Bookmarks"
                      classCount={totalBookmarks}
                      isSystem={true}
                      previewClasses={
                        allSavedCollection?.classes
                          ?.filter((entry) => entry.class != null)
                          .slice(0, 2)
                          .map((entry) => ({
                            subject: entry.class!.subject,
                            courseNumber: entry.class!.courseNumber,
                            number: entry.class!.number,
                            title:
                              entry.class!.title ??
                              entry.class!.course?.title ??
                              null,
                            gradeAverage:
                              entry.class!.gradeDistribution?.average ??
                              entry.class!.course?.gradeDistribution?.average ??
                              null,
                            enrolledCount:
                              entry.class!.primarySection?.enrollment?.latest
                                ?.enrolledCount ?? null,
                            maxEnroll:
                              entry.class!.primarySection?.enrollment?.latest
                                ?.maxEnroll ?? null,
                            unitsMin: entry.class!.unitsMin,
                            unitsMax: entry.class!.unitsMax,
                            hasReservedSeats: false,
                          })) ?? []
                      }
                      onClick={() => navigate("/profile/bookmarks")}
                    />
                  </div>

                  <div className={styles.recentlyViewedColumn}>
                    <h3 className={styles.subheading}>
                      Courses you recently viewed
                    </h3>
                    {recentCoursesData.length === 0 ? (
                      <p className={styles.signInDescription}>
                        No recently viewed courses yet. Browse the{" "}
                        <Link to="/catalog">catalog</Link> to get started.
                      </p>
                    ) : (
                      <ScrollableRow>
                        {recentCoursesData.slice(0, 4).map((course, index) => {
                          if (!course) return null;
                          return (
                            <Link
                              key={course.courseId}
                              to={`/catalog/${course.subject}/${course.number}`}
                              style={{ textDecoration: "none" }}
                            >
                              <CatalogCard
                                subject={course.subject}
                                courseNumber={course.number}
                                title={course.title}
                                gradeDistribution={
                                  course.gradeDistribution ?? undefined
                                }
                                imageIndex={index}
                              />
                            </Link>
                          );
                        })}
                      </ScrollableRow>
                    )}
                  </div>
                </div>

                {/* Row 2: Popular Courses */}
                <section className={styles.section}>
                  <h2 className={styles.sectionHeading}>Popular Courses</h2>
                  <ScrollableRow>
                    {filteredCourses.slice(0, 4).map((course, index) => (
                      <Link
                        key={course.courseId}
                        to={`/catalog/${course.subject}/${course.number}`}
                        style={{ textDecoration: "none" }}
                      >
                        <CatalogCard
                          subject={course.subject}
                          courseNumber={course.number}
                          title={course.title}
                          gradeDistribution={
                            course.gradeDistribution ?? undefined
                          }
                          imageIndex={index + 4}
                        />
                      </Link>
                    ))}
                  </ScrollableRow>
                </section>

                {/* Row 3: Curated Courses */}
                {curatedCourses.length > 0 && (
                  <section className={styles.section}>
                    <h2 className={styles.sectionHeading}>Curated Courses</h2>
                    <ScrollableRow>
                      {curatedCourses.map((curatedClass, index) => (
                        <ClassDrawer
                          key={curatedClass._id}
                          subject={curatedClass.subject}
                          courseNumber={curatedClass.courseNumber}
                          number={curatedClass.number}
                          semester={curatedClass.semester}
                          year={curatedClass.year}
                          sessionId={curatedClass.sessionId}
                        >
                          <CatalogCard
                            subject={curatedClass.subject}
                            courseNumber={curatedClass.courseNumber}
                            number={curatedClass.number}
                            title={
                              curatedClass.class?.title ??
                              curatedClass.class?.course?.title
                            }
                            gradeDistribution={
                              curatedClass.class?.course?.gradeDistribution ??
                              undefined
                            }
                            imageIndex={index + 8}
                          />
                        </ClassDrawer>
                      ))}
                    </ScrollableRow>
                  </section>
                )}

                {/* Row 4: Because you looked at... */}
                {lastViewedCourse && recommendedCourses.length > 0 && (
                  <section className={styles.section}>
                    <h2 className={styles.sectionHeading}>
                      Because you looked at {lastViewedCourse.subject}{" "}
                      {lastViewedCourse.number}
                    </h2>
                    <ScrollableRow>
                      {recommendedCourses.map((course, index) => (
                        <Link
                          key={course.courseId}
                          to={`/catalog/${course.subject}/${course.number}`}
                          style={{ textDecoration: "none" }}
                        >
                          <CatalogCard
                            subject={course.subject}
                            courseNumber={course.number}
                            title={course.title}
                            gradeDistribution={
                              course.gradeDistribution ?? undefined
                            }
                            imageIndex={index + 12}
                          />
                        </Link>
                      ))}
                    </ScrollableRow>
                  </section>
                )}

                {/* Row 5: Courses with open seats */}
                <section className={styles.section}>
                  <h2 className={styles.sectionHeading}>
                    Courses with open seats
                  </h2>
                  <ScrollableRow>
                    {coursesWithOpenSeats.map((cls, index) => (
                      <ClassDrawer
                        key={`${cls.subject}-${cls.courseNumber}-${cls.number}`}
                        subject={cls.subject}
                        courseNumber={cls.courseNumber}
                        number={cls.number}
                        semester={cls.semester as Semester}
                        year={cls.year}
                        sessionId={cls.sessionId}
                      >
                        <CatalogCard
                          subject={cls.subject}
                          courseNumber={cls.courseNumber}
                          number={cls.number}
                          title={cls.title ?? cls.courseTitle ?? undefined}
                          gradeDistribution={
                            cls.allTimeAverageGrade != null
                              ? { average: cls.allTimeAverageGrade }
                              : undefined
                          }
                          imageIndex={index + 16}
                          hasOpenSeats
                        />
                      </ClassDrawer>
                    ))}
                    {coursesWithOpenSeats.length === 0 && !loading && (
                      <p className={styles.emptyMessage}>
                        No courses with open seats found.
                      </p>
                    )}
                  </ScrollableRow>
                </section>
              </>
            )}
          </Flex>
        )}

        {/* Subject Category Content (full-page catalog grid with infinite scroll) */}
        {!isForYouTab && (
          <section className={styles.section}>
            <h2 className={styles.sectionHeading}>
              {currentCategory?.label} Courses
            </h2>
            <div ref={catalogGridRef} className={styles.catalogGrid}>
              {displayedCourses.map((course, index) => (
                <Link
                  key={course.courseId}
                  to={`/catalog/${course.subject}/${course.number}`}
                  style={{ textDecoration: "none" }}
                >
                  <CatalogCard
                    subject={course.subject}
                    courseNumber={course.number}
                    title={course.title}
                    gradeDistribution={course.gradeDistribution ?? undefined}
                    imageIndex={index}
                  />
                </Link>
              ))}
              {filteredCourses.length === 0 && !loading && (
                <p className={styles.emptyMessage}>
                  No courses found in this category.
                </p>
              )}
            </div>
            {hasMoreCourses && (
              <div style={{ textAlign: "center", padding: "1rem 0" }}>
                <LoadingIndicator size="md" />
              </div>
            )}
          </section>
        )}
      </Box>
    </Box>
  );
}
