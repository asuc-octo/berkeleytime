import { v4 as uuidv4 } from "uuid";

import { DiscussionModel, IDiscussionItem } from "@repo/common";

import { formatDiscussion } from "./formatter";

export const createClassId = (
  year: number,
  semester: string,
  sessionId: string,
  subject: string,
  courseNumber: string,
  classNumber: string
): string => {
  const actualSessionId = sessionId || "1";
  return `${year}-${semester}-${actualSessionId}-${subject}-${courseNumber}-${classNumber}`;
};

export const getDiscussionsByClass = async (
  year: number,
  semester: string,
  sessionId: string,
  subject: string,
  courseNumber: string,
  classNumber: string
) => {
  console.log("getDiscussionsByClass called with params:", {
    year,
    semester,
    sessionId,
    subject,
    courseNumber,
    classNumber,
  });

  const classId = createClassId(
    year,
    semester,
    sessionId,
    subject,
    courseNumber,
    classNumber
  );

  console.log("Looking for discussions with classId:", classId);

  const discussions = await DiscussionModel.find({ classId })
    .sort({ timestamp: -1 })
    .lean();

  console.log(`Found ${discussions.length} discussions in DB`);
  if (discussions.length > 0) {
    console.log("First discussion:", discussions[0]);
  }

  const formatted = discussions.map((discussion) =>
    formatDiscussion(discussion as unknown as IDiscussionItem)
  );

  console.log(`Returning ${formatted.length} formatted discussions`);
  if (formatted.length > 0) {
    console.log(
      "First formatted discussion:",
      JSON.stringify(formatted[0], null, 2)
    );
  }

  return formatted;
};

export const getDiscussionsByUser = async (userId: string) => {
  const discussions = await DiscussionModel.find({ userId })
    .sort({ timestamp: -1 })
    .lean();

  return discussions.map((discussion) =>
    formatDiscussion(discussion as unknown as IDiscussionItem)
  );
};

export const addDiscussion = async (
  year: number,
  semester: string,
  sessionId: string,
  subject: string,
  courseNumber: string,
  classNumber: string,
  userId: string,
  content: string
) => {
  const classId = createClassId(
    year,
    semester,
    sessionId,
    subject,
    courseNumber,
    classNumber
  );

  const discussionId = uuidv4();

  console.log("Creating discussion with data:", {
    discussionId,
    classId,
    userId,
    content,
    timestamp: new Date(),
  });

  const newDiscussion = new DiscussionModel({
    discussionId,
    classId,
    userId,
    content,
    timestamp: new Date(),
  });

  console.log("Before save - newDiscussion:", newDiscussion);

  try {
    const savedDiscussion = await newDiscussion.save();
    console.log("After save - savedDiscussion:", savedDiscussion);

    // Verify it was actually saved
    const verifyDiscussion = await DiscussionModel.findOne({ discussionId });
    console.log("Verification - found in DB:", verifyDiscussion);

    return formatDiscussion(savedDiscussion.toObject() as IDiscussionItem);
  } catch (error) {
    console.error("Error saving discussion:", error);
    throw error;
  }
};

export const deleteDiscussion = async (discussionId: string) => {
  const result = await DiscussionModel.deleteOne({ discussionId });

  return result.deletedCount > 0;
};
