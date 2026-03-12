import { useState } from "react";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { User, NavArrowDown, NavArrowUp } from "iconoir-react";
import { Link, useNavigate } from "react-router-dom";

import { Box, Button, Flex, LoadingIndicator } from "@repo/theme";
import { CollectionCard } from "@/app/Profile/Bookmarks/CollectionCard";
import ClassCard from "@/components/ClassCard";
import useUser from "@/hooks/useUser";
import { useGetAllCollectionsWithPreview } from "@/hooks/api/collections";
import { signIn } from "@/lib/api";
import { RecentType, getRecents } from "@/lib/recent";

import styles from "./Explore.module.scss";

const GET_COURSES_EXPLORE = gql`
  query GetCoursesExplore {
    courses {
      courseId
      subject
      number
      title
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


type Tab = "popular" | "for-you";

export default function Explore() {
  const [activeTab, setActiveTab] = useState<Tab>("popular");
  const [showAll, setShowAll] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();
  const { data: apiCollections } = useGetAllCollectionsWithPreview();
  const allSavedCollection = apiCollections?.find(c => c.isSystem);
  const totalBookmarks = allSavedCollection?.classes?.length ?? 0;
  const { data, loading, error } = useQuery(GET_COURSES_EXPLORE);
  console.log("courses:", data, "error:", error);

  const recentCourseKeys = getRecents(RecentType.Course);
  const recentCoursesData = recentCourseKeys
    .map(({ subject, number }) =>
      data?.courses?.find(
        (c: { subject: string; number: string }) =>
          c.subject === subject && c.number === number
      )
    )
    .filter(Boolean);

  return (
    <Box p="6">
      <Box>
        <Flex gap="3" mb="6">
          <Button
            variant="secondary"
            onClick={() => setActiveTab("popular")}
            className={
              activeTab === "popular" ? styles.activeTab : styles.inactiveTab
            }
          >
            Popular
          </Button>
          <Button
            variant="secondary"
            onClick={() => setActiveTab("for-you")}
            className={
              activeTab === "for-you" ? styles.activeTab : styles.inactiveTab
            }
          >
            For You
          </Button>
        </Flex>

        {activeTab === "popular" && (
          <Flex direction="column" gap="4">
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

            <h2 className={styles.heading}>Popular Courses on Berkeleytime</h2>
            {/* 
              TODO: Replace with actual popularity metric.
              Currently sorted alphabetically by subject + number as placeholder
            */}
            {loading && <LoadingIndicator size="md" />}
            <div className={styles.courseGridWrapper}>
              <div className={styles.courseGrid}>
                {[...(data?.courses ?? [])]
                  .sort((a, b) =>
                    `${a.subject}${a.number}`.localeCompare(
                      `${b.subject}${b.number}`
                    )
                  )
                  .slice(0, showAll ? 12 : 8)
                  .map((course) => (
                    <Link
                      key={course.courseId}
                      to={`/catalog/${course.subject}/${course.number}`}
                      style={{ textDecoration: "none" }}
                    >
                      <ClassCard
                        class={{
                          subject: course.subject,
                          courseNumber: course.number,
                          title: course.title,
                          gradeDistribution:
                            course.gradeDistribution ?? undefined,
                        }}
                      />
                    </Link>
                  ))}
              </div>
              {!showAll && (data?.courses?.length ?? 0) > 4 && (
                <div className={styles.fadeOverlay} />
              )}
            </div>
            {!showAll ? (
              <Flex justify="center" mt="4" className={styles.showMoreWrapper}>
                <Button
                  variant="secondary"
                  onClick={() => setShowAll(true)}
                  className={styles.showMoreButton}
                  style={{ borderRadius: "999px" }}
                >
                  Show more <NavArrowDown width={16} height={16} />
                </Button>
              </Flex>
            ) : (
              <Flex justify="center" mt="4">
                <Button
                  variant="secondary"
                  onClick={() => setShowAll(false)}
                  className={styles.showMoreButton}
                  style={{ borderRadius: "999px" }}
                >
                  Show less <NavArrowUp width={16} height={16} />
                </Button>
              </Flex>
            )}
          </Flex>
        )}

        {activeTab === "for-you" && (
          <Flex direction="column" gap="4">
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
                <Button
                  variant="primary" onClick={() => signIn()}>
                  Sign in →
                </Button>
              </Flex>
            ) : (
              <Flex gap="6" align="flex-start" style={{ flexWrap: "wrap" }}>
                <CollectionCard
                  name="Bookmarks"
                  classCount={totalBookmarks}
                  isSystem={true}
                  previewClasses={allSavedCollection?.classes?.filter(entry => entry.class != null).slice(0, 2).map(entry => ({
                    subject: entry.class!.subject,
                    courseNumber: entry.class!.courseNumber,
                    number: entry.class!.number,
                    title: entry.class!.title ?? entry.class!.course?.title ?? null,
                    gradeAverage: entry.class!.gradeDistribution?.average ?? null,
                    enrolledCount: entry.class!.primarySection?.enrollment?.latest?.enrolledCount ?? null,
                    maxEnroll: entry.class!.primarySection?.enrollment?.latest?.maxEnroll ?? null,
                    unitsMin: entry.class!.unitsMin,
                    unitsMax: entry.class!.unitsMax,
                    hasReservedSeats: false,
                  })) ?? []}
                  onClick={() => navigate("/profile/bookmarks")}
                />

                {/* Recently viewed */}
                <Flex direction="column" gap="3" style={{ flex: 1 }}>
                  <h3 className={styles.subheading}>
                    Courses you recently viewed
                  </h3>
                  {recentCoursesData.length === 0 ? (
                    <p className={styles.signInDescription}>
                      No recently viewed courses yet. Browse the{" "}
                      <Link to="/catalog">catalog</Link> to get started.
                    </p>
                  ) : (
                    <div className={styles.recentGrid}>
                      {recentCoursesData.map((course) => (
                        <Link
                          key={course.courseId}
                          to={`/catalog/${course.subject}/${course.number}`}
                          style={{ textDecoration: "none" }}
                        >
                          <ClassCard
                            class={{
                              subject: course.subject,
                              courseNumber: course.number,
                              title: course.title,
                              gradeDistribution:
                                course.gradeDistribution ?? undefined,
                            }}
                          />
                        </Link>
                      ))}
                    </div>
                  )}
                </Flex>
              </Flex>
            )}
          </Flex>
        )}
      </Box>
    </Box>
  );
}
