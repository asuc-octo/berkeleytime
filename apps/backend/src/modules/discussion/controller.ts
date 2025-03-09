import { DiscussionModel } from "@repo/common";

export const getDiscussions = async (courseNumber: string, email?: string) => {
  const filter: any = { courseNumber };
  if (email) filter.email = email;
  console.log("DiscussionModel:", DiscussionModel);

  return await DiscussionModel.find(filter);
};

export const addDiscussion = async (
  courseNumber: string,
  email: string,
  content: string
) => {
  if (!email) throw new Error("Unauthorized");

  if (!courseNumber || !content) {
    throw new Error("Course number and content are required.");
  }

  const newDiscussion = new DiscussionModel({
    courseNumber,
    email,
    content,
  });

  await newDiscussion.save();

  return newDiscussion;
};
