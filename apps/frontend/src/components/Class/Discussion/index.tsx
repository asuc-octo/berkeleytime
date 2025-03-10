// import { useState } from "react";

// import {
//   Dialog,
//   DialogClose,
//   DialogContent,
//   DialogTrigger,
// } from "@radix-ui/react-dialog";

// import { Button } from "@repo/theme";

import useClass from "@/hooks/useClass";

// import styles from "./Discussion.module.scss";

export default function Discussion() {
  const { class: _class } = useClass();
  // const [commentText, setCommentText] = useState("");

  return <div></div>;

  // return (
  //   <div className={styles.root}>
  //     {/* Radix UI Dialog for Add Comment */}
  //     <Dialog>
  //       <DialogTrigger asChild>
  //         <Button>Add Comment</Button> {/* Button that triggers the modal */}
  //       </DialogTrigger>

  //       <DialogContent className={styles.dialogContent}>
  //         <h2>Add a Comment</h2>
  //         {/* Custom Textarea using native <textarea> */}
  //         <Label htmlFor="commentText">Comment:</Label>
  //         <textarea
  //           id="commentText"
  //           value={commentText}
  //           onChange={(e) => setCommentText(e.target.value)}
  //           placeholder="Write a comment..."
  //           rows={4}
  //           className={styles.textarea} // Add your custom styling
  //         />
  //         <div>
  //           <Button onClick={handleCommentSubmit}>Submit</Button>
  //           <DialogClose asChild>
  //             <Button>Close</Button>
  //           </DialogClose>
  //         </div>
  //       </DialogContent>
  //     </Dialog>

  //     {/* List of Previous Comments */}
  //     <div className={styles.commentsList}>
  //       {commentsData?.getDiscussionsByCourse?.map((comment) => (
  //         <div key={comment.timestamp} className={styles.comment}>
  //           <p className={styles.commentText}>{comment.text}</p>
  //           <p className={styles.commentUser}>
  //             <strong>{comment.user.name}</strong> -{" "}
  //             {new Date(comment.timestamp).toLocaleString()}
  //           </p>
  //         </div>
  //       ))}
  //     </div>
  //   </div>
  // );
}
