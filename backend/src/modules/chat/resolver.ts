//import {  } from "./controller";
// import { ChatModule } from "./generated-types/module-types";
import { Resolvers, ScheduleInput } from "../../generated-types/graphql";
import { createMessage, getAllMessages } from "./controller";

const resolvers: Resolvers = {
  Query: {
    allMessages: (_, args, __, info) => getAllMessages(args.created_by ?? undefined),
  },
  Mutation: {
    createMessage: (_, args, __, info) => createMessage(args.message),
  }
};

export default resolvers;
