import {
  createSchedule,
  deleteSchedule,
  getSchedule,
  getSchedules,
  updateSchedule,
} from "./controller";
import { ScheduleModule } from "./generated-types/module-types";

const resolvers: ScheduleModule.Resolvers = {
  Query: {
    schedules(_parent, _args, context) {
      return getSchedules(context);
    },
    schedule(_parent, { id }, context) {
      return getSchedule(context, id);
    },
  },
  Mutation: {
    deleteSchedule(_parent, { id }, context) {
      return deleteSchedule(context, id);
    },
    createSchedule(_parent, { schedule }, context) {
      return createSchedule(context, schedule);
    },
    updateSchedule(_parent, { id, schedule }, context) {
      return updateSchedule(context, id, schedule);
    },
  },
};

export default resolvers;
