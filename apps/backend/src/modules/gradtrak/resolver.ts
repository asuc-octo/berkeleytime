import {
  PlanTermInput,
  SelectedCourseInput,
  CustomEventInput,
  Colleges,
} from "../../generated-types/graphql";
import {
  getGradtrakByUser,
  getPlanTermByID,
  removePlanTerm,
  createPlanTerm,
  editPlanTerm,
  setClasses,
  createGradtrak,
  changeCollege
} from "./controller";
import { GradtrakModule } from "./generated-types/module-types";

const resolvers: GradtrakModule.Resolvers = {
  Query: {
    gradtrakByUser(_parent, _args, context) {
      return getGradtrakByUser(context);
    },
    planTermByID(_parent, args: { id: string }) {
      return getPlanTermByID(args.id);
    },
  },
  Mutation: {
    removePlanTermByID(_parent, args: { id: string }, context) {
      return removePlanTerm(args.id, context);
    },
    createNewPlanTerm(
      _parent,
      args: { planTerm: PlanTermInput },
      context
    ) {
      return createPlanTerm(args.planTerm, context);
    },
    editPlanTerm(
      _parent,
      args: { id: string; planTerm: PlanTermInput },
      context
    ) {
      return editPlanTerm(args.id, args.planTerm, context);
    },
    setSelectedClasses(
      _parent,
      args: { id: string; courses: SelectedCourseInput[], custom_events: CustomEventInput[] },
      context
    ) {
      return setClasses(args.id, args.courses, args.custom_events, context);
    },
    createNewGradtrak(_parent, _args, context) {
      return createGradtrak(context);
    }, 
    changeGradtrakCollege(
      _parent,
      args: { college: Colleges },
      context
    ) {
      return changeCollege(args.college, context);
    },
  },
};

export default resolvers;
