import { getTerm } from "../term/controller";
import { TermModule } from "../term/generated-types/module-types";
import {
  createSchedule,
  deleteSchedule,
  getClasses,
  getSchedule,
  getSchedules,
  updateSchedule
} from "./controller";
import { IntermediateSchedule } from "./formatter";
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

  Schedule: {
    term: async (parent: IntermediateSchedule | ScheduleModule.Schedule) => {
      if (parent.term) return parent.term;

      const term = await getTerm(parent.year, parent.semester);

      return term as unknown as TermModule.Term;
    },

    classes: async (parent: IntermediateSchedule | ScheduleModule.Schedule) => {
      if (
        parent.classes[0] &&
        (parent.classes[0] as ScheduleModule.SelectedClass).class
      )
        return parent.classes as ScheduleModule.SelectedClass[];

      const classes = await getClasses(
        parent.year,
        parent.semester,
        parent.sessionId,
        parent.classes as ScheduleModule.SelectedClassInput[]
      );

      return classes;
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
