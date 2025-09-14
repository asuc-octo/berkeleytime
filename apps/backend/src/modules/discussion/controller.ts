import { Discussion } from "@repo/common";

export async function createDiscussion(content: string, author: string, classId: string) {
  try {
    console.log("Creating discussion with:", { content, author, classId });
    console.log("Discussion model:", Discussion);
    console.log("Mongoose connection state:", Discussion.db.readyState);
    const result = await Discussion.create({ content, author, classId });
    console.log("Created discussion:", result);
    return result;
  } catch (error) {
    console.error("Error creating discussion:", error);
    throw error;
  }
}

export async function getDiscussionsByClass(classId: string) {
  try {
    console.log("Getting discussions for classId:", classId);
    const discussions = await Discussion.find({ classId }).sort({ createdAt: -1 }).lean();
    console.log("Found discussions:", discussions.length);
    return discussions;
  } catch (error) {
    console.error("Error getting discussions:", error);
    throw error;
  }
}

export async function getAllDiscussions() {
  return await Discussion.find({}).sort({ createdAt: -1 }).lean();
}

export async function deleteDiscussion(id: string) {
  const res = await Discussion.findByIdAndDelete(id);
  return !!res;
}