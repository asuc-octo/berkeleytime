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
    schedules: async (_, _arguments, context) => {
      const schedules = await getSchedules(context);

      return schedules as unknown as ScheduleModule.Schedule[];
    },

    schedule: async (_, { id }, context) => {
      const schedule = await getSchedule(context, id);

      return schedule as unknown as ScheduleModule.Schedule;
    },
  },
  Mutation: {
    deleteSchedule: async (_, { id }, context) => {
      return await deleteSchedule(context, id);
    },

    createSchedule: async (_, { schedule: input }, context) => {
      const schedule = await createSchedule(context, input);

      return schedule as unknown as ScheduleModule.Schedule;
    },

    updateSchedule: async (_, { id, schedule: input }, context) => {
      const schedule = updateSchedule(context, id, input);

      return schedule as unknown as ScheduleModule.Schedule;
    },
  },
};

export default resolvers;
