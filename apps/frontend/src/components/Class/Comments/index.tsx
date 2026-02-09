import { FormEvent, useState } from "react";

import {
  Box,
  Button,
  Container,
  Flex,
  Input,
  LoadingIndicator,
  Skeleton,
  Text,
} from "@repo/theme";

import { useCreateComment } from "@/hooks/api/courses/useCreateComment";
import { useGetCourseComments } from "@/hooks/api/courses/useReadCourse";
import useClass from "@/hooks/useClass";

import CommentCard from "./CommentCard";

export default function Comments() {
  const { class: classDetails } = useClass();
  const courseId = classDetails.courseId ?? "";
  const { data: comments, loading } = useGetCourseComments(courseId, {
    skip: !courseId,
  });
  const [createComment, { loading: submitting }] = useCreateComment();
  const [content, setContent] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !courseId) return;

    try {
      await createComment({ courseId, content: content.trim() });
      setContent("");
    } catch (error) {
      console.error("Error creating comment:", error);
    }
  };

  return (
    <Box p="5">
      <Container size="3">
        <Flex direction="column" gap="4">
          {courseId && (
            <form onSubmit={handleSubmit}>
              <Flex direction="column" gap="2">
                <Flex gap="2" align="end" wrap="wrap">
                  <Input
                    id="new-comment"
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write a comment..."
                    disabled={submitting}
                    style={{ flex: "1 1 200px" }}
                  />
                  <Button
                    type="submit"
                    disabled={submitting || !content.trim()}
                  >
                    <LoadingIndicator loading={submitting}>Post</LoadingIndicator>
                  </Button>
                </Flex>
              </Flex>
            </form>
          )}

          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} style={{ height: 80 }} />
              ))}
            </>
          ) : !comments?.length ? (
            <Text>No comments yet.</Text>
          ) : (
            comments.map((comment) => (
              <CommentCard
                key={comment._id}
                content={comment.content}
                timestamp={comment.createdAt}
              />
            ))
          )}
        </Flex>
      </Container>
    </Box>
  );
}
