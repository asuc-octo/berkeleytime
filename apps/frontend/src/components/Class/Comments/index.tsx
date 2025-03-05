import { useEffect, useState } from "react";
import { useAddComment } from "@/hooks/api/classes/useAddComment";
import { useGetComments } from "@/hooks/api/classes/useGetComments";
import useClass from "@/hooks/useClass";

import styles from "./Comments.module.scss";

export default function Comments() {
  const { class: _class } = useClass();
  const [value, setValue] = useState("");

  // Fetch comments for the class
  const { data: comments } = useGetComments(_class.subject, _class.courseNumber);

  // Mutation for adding a new comment
  const [addComment] = useAddComment();

  useEffect(() => {
    if (comments) {
      console.log("Fetched Comments:", comments);
    }
  }, [comments]);

  const userEmail = "bob@gmail.com"; // Replace with actual user email

  const handleSubmit = async () => {
    if (value.trim() !== "") {
      try {
        await addComment(_class.subject, _class.courseNumber, userEmail, value); // Pass arguments directly
        setValue(""); // Clear input after submission
      } catch (error) {
        console.error("Error submitting comment:", error);
      }
    }
  };

  return (
    <div className={styles.root}>
      <label htmlFor="text-input">Make a new comment:</label>
      <input
        id="text-input"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={styles.input}
        placeholder="Say anything..."
      />
      <button onClick={handleSubmit} className={styles.button}>
        Submit
      </button>
      
      {comments && comments.length > 0 ? (
        <ul>
          {comments.map((comment, index) => (
            <li key={index} className={styles.li}>
              <p>
                <strong>{comment.userEmail}</strong>: {comment.content}
              </p>
              <p style={{ fontSize: "12px", color: "gray", marginBottom:"12px"}}>
                {new Date(comment.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No comments yet.</p>
      )}
    </div>
  );
}
