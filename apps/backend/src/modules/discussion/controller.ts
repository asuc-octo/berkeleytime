import {Comment, IComment} from "@repo/common";
// import {formatComment} from './formatter';

interface GetCommentsInput {
  courseId: string;
  userId?: string; // Optional user ID for filtering
}

interface AddCommentInput {
  courseId: string;
  userId: string;
  text: string;
}


export const getCommentsForCourse = async ({ courseId, userId }: GetCommentsInput): Promise<IComment[]> => {
  const filter: { courseId: string; userId?: string } = { courseId };

  if (userId) {
    filter.userId = userId;
  }

  const comments = await Comment.find(filter).sort({ createdAt: -1 });
  return comments;
};

export const addCommentToCourse = async ({ courseId, userId, text }: AddCommentInput): Promise<IComment> => {


  const newComment = new Comment({
    courseId,
    userId,
    text,
  });

  console.log('New comment:', newComment);

  await newComment.save();
  return newComment;
};