import { useEffect, useMemo, useState } from "react";

import { gql } from "@apollo/client";
import { useApolloClient, useQuery } from "@apollo/client/react";
import { Link, useNavigate } from "react-router-dom";

import { Box, Button, Flex, Skeleton } from "@repo/theme";

import CatalogCard from "@/components/CatalogCard";
import ClassCard from "@/components/ClassCard";
import ClassCardSkeleton from "@/components/ClassCard/Skeleton";
import ScrollableRow from "@/components/ScrollableRow";
import { useReadTerms } from "@/hooks/api";
import { useGetAllCollectionsWithPreview } from "@/hooks/api/collections";
import useUser from "@/hooks/useUser";
import { signIn } from "@/lib/api";
import { GET_CLASS } from "@/lib/api/classes";
import { EXPLORE_SNAPSHOT_ROW_LIMIT } from "@/lib/api/explore";
import {
  GetExploreBecauseYouViewedDocument,
  GetExploreCuratedHandpickDocument,
  GetExplorePopularDocument,
  type GetExplorePopularQuery,
  GetExploreTopPicksDocument,
  Semester,
} from "@/lib/generated/graphql";
import { RecentType, getRecents } from "@/lib/recent";

import { CollectionCard } from "../Profile/Bookmarks/CollectionCard";
import styles from "./Explore.module.scss";
import placeholderStyles from "./ExplorePlaceholder.module.scss";
import { ExploreRail } from "./ExploreRail";

type ExploreSnap = NonNullable<
  GetExplorePopularQuery["explorePopularCourses"]
>[number];
type CourseAnchor = { subject: string; number: string; title?: string };
type CourseCrossListingQuery = {
  course: null | {
    courseId: string;
    title?: string;
    crossListing: Array<{ subject: string; number: string }>;
  };
};
type RecentClassCardQuery = {
  class: null | {
    subject: string;
    courseNumber: string;
    number: string;
    title?: string | null;
    unitsMin?: number | null;
    unitsMax?: number | null;
    course?: {
      title?: string | null;
      gradeDistribution?: { average?: number | null; pnpPercentage?: number | null };
      aggregatedRatings?: {
        metrics: Array<{
          metricName: string;
          count?: number | null;
          weightedAverage: number;
        }>;
      } | null;
    } | null;
    primarySection?: {
      enrollment?: {
        latest?: {
          enrolledCount?: number | null;
          maxEnroll?: number | null;
          activeReservedMaxCount?: number | null;
        } | null;
      } | null;
    } | null;
  };
};

const GET_COURSE_CROSS_LISTING = gql`
  query GetCourseCrossListing($subject: String!, $number: CourseNumber!) {
    course(subject: $subject, number: $number) {
      courseId
      title
      crossListing {
        subject
        number
      }
    }
  }
`;

/** Matches catalog default-term ordering (see Catalog/index.tsx). */
const SEMESTER_ORDER: Record<string, number> = {
  [Semester.Spring]: 0,
  [Semester.Summer]: 1,
  [Semester.Fall]: 2,
  [Semester.Winter]: 3,
};

const DEFAULT_CATALOG_CLASS_NUMBER = "001";
const DEFAULT_CATALOG_SESSION_ID = "1";

function buildCatalogClassPath(
  term: { year: number; semester: string },
  subject: string,
  catalogCourseNumber: string
) {
  const semester = String(term.semester);
  return `/catalog/${term.year}/${semester}/${subject}/${catalogCourseNumber}/${DEFAULT_CATALOG_CLASS_NUMBER}/${DEFAULT_CATALOG_SESSION_ID}`;
}

function buildCatalogSpecificClassPath(recentClass: {
  year: number;
  semester: string;
  subject: string;
  courseNumber: string;
  number: string;
  sessionId?: string;
}) {
  return `/catalog/${recentClass.year}/${recentClass.semester}/${recentClass.subject}/${recentClass.courseNumber}/${recentClass.number}/${recentClass.sessionId ?? DEFAULT_CATALOG_SESSION_ID}`;
}

function formatEnrollmentPercent(
  enrolled: number | null | undefined,
  max: number | null | undefined
): string | null {
  if (enrolled == null || max == null || max <= 0) return null;
  return `${Math.round((enrolled / max) * 100)}% enrolled`;
}

function getEnrollmentPercentColor(
  enrolled: number | null | undefined,
  max: number | null | undefined
): string | null {
  if (enrolled == null || max == null || max <= 0) return null;
  const pct = Math.round((enrolled / max) * 100);
  if (pct >= 90) return "var(--rose-500)";
  if (pct >= 70) return "var(--yellow-500)";
  return "var(--emerald-500)";
}

function formatUnits(
  unitsMin: number | null | undefined,
  unitsMax: number | null | undefined
): string | null {
  if (unitsMin == null || unitsMax == null) return null;
  if (unitsMin === unitsMax) return `${unitsMin} ${unitsMin === 1 ? "unit" : "units"}`;
  return `${unitsMin}-${unitsMax} units`;
}

const IMG = { popular: 22, curated: 44 } as const;
const EXPLORE_SKELETON_CARD_COUNT = 6;

function SnapshotCarouselSkeleton({
  count = EXPLORE_SKELETON_CARD_COUNT,
}: {
  count?: number;
}) {
  return (
    <ScrollableRow>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`explore-skeleton-${index}`}
          className={styles.cardLink}
          aria-hidden
        >
          <div className={styles.skeletonCard}>
            <div className={styles.skeletonImage} />
            <div className={styles.skeletonContent}>
              <Skeleton className={styles.skeletonTitle} />
              <Skeleton className={styles.skeletonSubtitle} />
            </div>
          </div>
        </div>
      ))}
    </ScrollableRow>
  );
}

function SnapshotCarousel({
  courses,
  catalogTerm,
  imageSeed,
}: {
  courses: ExploreSnap[];
  catalogTerm: { year: number; semester: string };
  imageSeed: number;
}) {
  if (courses.length === 0) return null;
  return (
    <ScrollableRow>
      {courses.map((course, index) => (
        <Link
          key={course.courseId}
          to={buildCatalogClassPath(catalogTerm, course.subject, course.number)}
          className={styles.cardLink}
        >
          <CatalogCard
            subject={course.subject}
            courseNumber={course.number}
            title={course.title}
            gradeDistribution={
              course.gradeAverage != null
                ? { average: course.gradeAverage }
                : undefined
            }
            imageUrl={course.imageUrl ?? undefined}
            imageIndex={imageSeed + index}
          />
        </Link>
      ))}
    </ScrollableRow>
  );
}

type CatalogTerm = { year: number; semester: string };

function BecauseYouViewedRail({
  anchor,
  catalogTerm,
  imageSeed,
}: {
  anchor: CourseAnchor;
  catalogTerm: CatalogTerm;
  imageSeed: number;
}) {
  const { data, loading } = useQuery(GetExploreBecauseYouViewedDocument, {
    variables: {
      subject: anchor.subject,
      courseNumber: anchor.number,
      year: catalogTerm.year,
      semester: catalogTerm.semester,
      limit: EXPLORE_SNAPSHOT_ROW_LIMIT,
    },
    fetchPolicy: "network-only",
  });

  const courses = data?.exploreBecauseYouViewed ?? [];

  if (!loading && courses.length === 0) return null;

  return (
    <ExploreRail
      title={`Because you viewed ${anchor.subject} ${anchor.number}${anchor.title ? `: ${anchor.title}` : ""}`}
    >
      {loading ? (
        <SnapshotCarouselSkeleton />
      ) : (
        <SnapshotCarousel
          courses={courses}
          catalogTerm={catalogTerm}
          imageSeed={imageSeed}
        />
      )}
    </ExploreRail>
  );
}

function TopPicksRail({
  history,
  catalogTerm,
}: {
  history: Array<{ subject: string; number: string }>;
  catalogTerm: CatalogTerm;
}) {
  const { data, loading } = useQuery(GetExploreTopPicksDocument, {
    variables: {
      history: history.map((h) => ({
        subject: h.subject,
        courseNumber: h.number,
      })),
      year: catalogTerm.year,
      semester: catalogTerm.semester,
      limit: EXPLORE_SNAPSHOT_ROW_LIMIT,
    },
    skip: history.length === 0,
    fetchPolicy: "network-only",
  });

  const courses = data?.exploreTopPicks ?? [];

  return (
    <ExploreRail title="Top picks for you">
      {loading ? (
        <SnapshotCarouselSkeleton />
      ) : courses.length > 0 ? (
        <SnapshotCarousel
          courses={courses}
          catalogTerm={catalogTerm}
          imageSeed={0}
        />
      ) : (
        <p className={placeholderStyles.placeholderBlurb}>
          View some courses in the catalog to get personalized picks here.
        </p>
      )}
    </ExploreRail>
  );
}

const BECAUSE_VIEWED_RECENT_WINDOW = 20;
const BECAUSE_VIEWED_ROW_COUNT = 5;

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = t;
  }
  return copy;
}

function sampleUpTo<T>(items: readonly T[], k: number): T[] {
  return shuffle([...items]).slice(0, Math.min(k, items.length));
}

function anchorKey(anchor: CourseAnchor): string {
  return `${anchor.subject}::${anchor.number}`;
}

function pickBecauseAnchors(
  pool: ReadonlyArray<CourseAnchor>,
  canonicalByAnchor: Map<string, string>
): CourseAnchor[] {
  if (pool.length === 0) return [];
  const shuffled = shuffle([...pool]);
  const seenCanonicals = new Set<string>();
  const chosen: CourseAnchor[] = [];
  for (const anchor of shuffled) {
    const key = anchorKey(anchor);
    const canonical = canonicalByAnchor.get(key) ?? key;
    if (seenCanonicals.has(canonical)) continue;
    seenCanonicals.add(canonical);
    chosen.push(anchor);
    if (chosen.length >= BECAUSE_VIEWED_ROW_COUNT) break;
  }
  return chosen;
}

export default function Explore() {
  const apolloClient = useApolloClient();
  const navigate = useNavigate();
  const { user } = useUser();
  const { data: terms } = useReadTerms();
  const { data: apiCollections } = useGetAllCollectionsWithPreview();
  const [becauseAnchors, setBecauseAnchors] = useState<CourseAnchor[]>([]);
  const [recentClassMeta, setRecentClassMeta] = useState<
    Record<string, NonNullable<RecentClassCardQuery["class"]>>
  >({});
  const [recentClassesLoading, setRecentClassesLoading] = useState(false);

  const latestCatalogTerm = useMemo(() => {
    if (!terms?.length) return null;
    return terms.toSorted((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      const bo = SEMESTER_ORDER[b.semester] ?? -1;
      const ao = SEMESTER_ORDER[a.semester] ?? -1;
      return bo - ao;
    })[0];
  }, [terms]);

  const catalogRouteTerm = latestCatalogTerm ?? {
    year: new Date().getFullYear(),
    semester: Semester.Spring,
  };

  const { data: popularData, loading: popularLoading } = useQuery(
    GetExplorePopularDocument,
    {
      variables: { limit: EXPLORE_SNAPSHOT_ROW_LIMIT },
      fetchPolicy: "network-only",
    }
  );

  const { data: handpickData, loading: handpickLoading } = useQuery(
    GetExploreCuratedHandpickDocument
  );

  const popularCourses =
    popularData?.explorePopularCourses?.filter(Boolean) ?? [];

  const handpickPool = useMemo(
    () => handpickData?.exploreCuratedHandpickedCourses?.filter(Boolean) ?? [],
    [handpickData?.exploreCuratedHandpickedCourses]
  );

  const handpickedCourses = useMemo(
    () => sampleUpTo(handpickPool, EXPLORE_SNAPSHOT_ROW_LIMIT),
    [handpickPool]
  );
  const topPicksHistory = useMemo(() => getRecents(RecentType.Course), []);
  const recentClasses = useMemo(
    () => getRecents(RecentType.Class).slice(0, 6),
    []
  );
  const allSavedCollection = useMemo(
    () => apiCollections?.find((collection) => collection.isSystem),
    [apiCollections]
  );
  const bookmarkPreviewClasses = useMemo(
    () =>
      (allSavedCollection?.classes ?? [])
        .filter((entry) => entry.class != null)
        .slice(0, 2)
        .map((entry) => ({
          subject: entry.class!.subject,
          courseNumber: entry.class!.courseNumber,
          number: entry.class!.number,
          title: entry.class!.title ?? entry.class!.course?.title ?? null,
          gradeAverage:
            entry.class!.gradeDistribution?.average ??
            entry.class!.course?.gradeDistribution?.average ??
            null,
          enrolledCount:
            entry.class!.primarySection?.enrollment?.latest?.enrolledCount ??
            null,
          maxEnroll:
            entry.class!.primarySection?.enrollment?.latest?.maxEnroll ?? null,
          unitsMin: entry.class!.unitsMin,
          unitsMax: entry.class!.unitsMax,
          hasReservedSeats:
            (entry.class!.primarySection?.enrollment?.latest
              ?.activeReservedMaxCount ?? 0) > 0,
        })),
    [allSavedCollection?.classes]
  );

  useEffect(() => {
    const pool = getRecents(RecentType.Course).slice(
      0,
      BECAUSE_VIEWED_RECENT_WINDOW
    );
    if (pool.length === 0) {
      setBecauseAnchors([]);
      return;
    }

    let cancelled = false;

    const fetchCanonicals = async () => {
      const canonicalByAnchor = new Map<string, string>();
      const titleByAnchor = new Map<string, string>();
      await Promise.all(
        pool.map(async (anchor) => {
          const key = anchorKey(anchor);
          try {
            const { data } = await apolloClient.query<CourseCrossListingQuery>({
              query: GET_COURSE_CROSS_LISTING,
              variables: { subject: anchor.subject, number: anchor.number },
              fetchPolicy: "network-only",
            });
            const course = data?.course;
            const courseId = course?.courseId;
            const title = course?.title;
            if (typeof title === "string" && title.length > 0) {
              titleByAnchor.set(key, title);
            }
            if (typeof courseId === "string" && courseId.length > 0) {
              canonicalByAnchor.set(key, `courseId::${courseId}`);
              return;
            }
            const aliases = course?.crossListing ?? [];
            const aliasKeys = aliases
              .map((c: { subject?: string; number?: string }) =>
                c?.subject && c?.number ? `${c.subject}::${c.number}` : null
              )
              .filter((v: string | null): v is string => v !== null);
            aliasKeys.push(key);
            aliasKeys.sort();
            canonicalByAnchor.set(key, `cross::${aliasKeys.join("|")}`);
          } catch {
            canonicalByAnchor.set(key, key);
          }
        })
      );
      if (cancelled) return;
      setBecauseAnchors(
        pickBecauseAnchors(pool, canonicalByAnchor).map((anchor) => ({
          ...anchor,
          title: titleByAnchor.get(anchorKey(anchor)),
        }))
      );
    };

    void fetchCanonicals();
    return () => {
      cancelled = true;
    };
  }, [apolloClient]);

  useEffect(() => {
    if (recentClasses.length === 0) {
      setRecentClassMeta({});
      setRecentClassesLoading(false);
      return;
    }

    let cancelled = false;
    const loadRecentClassMeta = async () => {
      setRecentClassesLoading(true);
      const entries = await Promise.all(
        recentClasses.map(async (recentClass) => {
          const key = `${recentClass.year}::${recentClass.semester}::${recentClass.subject}::${recentClass.courseNumber}::${recentClass.number}::${recentClass.sessionId ?? ""}`;
          if (!recentClass.sessionId) return [key, null] as const;
          try {
            const { data } = await apolloClient.query<RecentClassCardQuery>({
              query: GET_CLASS,
              variables: {
                year: recentClass.year,
                semester: recentClass.semester,
                sessionId: recentClass.sessionId,
                subject: recentClass.subject,
                courseNumber: recentClass.courseNumber,
                number: recentClass.number,
              },
              fetchPolicy: "network-only",
            });
            return [key, data?.class ?? null] as const;
          } catch {
            return [key, null] as const;
          }
        })
      );
      if (cancelled) return;
      setRecentClassMeta(
        Object.fromEntries(
          entries.filter((entry): entry is [string, NonNullable<RecentClassCardQuery["class"]>] => entry[1] !== null)
        )
      );
      setRecentClassesLoading(false);
    };

    void loadRecentClassMeta();
    return () => {
      cancelled = true;
    };
  }, [apolloClient, recentClasses]);

  return (
    <Box p="6">
      <Flex direction="column" gap="6">
        <Flex mb="2" align="center" gap="6" className={styles.heroBanner}>
          <Box className={styles.heroImageContainer}>
            <img
              src="/images/ExplorePage.png"
              alt="Gradtrak preview"
              className={styles.heroImage}
            />
          </Box>
          <Flex direction="column" gap="2" className={styles.heroText}>
            <p className={styles.heroLabel}>NEW FEATURE</p>
            <h2 className={styles.heroTitle}>Major planning made easy</h2>
            <p className={styles.heroDescription}>
              Map requirements, experiment with schedules, and pair those plans
              with live enrollment data from Berkeleytime.
            </p>
            <Button
              as={Link}
              to="/gradtrak"
              variant="primary"
              style={{ width: "fit-content" }}
            >
              Explore Gradtrak
            </Button>
          </Flex>
        </Flex>

        <div className={styles.bookmarksRow}>
          <div className={styles.bookmarksCardWrapper}>
            <CollectionCard
              name="Bookmarks"
              classCount={allSavedCollection?.classes?.length ?? 0}
              isSystem
              previewClasses={bookmarkPreviewClasses}
              onClick={() => {
                if (!user) {
                  signIn();
                  return;
                }
                navigate("/profile/bookmarks");
              }}
            />
          </div>
          <div className={styles.recentlyViewedColumn}>
            <h3 className={styles.recentlyViewedTitle}>
              Classes you recently viewed
            </h3>
            {recentClasses.length === 0 ? (
              <p className={placeholderStyles.placeholderBlurb}>
                View some courses in the catalog to see them here.
              </p>
            ) : recentClassesLoading ? (
              <div className={styles.recentlyViewedGrid}>
                {Array.from({ length: 6 }).map((_, index) => (
                  <ClassCardSkeleton key={`recent-class-skeleton-${index}`} />
                ))}
              </div>
            ) : (
              <div className={styles.recentlyViewedGrid}>
                {recentClasses.map((recentClass, index) => {
                  const key = `${recentClass.year}::${recentClass.semester}::${recentClass.subject}::${recentClass.courseNumber}::${recentClass.number}::${recentClass.sessionId ?? ""}`;
                  const meta = recentClassMeta[key];
                  if (!meta) return null;
                  const enrollmentLabel = formatEnrollmentPercent(
                    meta.primarySection?.enrollment?.latest?.enrolledCount,
                    meta.primarySection?.enrollment?.latest?.maxEnroll
                  );
                  const enrollmentColor = getEnrollmentPercentColor(
                    meta.primarySection?.enrollment?.latest?.enrolledCount,
                    meta.primarySection?.enrollment?.latest?.maxEnroll
                  );
                  const unitsLabel = formatUnits(meta.unitsMin, meta.unitsMax);
                  return (
                  <Link
                    key={`${recentClass.subject}-${recentClass.courseNumber}-${recentClass.number}-${index}`}
                    to={buildCatalogSpecificClassPath(recentClass)}
                    className={styles.recentClassLink}
                  >
                    <ClassCard
                      class={{
                        subject: meta.subject,
                        courseNumber: meta.courseNumber,
                        title: meta.title ?? undefined,
                        unitsMin: meta.unitsMin ?? undefined,
                        unitsMax: meta.unitsMax ?? undefined,
                        primarySection: meta.primarySection ?? undefined,
                        course: {
                          title: meta.course?.title ?? undefined,
                          gradeDistribution:
                            meta.course?.gradeDistribution ?? undefined,
                          aggregatedRatings:
                            meta.course?.aggregatedRatings ?? undefined,
                        },
                      }}
                      mutedDescription
                      replaceInfoContent
                      infoContent={
                        <>
                          {enrollmentLabel && (
                            <span
                              className={styles.recentMetaPill}
                              style={{ color: enrollmentColor ?? undefined }}
                            >
                              {enrollmentLabel}
                            </span>
                          )}
                          {unitsLabel && (
                            <span className={styles.recentMetaPill}>
                              {unitsLabel}
                            </span>
                          )}
                        </>
                      }
                    />
                  </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <TopPicksRail
          history={topPicksHistory}
          catalogTerm={catalogRouteTerm}
        />

        {becauseAnchors.map((anchor, slot) => (
          <BecauseYouViewedRail
            key={`${anchor.subject}-${anchor.number}-${slot}`}
            anchor={anchor}
            catalogTerm={catalogRouteTerm}
            imageSeed={100 + slot * 20}
          />
        ))}

        <ExploreRail title="Highly rated on Berkeleytime">
          {popularLoading ? (
            <SnapshotCarouselSkeleton />
          ) : (
            <SnapshotCarousel
              courses={popularCourses}
              catalogTerm={catalogRouteTerm}
              imageSeed={IMG.popular}
            />
          )}
        </ExploreRail>

        {handpickLoading ? (
          <ExploreRail title="Hand-picked by the Berkeleytime team">
            <SnapshotCarouselSkeleton />
          </ExploreRail>
        ) : handpickedCourses.length > 0 ? (
          <ExploreRail title="Hand-picked by the Berkeleytime team">
            <ScrollableRow>
              {handpickedCourses.map((course: ExploreSnap, index) => (
                <Link
                  key={course.courseId}
                  to={buildCatalogClassPath(
                    catalogRouteTerm,
                    course.subject,
                    course.number
                  )}
                  className={styles.cardLink}
                >
                  <CatalogCard
                    subject={course.subject}
                    courseNumber={course.number}
                    title={course.title}
                    gradeDistribution={
                      course.gradeAverage != null
                        ? { average: course.gradeAverage }
                        : undefined
                    }
                    imageUrl={course.imageUrl ?? undefined}
                    imageIndex={IMG.curated + index}
                  />
                </Link>
              ))}
            </ScrollableRow>
          </ExploreRail>
        ) : (
          <ExploreRail title="Hand-picked by the Berkeleytime team">
            <p className={placeholderStyles.placeholderBlurb}>
              No curated courses match the latest catalog term yet—open curated
              classes to see staff pins, or check back after the schedule is
              published.
            </p>
          </ExploreRail>
        )}

      </Flex>
    </Box>
  );
}
