import {
  PlanTermInput,
  SelectedCourseInput,
  CustomEventInput,
  Colleges,
  MajorReqInput,
} from "../../generated-types/graphql";
import {
  getPlanByUser,
  getPlanTermByID,
  removePlanTerm,
  createPlanTerm,
  editPlanTerm,
  setClasses,
  createPlan,
  changeCollege,
  editMajorRequirements,
  deletePlan
} from "./controller";
import { PlanModule } from "./generated-types/module-types";

const resolvers: PlanModule.Resolvers = {
  Query: {
    planByUser(_parent, _args, context) {
      return getPlanByUser(context);
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
      args: { id: string; courses: SelectedCourseInput[], customEvents: CustomEventInput[] },
      context
    ) {
      return setClasses(args.id, args.courses, args.customEvents, context);
    },
    createNewPlan(_parent, _args, context) {
      return createPlan(context);
    }, 
    changePlanCollege(
      _parent,
      args: { college: Colleges },
      context
    ) {
      return changeCollege(args.college, context);
    },
    editMajorRequirements(
      _parent,
      args: { majorReqs: MajorReqInput[] },
      context
    ) {
      return editMajorRequirements(args.majorReqs, context);
    },
    deletePlan(
      _parent,
      _args,
      context
    ) {
      return deletePlan(context);
    }
  },
};

export default resolvers;
