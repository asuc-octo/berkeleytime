import { DiscussionModel } from "@repo/common/models";

export class DiscussionController {
  static async getCommentsForCourse(
    courseId: string,
    userId?: string
  ) {
    const query: any = { courseId };

    if (userId) {
      query.userId = userId;
    }

    return DiscussionModel.find(query).sort({ createdAt: -1 });
  }

  static async addComment(
    courseId: string,
    userId: string,
    content: string
  ) {
    if (!content.trim()) {
      throw new Error("Comment cannot be empty");
    }

    const comment = await DiscussionModel.create({
      courseId,
      userId,
      content,
    });

    return comment;
  }
}
