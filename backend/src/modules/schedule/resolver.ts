import { getSchedulesByUser, getScheduleByID, removeSchedule, createSchedule, setClasses, editSchedule } from "./controller";
import { ScheduleModule } from "./generated-types/module-types";
import { ScheduleInput, ScheduleCourseInput } from "../../generated-types/graphql";

const resolvers: ScheduleModule.Resolvers = {
  Query: {
    schedulesByUser(_parent, args: { created_by: string }) {
      return getSchedulesByUser(args.created_by);
    },
    scheduleByID(_parent, args: { id: string }) {
      return getScheduleByID(args.id);
    }
  },
  Mutation: {
    removeScheduleByID(_parent, args: {id: string}) {
      return removeSchedule(args.id);
    },
    createNewSchedule(_parent, args: {main_schedule: ScheduleInput}) {
      return createSchedule(args.main_schedule)
    },
    editExistingSchedule(_parent, args: {id: string, main_schedule: ScheduleInput}) {
      return editSchedule(args.id, args.main_schedule)
    },
    setSelectedClasses(_parent, args: {id: string, courses: ScheduleCourseInput[]}) {
      return setClasses(args.id, args.courses)
    }
  }
};

export default resolvers;
