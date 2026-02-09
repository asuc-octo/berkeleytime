import { GraphQLError } from "graphql";

import {
  TargetedMessageModel,
  StaffMemberModel,
} from "@repo/common/models";

// Context interface for authenticated requests
export interface TargetedMessageRequestContext {
  user: {
    _id: string;
    isAuthenticated: boolean;
  };
}

// Helper to verify the current user is a staff member
export const requireStaffMember = async (
  context: TargetedMessageRequestContext
) => {
  if (!context.user?._id) {
    throw new GraphQLError("Not authenticated", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  const staffMember = await StaffMemberModel.findOne({
    userId: context.user._id,
  }).lean();

  if (!staffMember) {
    throw new GraphQLError("Only staff members can perform this action", {
      extensions: { code: "FORBIDDEN" },
    });
  }

  return staffMember;
};

// Helper to format a Mongoose document for GraphQL
const formatMessage = (msg: Record<string, unknown>) => ({
  ...msg,
  id: (msg._id as { toString: () => string }).toString(),
  createdAt:
    msg.createdAt instanceof Date
      ? msg.createdAt.toISOString()
      : msg.createdAt,
  updatedAt:
    msg.updatedAt instanceof Date
      ? msg.updatedAt.toISOString()
      : msg.updatedAt,
});

/**
 * Get visible, non-deleted targeted messages matching a specific course.
 */
export const getTargetedMessagesForCourse = async (courseId: string) => {
  const messages = await TargetedMessageModel.find({
    visible: true,
    deletedAt: null,
    "targetCourses.courseId": courseId,
  })
    .sort({ createdAt: -1 })
    .lean();

  return messages.map(formatMessage);
};

/**
 * Increment the dismiss count for a targeted message.
 */
export const incrementTargetedMessageDismiss = async (messageId: string) => {
  const message = await TargetedMessageModel.findByIdAndUpdate(
    messageId,
    { $inc: { dismissCount: 1 } },
    { new: true }
  ).lean();

  if (!message) {
    throw new GraphQLError("Targeted message not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  return formatMessage(message);
};

/**
 * Get all targeted messages for staff dashboard (includes hidden ones).
 */
export const getAllTargetedMessagesForStaff = async () => {
  const messages = await TargetedMessageModel.find({ deletedAt: null })
    .sort({ createdAt: -1 })
    .lean();

  return messages.map(formatMessage);
};

// Input types
export interface TargetedMessageCourseInput {
  courseId: string;
  subject: string;
  courseNumber: string;
}

export interface CreateTargetedMessageInput {
  title: string;
  description?: string | null;
  link?: string | null;
  linkText?: string | null;
  clickEventLogging?: boolean | null;
  targetCourses: TargetedMessageCourseInput[];
}

export interface UpdateTargetedMessageInput {
  title?: string | null;
  description?: string | null;
  link?: string | null;
  linkText?: string | null;
  clickEventLogging?: boolean | null;
  visible?: boolean | null;
  targetCourses?: TargetedMessageCourseInput[] | null;
}

/**
 * Create a new targeted message. Staff only.
 */
export const createTargetedMessage = async (
  context: TargetedMessageRequestContext,
  input: CreateTargetedMessageInput
) => {
  await requireStaffMember(context);

  const snapshot = {
    title: input.title,
    description: input.description ?? null,
    link: input.link === "" ? null : (input.link ?? null),
    linkText: input.linkText === "" ? null : (input.linkText ?? null),
    visible: true,
    clickEventLogging: input.clickEventLogging ?? false,
    targetCourses: input.targetCourses,
  };

  const initialVersionEntry = {
    version: 1,
    changedFields: ["created"],
    timestamp: new Date(),
    snapshot,
  };

  const message = await TargetedMessageModel.create({
    title: input.title,
    description: input.description ?? null,
    link: input.link === "" ? null : (input.link ?? null),
    linkText: input.linkText === "" ? null : (input.linkText ?? null),
    visible: true,
    clickEventLogging: input.clickEventLogging ?? false,
    targetCourses: input.targetCourses,
    currentVersion: 1,
    versionHistory: [initialVersionEntry],
  });

  return formatMessage(message.toObject());
};

/**
 * Update a targeted message by ID. Staff only.
 */
export const updateTargetedMessage = async (
  context: TargetedMessageRequestContext,
  messageId: string,
  input: UpdateTargetedMessageInput
) => {
  await requireStaffMember(context);

  const currentMessage = await TargetedMessageModel.findById(messageId);
  if (!currentMessage || currentMessage.deletedAt) {
    throw new GraphQLError("Targeted message not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  const updateData: Record<string, unknown> = {};
  const changedFields: string[] = [];

  if (input.title !== null && input.title !== undefined) {
    if (input.title !== currentMessage.title) changedFields.push("title");
    updateData.title = input.title;
  }
  if (input.description !== undefined) {
    const newDesc = input.description === "" ? null : input.description;
    if (newDesc !== (currentMessage.description ?? null))
      changedFields.push("description");
    updateData.description = newDesc;
  }
  if (input.link !== undefined) {
    const newLink = input.link === "" || input.link === null ? null : input.link;
    if (newLink !== (currentMessage.link ?? null)) changedFields.push("link");
    updateData.link = newLink;
  }
  if (input.linkText !== undefined) {
    const newLinkText =
      input.linkText === "" || input.linkText === null ? null : input.linkText;
    if (newLinkText !== (currentMessage.linkText ?? null))
      changedFields.push("linkText");
    updateData.linkText = newLinkText;
  }
  if (input.clickEventLogging !== null && input.clickEventLogging !== undefined) {
    if (input.clickEventLogging !== currentMessage.clickEventLogging)
      changedFields.push("clickEventLogging");
    updateData.clickEventLogging = input.clickEventLogging;
  }
  if (input.visible !== null && input.visible !== undefined) {
    if (input.visible !== currentMessage.visible)
      changedFields.push("visible");
    updateData.visible = input.visible;
  }
  if (input.targetCourses !== null && input.targetCourses !== undefined) {
    changedFields.push("targetCourses");
    updateData.targetCourses = input.targetCourses;
  }

  const currentVersion = currentMessage.currentVersion ?? 1;

  // If any fields changed, create a new version entry
  if (changedFields.length > 0) {
    const updatedState = {
      title: (updateData.title as string) ?? currentMessage.title,
      description:
        updateData.description !== undefined
          ? updateData.description
          : currentMessage.description,
      link:
        updateData.link !== undefined ? updateData.link : currentMessage.link,
      linkText:
        updateData.linkText !== undefined
          ? updateData.linkText
          : currentMessage.linkText,
      visible: (updateData.visible as boolean) ?? currentMessage.visible,
      clickEventLogging:
        (updateData.clickEventLogging as boolean) ??
        currentMessage.clickEventLogging,
      targetCourses:
        (updateData.targetCourses as TargetedMessageCourseInput[]) ??
        currentMessage.targetCourses,
    };

    const newVersionEntry = {
      version: currentVersion + 1,
      changedFields,
      timestamp: new Date(),
      snapshot: updatedState,
    };

    updateData.currentVersion = currentVersion + 1;
    updateData.$push = { versionHistory: newVersionEntry };
  }

  // Separate $push from regular fields for MongoDB update
  const { $push, ...regularUpdateData } = updateData;
  const updateOperation: Record<string, unknown> = { $set: regularUpdateData };
  if ($push) {
    updateOperation.$push = $push;
  }

  // Optimistic locking
  const message = await TargetedMessageModel.findOneAndUpdate(
    { _id: messageId, currentVersion },
    updateOperation,
    { new: true }
  ).lean();

  if (!message) {
    const exists = await TargetedMessageModel.exists({ _id: messageId });
    if (exists) {
      throw new GraphQLError(
        "Targeted message was modified by another user. Please refresh and try again.",
        { extensions: { code: "CONFLICT" } }
      );
    }
    throw new GraphQLError("Targeted message not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  return formatMessage(message);
};

/**
 * Soft-delete a targeted message by ID. Staff only.
 */
export const deleteTargetedMessage = async (
  context: TargetedMessageRequestContext,
  messageId: string
) => {
  await requireStaffMember(context);

  const currentMessage = await TargetedMessageModel.findById(messageId);
  if (!currentMessage) {
    throw new GraphQLError("Targeted message not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  // Already deleted? Return true (idempotent)
  if (currentMessage.deletedAt) {
    return true;
  }

  const currentVersion = currentMessage.currentVersion ?? 1;

  const snapshot = {
    title: currentMessage.title,
    description: currentMessage.description ?? null,
    link: currentMessage.link ?? null,
    linkText: currentMessage.linkText ?? null,
    visible: currentMessage.visible,
    clickEventLogging: currentMessage.clickEventLogging,
    targetCourses: currentMessage.targetCourses,
  };

  const deletionVersionEntry = {
    version: currentVersion + 1,
    changedFields: ["deletedAt"],
    timestamp: new Date(),
    snapshot,
    metadata: { action: "deleted" },
  };

  const result = await TargetedMessageModel.findOneAndUpdate(
    { _id: messageId, currentVersion },
    {
      $set: {
        deletedAt: new Date(),
        currentVersion: currentVersion + 1,
      },
      $push: { versionHistory: deletionVersionEntry },
    },
    { new: true }
  );

  if (!result) {
    const exists = await TargetedMessageModel.exists({ _id: messageId });
    if (exists) {
      throw new GraphQLError(
        "Targeted message was modified by another user. Please refresh and try again.",
        { extensions: { code: "CONFLICT" } }
      );
    }
    throw new GraphQLError("Targeted message not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  return true;
};
