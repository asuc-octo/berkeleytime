import {
  PlanTermInput,
  SelectedCourseInput,
  CustomEventInput,
  PlanInput,
  Colleges
} from "../../generated-types/graphql";
import {
  getPlanByUser,
  getPlanTermByID,
  removePlanTerm,
  createPlanTerm,
  editPlanTerm,
  setClasses,
  createPlan,
  editPlan,
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
    createNewPlan(
      _parent, 
      args: { college: Colleges }, 
      context) {
      return createPlan(args.college, context);
    }, 
    editPlan(
      _parent,
      args: { plan: PlanInput },
      context
    ) {
      return editPlan(args.plan, context);
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
