import { getSchedulesByUser, getScheduleByTermAndUser, removeSchedule, createSchedule } from "./controller";
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
    },
    createNewSchedule(_parent, args: {created_by: string, term: string, schedule_name: string, is_public: boolean}) {
      return createSchedule(args.created_by, args.term, args.schedule_name,  args.is_public)
    }
  }
};

export default resolvers;
