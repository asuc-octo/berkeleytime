import { getSchedulesByUser, getScheduleByTermAndUser, removeSchedule } from "./controller";
import { ScheduleModule } from "./generated-types/module-types";

const resolvers: ScheduleModule.Resolvers = {
  Query: {
    schedulesByUser(_parent, args: { created_by: string }) {
      return getSchedulesByUser(args.created_by);
    },
    schedulesByUserAndTerm(_parent, args: { created_by: string, term: string }) {
      return getScheduleByTermAndUser(args.created_by, args.term);
    }
  },
  Mutation: {
    removeScheduleByID(_parent, args: {id: string}) {
      return removeSchedule(args.id);
    }
  }
};

export default resolvers;
