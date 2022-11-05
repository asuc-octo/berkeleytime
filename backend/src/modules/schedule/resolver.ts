import { getSchedulesByUser, schedules } from "./controller";
import { ScheduleModule } from "./generated-types/module-types";

const resolvers: ScheduleModule.Resolvers = {
  Query: {
    schedules(_parent, args: { created_by: string }) {
      return getSchedulesByUser(args.created_by);
    },
  },
};

export default resolvers;
