import { getSchedulesByUser, getScheduleByID, removeSchedule, createSchedule, setSections, setClasses, editSchedule } from "./controller";
import { ScheduleModule } from "./generated-types/module-types";
import { ScheduleInput, TermInput } from "../../generated-types/graphql";

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
    setSelectedSections(_parent, args: {id: string, section_IDs: string[]}) {
      return setSections(args.id, args.section_IDs)
    },
    setSelectedClasses(_parent, args: {id: string, class_IDs: string[]}) {
      return setClasses(args.id, args.class_IDs)
    }
  }
};

export default resolvers;
