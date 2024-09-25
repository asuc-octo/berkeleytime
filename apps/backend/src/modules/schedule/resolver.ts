import {
  ScheduleInput,
  SelectedCourseInput,
} from "../../generated-types/graphql";
import {
  createSchedule,
  editSchedule,
  getScheduleByID,
  getSchedulesByUser,
  removeSchedule,
  setClasses,
} from "./controller";
import { ScheduleModule } from "./generated-types/module-types";

const resolvers: ScheduleModule.Resolvers = {
  Query: {
    schedulesByUser(_parent, _args, context) {
      return getSchedulesByUser(context);
    },
    scheduleByID(_parent, args: { id: string }) {
      return getScheduleByID(args.id);
    },
  },
  Mutation: {
    removeScheduleByID(_parent, args: { id: string }) {
      return removeSchedule(args.id);
    },
    createNewSchedule(
      _parent,
      args: { main_schedule: ScheduleInput },
      context
    ) {
      return createSchedule(args.main_schedule, context);
    },
    editExistingSchedule(
      _parent,
      args: { id: string; main_schedule: ScheduleInput }
    ) {
      return editSchedule(args.id, args.main_schedule);
    },
    setSelectedClasses(
      _parent,
      args: { id: string; courses: SelectedCourseInput[] }
    ) {
      return setClasses(args.id, args.courses);
    },
  },
};

export default resolvers;
