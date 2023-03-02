import { Mongoose } from "mongoose";
import { getSchedulesByUser, getScheduleByID, removeSchedule, createSchedule, setSections, setClasses, editSchedule } from "./controller";
import { ScheduleModule } from "./generated-types/module-types";

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
    // consider returning ID instead of Schedule
    // make arrays optional
    // include CustomEvent array?
    createNewSchedule(_parent, args: {created_by: string, term: string, schedule_name?: string | undefined | null, is_public?: boolean | undefined | null, class_IDs: string[] | null | undefined, section_IDs: string[] | undefined | null}) {
      
      return createSchedule(args.created_by, args.term, args.schedule_name ?? "", args.is_public ?? false, args.class_IDs ?? [""], args.section_IDs ?? [""])
      
    },
    editExistingSchedule(_parent, args: {id: string, created_by?: string | undefined | null, term?: string | undefined | null, schedule_name?: string | undefined | null, is_public?: boolean | undefined | null, class_IDs: string[] | null | undefined, section_IDs: string[] | undefined | null}) {
      return editSchedule(args.id, args.created_by, args.term, args.schedule_name, args.class_IDs ?? [""], args.section_IDs ?? [""], args.is_public)
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
