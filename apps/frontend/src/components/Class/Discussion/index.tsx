import { useState } from "react";
import useClass from "@/hooks/useClass";
import { useReadUser } from "@/hooks/api";
import { Flex } from "@repo/theme";
import styles from "./Discussion.module.scss";
import { gql, useQuery, useMutation } from "@apollo/client";

const DISCUSSIONS_QUERY = gql`
  query Discussions($courseSubject: String!, $courseNumber: String!) {
    discussions(courseSubject: $courseSubject, courseNumber: $courseNumber) {
      userId
      comment
      timestamp
    }
  }
`;
  const CREATE_COMMENT_MUTATION = gql`
    mutation CreateComment($courseSubject: String!, $courseNumber: String!, $userId: String!, $comment: String!, $timestamp: String!) {
      createComment(courseSubject: $courseSubject, courseNumber: $courseNumber, userId: $userId, comment: $comment, timestamp: $timestamp) {
        courseSubject
        courseNumber
      }
    }
  `;

export const useReadDiscussions = (
  courseSubject: string,
  courseNumber: string,
  options?: Omit<any, "variables">
) => {
  const query = useQuery(DISCUSSIONS_QUERY, {
    ...options,
    variables: { courseSubject, courseNumber },
    fetchPolicy: "network-only"
  });
  return {
    ...query,
    comments: query.data?.discussions,
  };
};

export default function Discussion() {
  const { class: _class } = useClass();
  const subject = _class.subject;
  const courseNumber = _class.courseNumber;
  const { data: user } = useReadUser();

  const { comments, loading, error, ...query } = useReadDiscussions(subject, courseNumber);
  const [input, setInput] = useState("");

  const [createComment, { loading: creating }] = useMutation(CREATE_COMMENT_MUTATION);

  const handleSend = async () => {
    if (!input.trim() || !user) return;
    const userId = user?.email || "anonymous";
    const timestamp = new Date().toISOString().slice(0, 10);
    try {
      await createComment({
        variables: {
          courseSubject: subject,
          courseNumber,
          userId,
          comment: input,
          timestamp,
        },
      });
      setInput("");
      query.refetch && query.refetch();
    } catch (err) {
      console.error("Error creating comment:", err);
    }
  };

  return (
    <div className={styles.discussionContainer}>
      <div className={styles.commentList}>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error loading comments.</div>
        ) : comments && comments.length > 0 ? (
          [...comments]
            .sort((a, b) => (a.timestamp < b.timestamp ? 1 : a.timestamp > b.timestamp ? -1 : 0))
            .map((c: any, i: number) => (
              <div key={i} className={styles.commentBox}>
                <Flex justify="between" align="center">
                  <span className={styles.user}>{c.userId}</span>
                  <span className={styles.timestamp}>{c.timestamp}</span>
                </Flex>
                <div className={styles.commentText}>{c.comment}</div>
              </div>
            ))
        ) : (
          <div>No comments yet.</div>
        )}
      </div>
      <div className={styles.chatbox}>
        <input
          className={styles.input}
          type="text"
          placeholder="Type your comment..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") handleSend();
          }}
          disabled={creating}
        />
        <button className={styles.button} onClick={handleSend} disabled={creating || !user}>
          {creating ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}