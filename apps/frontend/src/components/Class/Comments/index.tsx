import { useState } from "react";

import { ChatBubble } from "iconoir-react";

import { Box, Button, Container, Flex } from "@repo/theme";

import EmptyState from "@/components/Class/EmptyState";
import useClass from "@/hooks/useClass";
import { useGetComments } from "@/hooks/api/classes/useGetComments";
import { usePostComment } from "@/hooks/api/classes/usePostComment";

import styles from "./Comments.module.scss";

export default function Comments() {
  const { class: _class } = useClass();
  const [newComment, setNewComment] = useState("");

  // Fetch comments using the GraphQL query
  const { data, loading, refetch } = useGetComments(
    _class.subject,
    _class.courseNumber
  );

  // Post comment mutation
  const [postComment, { loading: posting }] = usePostComment();

  const comments = data?.getComments ?? [];

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      return;
    }

    try {
      await postComment({
        variables: {
          subject: _class.subject,
          courseNumber: _class.courseNumber,
          text: newComment.trim(),
        },
      });

      setNewComment("");
      refetch(); // Refresh comments after posting
    } catch (error) {
      console.error("Failed to post comment:", error);
      // TODO: Show error toast to user
    }
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return "";
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  if (loading) {
    return <EmptyState heading="Loading Comments" loading />;
  }

  return (
    <Box p="5">
      <Container size="3">
        <Flex direction="column" gap="5">
          {/* Comment input section */}
          <div className={styles.commentInput}>
            <p className={styles.label}>Add a Comment</p>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleSubmitComment();
                }
              }}
              placeholder="Share your thoughts about this class... (Cmd/Ctrl + Enter to submit)"
              className={styles.textarea}
              rows={4}
            />
            <Flex justify="end" mt="3">
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || posting}
              >
                {posting ? "Posting..." : "Post Comment"}
              </Button>
            </Flex>
          </div>

          {/* Comments list section */}
          <div className={styles.commentsSection}>
            <p className={styles.label}>
              {comments.length > 0
                ? `Comments (${comments.length})`
                : "No comments yet"}
            </p>

            {comments.length === 0 ? (
              <EmptyState
                icon={<ChatBubble width={32} height={32} />}
                heading="No Comments Yet"
                paragraph="Be the first to share your thoughts about this class!"
              />
            ) : (
              <div className={styles.commentsList}>
                {comments.map((comment) => (
                  <div key={comment.id} className={styles.commentCard}>
                    <Flex direction="column" gap="2">
                      <Flex justify="between" align="center">
                        {comment.userEmail && (
                          <span className={styles.commentEmail}>
                            {comment.userEmail}
                          </span>
                        )}
                        {comment.timestamp && (
                          <span className={styles.commentTimestamp}>
                            {formatTimestamp(comment.timestamp)}
                          </span>
                        )}
                      </Flex>
                      <p className={styles.commentText}>{comment.text}</p>
                    </Flex>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Flex>
      </Container>
    </Box>
  );
}

// import { useState } from "react";

// import { ChatBubble } from "iconoir-react";

// import { Box, Button, Container, Flex } from "@repo/theme";

// import EmptyState from "@/components/Class/EmptyState";
// import useClass from "@/hooks/useClass";
// import { useGetComments } from "@/hooks/api/classes/useGetComments";
// import { usePostComment } from "@/hooks/api/classes/usePostComment";

// import styles from "./Comments.module.scss";

// export default function Comments() {
//   const { class: _class } = useClass();
//   const [newComment, setNewComment] = useState("");

//   // Fetch comments using the GraphQL query
//   const { data, loading, refetch } = useGetComments(
//     _class.subject,
//     _class.courseNumber
//   );

//   // Post comment mutation
//   const [postComment, { loading: posting }] = usePostComment();

//   const comments = data?.getComments ?? [];

//   const handleSubmitComment = async () => {
//     if (!newComment.trim()) {
//       return;
//     }

//     try {
//       await postComment({
//         variables: {
//           subject: _class.subject,
//           courseNumber: _class.courseNumber,
//           text: newComment.trim(),
//         },
//       });

//       setNewComment("");
//       refetch(); // Refresh comments after posting
//     } catch (error) {
//       console.error("Failed to post comment:", error);
//       // TODO: Show error toast to user
//     }
//   };

//   const formatTimestamp = (timestamp?: string) => {
//     if (!timestamp) return "";
    
//     const date = new Date(timestamp);
//     const now = new Date();
//     const diffMs = now.getTime() - date.getTime();
//     const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

//     if (diffDays === 0) {
//       return "Today";
//     } else if (diffDays === 1) {
//       return "Yesterday";
//     } else if (diffDays < 7) {
//       return `${diffDays} days ago`;
//     } else {
//       return date.toLocaleDateString("en-US", {
//         month: "short",
//         day: "numeric",
//         year: "numeric",
//       });
//     }
//   };

//   if (loading) {
//     return <EmptyState heading="Loading Comments" loading />;
//   }

//   return (
//     <Box p="5">
//       <Container size="3">
//         <Flex direction="column" gap="5">
//           {/* Comment input section */}
//           <div className={styles.commentInput}>
//             <p className={styles.label}>Add a Comment</p>
//             <textarea
//               value={newComment}
//               onChange={(e) => setNewComment(e.target.value)}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
//                   e.preventDefault();
//                   handleSubmitComment();
//                 }
//               }}
//               placeholder="Share your thoughts about this class... (Cmd/Ctrl + Enter to submit)"
//               className={styles.textarea}
//               rows={4}
//             />
//             <Flex justify="end" mt="3">
//               <Button
//                 onClick={handleSubmitComment}
//                 disabled={!newComment.trim() || posting}
//               >
//                 {posting ? "Posting..." : "Post Comment"}
//               </Button>
//             </Flex>
//           </div>

//           {/* Comments list section */}
//           <div className={styles.commentsSection}>
//             <p className={styles.label}>
//               {comments.length > 0
//                 ? `Comments (${comments.length})`
//                 : "No comments yet"}
//             </p>

//             {comments.length === 0 ? (
//               <EmptyState
//                 icon={<ChatBubble width={32} height={32} />}
//                 heading="No Comments Yet"
//                 paragraph="Be the first to share your thoughts about this class!"
//               />
//             ) : (
//               <div className={styles.commentsList}>
//                 {comments.map((comment) => (
//                   <div key={comment.id} className={styles.commentCard}>
//                     <Flex direction="column" gap="2">
//                       <Flex justify="between" align="center">
//                         {comment.userEmail && (
//                           <span className={styles.commentEmail}>
//                             {comment.userEmail}
//                           </span>
//                         )}
//                         {comment.timestamp && (
//                           <span className={styles.commentTimestamp}>
//                             {formatTimestamp(comment.timestamp)}
//                           </span>
//                         )}
//                       </Flex>
//                       <p className={styles.commentText}>{comment.text}</p>
//                     </Flex>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </Flex>
//       </Container>
//     </Box>
//   );
// }