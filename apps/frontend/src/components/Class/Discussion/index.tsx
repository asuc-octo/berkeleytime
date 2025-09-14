import { useCallback, useEffect, useState } from "react";

import { useMutation } from "@apollo/client";
import { Send, Trash } from "iconoir-react";

import { Box, Button, Container, Flex, Text } from "@repo/theme";

import { useReadUser } from "@/hooks/api";
import useClass from "@/hooks/useClass";
import {
  ADD_DISCUSSION,
  DELETE_DISCUSSION,
  IDiscussion,
} from "@/lib/api/discussions";

import styles from "./Discussion.module.scss";

export default function Discussion() {
  const { class: _class } = useClass();
  const { data: userData } = useReadUser();
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manualDiscussions, setManualDiscussions] = useState<IDiscussion[]>([]);
  const [isFetchingManual, setIsFetchingManual] = useState(true); // Start with loading state
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const [lastFetchedKey, setLastFetchedKey] = useState<string>("");

  // Workaround: Use direct fetch instead of Apollo useQuery
  // This bypasses Apollo's cache issues
  useEffect(() => {
    if (!_class) {
      return;
    }

    // Extract expected values from URL
    const pathParts = window.location.pathname.split("/");
    const urlCourseNumber = pathParts[5]; // e.g., "1A" or "C162"
    const urlClassNumber = pathParts[6]; // e.g., "001"

    // Check if class data matches URL (to avoid fetching with stale data)
    if (
      _class.courseNumber !== urlCourseNumber ||
      _class.number !== urlClassNumber
    ) {
      // Don't fetch with wrong data
      return;
    }

    if (
      !_class.year ||
      !_class.semester ||
      !_class.subject ||
      !_class.courseNumber ||
      !_class.number
    ) {
      return;
    }

    // Create a unique key for this class
    const classKey = `${_class.year}-${_class.semester}-${_class.subject}-${_class.courseNumber}-${_class.number}`;

    // Skip if we already fetched this exact class
    if (classKey === lastFetchedKey) {
      return;
    }

    // Wait a bit to ensure class data is stable (handles race condition)
    const stabilityTimer = setTimeout(() => {
      // Double-check the class data still matches after delay
      if (
        _class.courseNumber !== urlCourseNumber ||
        _class.number !== urlClassNumber
      ) {
        return;
      }

      // Reset discussions when class changes
      setManualDiscussions([]);
      setIsFetchingManual(true);
      setLastFetchedKey(classKey);

      // Use _class directly like in onCompleted
      const requestVariables = {
        year: _class.year,
        semester: _class.semester,
        sessionId: "1",
        subject: _class.subject,
        courseNumber: _class.courseNumber,
        classNumber: _class.number, // This is correct - classNumber should be "001"
      };

      // Direct fetch to bypass Apollo completely
      fetch("/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `query GetDiscussionsByClass($year: Int!, $semester: Semester!, $sessionId: SessionIdentifier, $subject: String!, $courseNumber: CourseNumber!, $classNumber: ClassNumber!) {
          discussionsByClass(
            year: $year
            semester: $semester
            sessionId: $sessionId
            subject: $subject
            courseNumber: $courseNumber
            classNumber: $classNumber
          ) {
            discussionId
            classId
            userId
            content
            timestamp
            parentId
            user {
              email
            }
          }
        }`,
          variables: requestVariables,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.data?.discussionsByClass) {
            setManualDiscussions(data.data.discussionsByClass);
          } else {
            setManualDiscussions([]);
          }
          setIsFetchingManual(false);
          setHasFetchedOnce(true);
        })
        .catch((err) => {
          console.error("Direct fetch error:", err);
          setManualDiscussions([]);
          setIsFetchingManual(false);
          setHasFetchedOnce(true);
        });
    }, 200); // 200ms delay to wait for stable data

    return () => clearTimeout(stabilityTimer);
  }, [_class, hasFetchedOnce, lastFetchedKey]);

  // Always use "1" as sessionId for now since the backend expects it
  const normalizedSessionId = "1";

  const [addDiscussion] = useMutation(ADD_DISCUSSION, {
    onCompleted: async () => {
      setComment("");
      setIsSubmitting(false);

      // Refetch discussions using our manual fetch method
      if (_class) {
        fetch("/api/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `query GetDiscussionsByClass($year: Int!, $semester: Semester!, $sessionId: SessionIdentifier, $subject: String!, $courseNumber: CourseNumber!, $classNumber: ClassNumber!) {
              discussionsByClass(
                year: $year
                semester: $semester
                sessionId: $sessionId
                subject: $subject
                courseNumber: $courseNumber
                classNumber: $classNumber
              ) {
                discussionId
                classId
                userId
                content
                timestamp
                parentId
                user {
                  email
                }
              }
            }`,
            variables: {
              year: _class.year,
              semester: _class.semester,
              sessionId: "1",
              subject: _class.subject,
              courseNumber: _class.courseNumber,
              classNumber: _class.number,
            },
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.data?.discussionsByClass) {
              setManualDiscussions(data.data.discussionsByClass);
            }
          });
      }
    },
    onError: (error) => {
      console.error("Error adding discussion:", error);
      alert(`Error posting comment: ${error.message}`);
      setIsSubmitting(false);
    },
  });

  const [deleteDiscussion] = useMutation(DELETE_DISCUSSION, {
    onCompleted: () => {
      // Refetch discussions after delete
      window.location.reload();
    },
    onError: (error) => {
      console.error("Error deleting discussion:", error);
    },
  });

  const handleSubmit = useCallback(async () => {
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      await addDiscussion({
        variables: {
          year: _class.year,
          semester: _class.semester,
          sessionId: normalizedSessionId,
          subject: _class.subject,
          courseNumber: _class.courseNumber,
          classNumber: _class.number,
          content: comment.trim(),
        },
      });
    } catch (error) {
      console.error("Failed to add discussion:", error);
      setIsSubmitting(false);
    }
  }, [comment, _class, addDiscussion, normalizedSessionId]);

  const handleDelete = useCallback(
    async (discussionId: string) => {
      if (window.confirm("Are you sure you want to delete this comment?")) {
        await deleteDiscussion({
          variables: {
            discussionId,
          },
        });
      }
    },
    [deleteDiscussion]
  );

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString();
  };

  // Always use manual fetch
  const discussions: IDiscussion[] = manualDiscussions;
  const currentUserEmail = userData?.email;

  return (
    <Box p="5">
      <Container size="3">
        <Flex direction="column" gap="5">
          {/* Comment Input Section */}
          <Box className={styles.inputCard}>
            <Flex direction="column" gap="3">
              <Text size="3" weight="medium">
                Add a Comment
              </Text>
              <textarea
                placeholder="Share your thoughts about this class..."
                value={comment}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setComment(e.target.value)
                }
                className={styles.textArea}
                disabled={isSubmitting}
              />
              <Flex justify="end">
                <Button
                  onClick={handleSubmit}
                  disabled={!comment.trim() || isSubmitting}
                  className={styles.submitButton}
                >
                  <Send />
                  {isSubmitting ? "Posting..." : "Post Comment"}
                </Button>
              </Flex>
            </Flex>
          </Box>

          <Box className={styles.separator} />

          {/* Comments List Section */}
          <Flex direction="column" gap="3">
            {isFetchingManual ? (
              <Text size="3" weight="medium">
                Loading comments...
              </Text>
            ) : (
              <Text size="3" weight="medium">
                {discussions.length} Comment
                {discussions.length !== 1 ? "s" : ""}
              </Text>
            )}

            {!isFetchingManual &&
              hasFetchedOnce &&
              discussions.length === 0 && (
                <Box className={styles.emptyState}>
                  <Text>
                    No comments yet. Be the first to share your thoughts!
                  </Text>
                </Box>
              )}

            {isFetchingManual ? (
              <Box className={styles.emptyState}>
                <Text>Loading discussions...</Text>
              </Box>
            ) : (
              discussions.map((discussion) => (
                <Box
                  key={discussion.discussionId}
                  className={styles.commentCard}
                >
                  <Flex direction="column" gap="2">
                    <Flex justify="between" align="start">
                      <Flex direction="column" gap="1">
                        <Text
                          size="2"
                          weight="medium"
                          className={styles.userEmail}
                        >
                          {discussion.user?.email || "Anonymous"}
                        </Text>
                        <Text size="1" className={styles.timestamp}>
                          {formatTimestamp(discussion.timestamp)}
                        </Text>
                      </Flex>
                      {currentUserEmail &&
                        discussion.user?.email === currentUserEmail && (
                          <Button
                            variant="tertiary"
                            size="1"
                            onClick={() =>
                              handleDelete(discussion.discussionId)
                            }
                            className={styles.deleteButton}
                          >
                            <Trash />
                          </Button>
                        )}
                    </Flex>
                    <Text className={styles.content}>{discussion.content}</Text>
                  </Flex>
                </Box>
              ))
            )}
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
}
