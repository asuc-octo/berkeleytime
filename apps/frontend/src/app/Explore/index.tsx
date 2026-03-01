import { useState } from "react";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { User } from "iconoir-react";
import { Link } from "react-router-dom";

import { Box, Button, Flex } from "@repo/theme";

import ClassCard from "@/components/ClassCard";
import useUser from "@/hooks/useUser";

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

  const { data, loading, error } = useQuery(GET_COURSES_EXPLORE);
  console.log("courses:", data, "error:", error);

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
            style={{ borderRadius: "999px" }}
          >
            For You
          </Button>
        </Flex>

        {activeTab === "popular" && (
          <Flex direction="column" gap="4">
            {/* Hero Banner - GradTrak feature */}
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

            <h2 className={styles.heading}>Popular Courses at UC Berkeley</h2>
            {/* 
              TODO: Replace with actual popularity metric when available.
              Currently sorted alphabetically by subject + number as placeholder
            */}
            {loading && <p>Loading...</p>}
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
              <Flex justify="center" mt="4">
                <Button
                  variant="secondary"
                  onClick={() => setShowAll(true)}
                  style={{ borderRadius: "999px" }}
                >
                  Show more ∨
                </Button>
              </Flex>
            ) : (
              <Flex justify="center" mt="4">
                <Button
                  variant="secondary"
                  onClick={() => setShowAll(false)}
                  style={{ borderRadius: "999px" }}
                >
                  Show less ∧
                </Button>
              </Flex>
            )}
          </Flex>
        )}

        {activeTab === "for-you" && (
          <Flex direction="column" gap="4">
            <h2 className={styles.heading}>For You</h2>
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
                  variant="primary"
                  onClick={() => (window.location.href = "/login")}
                >
                  Sign in →
                </Button>
              </Flex>
            ) : (
              <p>Personalized recommendations coming soon!</p>
            )}
          </Flex>
        )}
      </Box>
    </Box>
  );
}
