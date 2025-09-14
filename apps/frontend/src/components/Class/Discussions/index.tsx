import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { Trash } from "iconoir-react";
import { Box, Button, Flex, Text, IconButton } from "@repo/theme";
import useClass from "@/hooks/useClass";
import { useReadUser } from "@/hooks/api";
import { 
  GET_DISCUSSIONS_BY_CLASS, 
  CREATE_DISCUSSION, 
  DELETE_DISCUSSION, 
  IDiscussion 
} from "@/lib/api/discussions";
import styles from "./Discussions.module.scss";

export default function Discussions() {
  const { class: currentClass } = useClass();
  const { data: user } = useReadUser();
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const classId =
    currentClass &&
    [
      currentClass.year,
      currentClass.semester,
      currentClass.subject,
      currentClass.courseNumber,
      currentClass.number,
    ].every(Boolean)
      ? `${currentClass.year}-${currentClass.semester}-${currentClass.subject}-${currentClass.courseNumber}-${currentClass.number}`
      : null;

  const { data, loading, error, refetch: refetchDiscussions } = useQuery(
    GET_DISCUSSIONS_BY_CLASS,
    {
      variables: classId ? { classId } : undefined,
      skip: !classId,
      fetchPolicy: "cache-and-network",
      onError: (e) => console.error("GET_DISCUSSIONS_BY_CLASS error:", e),
    }
  );

  const discussions: IDiscussion[] = data?.discussionsByClass ?? [];

  const [createDiscussion] = useMutation(CREATE_DISCUSSION, {
    update(cache, { data }) {
      const newItem = data?.createDiscussion as IDiscussion | undefined;
      if (!newItem || !classId) return;

      const existing = cache.readQuery<{ discussionsByClass: IDiscussion[] }>({
        query: GET_DISCUSSIONS_BY_CLASS,
        variables: { classId },
      });

      if (!existing?.discussionsByClass) return;

      cache.writeQuery({
        query: GET_DISCUSSIONS_BY_CLASS,
        variables: { classId },
        data: {
          discussionsByClass: [newItem, ...existing.discussionsByClass],
        },
      });
    },
    onCompleted: () => {
      setNewComment("");
      setIsSubmitting(false);
    },
    onError: (e) => {
      console.error("CREATE_DISCUSSION error:", e);
      setIsSubmitting(false);
    },
  });

  const [deleteDiscussion] = useMutation(DELETE_DISCUSSION, {
    update(cache, { data }, { variables }) {
      if (!data?.deleteDiscussion || !classId || !variables?.id) return;

      const existing = cache.readQuery<{ discussionsByClass: IDiscussion[] }>({
        query: GET_DISCUSSIONS_BY_CLASS,
        variables: { classId },
      });

      if (!existing?.discussionsByClass) return;

      cache.writeQuery({
        query: GET_DISCUSSIONS_BY_CLASS,
        variables: { classId },
        data: {
          discussionsByClass: existing.discussionsByClass.filter(
            (discussion) => discussion.id !== variables.id
          ),
        },
      });
    },
    onError: (e) => {
      console.error("DELETE_DISCUSSION error:", e);
    },
  });

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newComment.trim() || !classId || isSubmitting) return;
      setIsSubmitting(true);

       const content = newComment.trim();
       const author = user?.name || "Anonymous";

      try {
        await createDiscussion({
          variables: { content, author, classId },
        });
      } catch (err) {
        console.error("Failed to create discussion:", err);
        setIsSubmitting(false);
      }
    },
    [newComment, classId, isSubmitting, createDiscussion]
  );

  const handleDelete = useCallback(
    async (discussionId: string) => {
      if (!window.confirm("Are you sure you want to delete this comment?")) {
        return;
      }

      try {
        await deleteDiscussion({
          variables: { id: discussionId },
        });
      } catch (err) {
        console.error("Failed to delete discussion:", err);
      }
    },
    [deleteDiscussion]
  );

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (!classId) {
    return (
      <Box p="4" className={styles.container}>
        <Text color="gray">Select a class to view and post discussions for that class.</Text>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box p="4" className={styles.container}>
        <Text>Loading discussions...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p="4" className={styles.container}>
        <Text color="red">Error loading discussions: {error.message}</Text>
      </Box>
    );
  }

  return (
    <Box p="4" className={styles.container}>
      <h2 className={styles.heading}>Class Discussions</h2>

      {/* Add comment form */}
      <Box mb="6" className={styles.formCard}>
        <h3 className={styles.subheading}>Add a Comment</h3>
        <form onSubmit={handleSubmit}>
          <textarea
            id="comment-textarea"
            name="comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts about this class..."
            rows={4}
            className={styles.textarea}
            disabled={isSubmitting}
            required
          />
          <Flex justify="end">
            <Button type="submit" disabled={!newComment.trim() || isSubmitting}>
              {isSubmitting ? "Posting..." : "Post Comment"}
            </Button>
          </Flex>
        </form>
      </Box>

             {/* Comments list */}
             <Box>
               <h3 className={styles.listHeading}>Comments ({discussions.length})</h3>

               {discussions.length === 0 ? (
                 <Box className={styles.emptyCard}>
                   <Text color="gray">No comments for this class yet. Be the first!</Text>
                 </Box>
               ) : (
                 <Box>
                   {discussions.map((d) => (
                     <Box key={d.id} className={styles.commentCard}>
                       <div className={styles.commentHeader}>
                         <span className={styles.authorName}>
                           {d.author}
                         </span>
                         <div className={styles.commentMeta}>
                           <span className={styles.commentDate}>
                             {formatDate(d.createdAt)}
                           </span>
                           {user && d.author === user.name && (
                             <button
                               className={styles.deleteButton}
                               onClick={() => handleDelete(d.id)}
                               title="Delete comment"
                             >
                               <Trash />
                             </button>
                           )}
                         </div>
                       </div>
                       <div className={styles.commentContent}>
                         {d.content}
                       </div>
                     </Box>
                   ))}
                 </Box>
               )}
             </Box>
    </Box>
  );
}
