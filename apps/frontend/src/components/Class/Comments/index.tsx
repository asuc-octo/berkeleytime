import { Box, Container, Flex, Skeleton } from "@repo/theme";

import useClass from "@/hooks/useClass";
import { useGetCourseComments } from "@/hooks/api/courses/useReadCourse";

import CommentCard from "./CommentCard";

export default function Comments() {
  const { class: classDetails } = useClass();
  const courseId = classDetails.courseId ?? "";
  const { data: comments, loading } = useGetCourseComments(courseId, {
    skip: !courseId,
  });

  if (loading) {
    return (
      <Box p="5">
        <Container size="3">
          <Flex direction="column" gap="4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} style={{ height: 80 }} />
            ))}
          </Flex>
        </Container>
      </Box>
    );
  }

  if (!comments?.length) {
    return (
      <Box p="5">
        <Container size="3">
          <p>No comments yet.</p>
        </Container>
      </Box>
    );
  }

  return (
    <Box p="5">
      <Container size="3">
        <Flex direction="column" gap="4">
          {comments.map((comment) => (
            <CommentCard
              key={comment._id}
              content={comment.content}
              timestamp={comment.createdAt}
            />
          ))}
        </Flex>
      </Container>
    </Box>
  );
}
