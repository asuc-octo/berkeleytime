import {
  CreateTargetedMessageInput,
  TargetedMessageRequestContext,
  UpdateTargetedMessageInput,
  createTargetedMessage,
  deleteTargetedMessage,
  getAllTargetedMessagesForStaff,
  getTargetedMessagesForCourse,
  incrementTargetedMessageDismiss,
  requireStaffMember,
  updateTargetedMessage,
} from "./controller";

const resolvers = {
  Query: {
    targetedMessagesForCourse: (
      _: unknown,
      { courseId }: { courseId: string }
    ) => getTargetedMessagesForCourse(courseId),

    allTargetedMessagesForStaff: async (
      _: unknown,
      __: unknown,
      context: TargetedMessageRequestContext
    ) => {
      await requireStaffMember(context);
      return getAllTargetedMessagesForStaff();
    },
  },

  Mutation: {
    incrementTargetedMessageDismiss: (
      _: unknown,
      { messageId }: { messageId: string }
    ) => incrementTargetedMessageDismiss(messageId),

    createTargetedMessage: (
      _: unknown,
      { input }: { input: CreateTargetedMessageInput },
      context: TargetedMessageRequestContext
    ) => createTargetedMessage(context, input),

    updateTargetedMessage: (
      _: unknown,
      {
        messageId,
        input,
      }: { messageId: string; input: UpdateTargetedMessageInput },
      context: TargetedMessageRequestContext
    ) => updateTargetedMessage(context, messageId, input),

    deleteTargetedMessage: (
      _: unknown,
      { messageId }: { messageId: string },
      context: TargetedMessageRequestContext
    ) => deleteTargetedMessage(context, messageId),
  },

  TargetedMessage: {
    id: (parent: { _id?: { toString: () => string }; id?: string }) =>
      parent._id?.toString() ?? parent.id,
  },
};

export default resolvers;
