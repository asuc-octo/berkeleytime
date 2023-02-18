import { getSchedulesByUser, getScheduleByTermAndUser } from "./controller";
import { ScheduleModule } from "./generated-types/module-types";

const resolvers: ScheduleModule.Resolvers = {
  Query: {
    schedulesByUser(_parent, args: { created_by: string }) {
      return getSchedulesByUser(args.created_by);
    },
    schedulesByUserAndTerm(_parent, args: { created_by: string, term: string }) {
      return getScheduleByTermAndUser(args.created_by, args.term);
    },
  },
};

export default resolvers;
