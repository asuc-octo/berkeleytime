import {
  Colleges,
  EditPlanTermInput,
  PlanInput,
  PlanTermInput,
  SelectedCourseInput,
} from "../../generated-types/graphql";
import {
  createPlan,
  createPlanTerm,
  deletePlan,
  editPlan,
  editPlanTerm,
  getGradTrakAnalyticsData,
  getPlanByUser,
  removePlanTerm,
  setClasses,
} from "./controller";
import { PlanModule } from "./generated-types/module-types";

const resolvers: PlanModule.Resolvers = {
  Query: {
    planByUser(_parent, _args, context) {
      return getPlanByUser(context);
    },
    gradTrakAnalyticsData(_parent, _args, context) {
      return getGradTrakAnalyticsData(context);
    },
  },
  Mutation: {
    removePlanTermByID(_parent, args: { id: string }, context) {
      return removePlanTerm(args.id, context);
    },
    createNewPlanTerm(_parent, args: { planTerm: PlanTermInput }, context) {
      return createPlanTerm(args.planTerm, context);
    },
    editPlanTerm(
      _parent,
      args: { id: string; planTerm: EditPlanTermInput },
      context
    ) {
      return editPlanTerm(args.id, args.planTerm, context);
    },
    setSelectedCourses(
      _parent,
      args: { id: string; courses: SelectedCourseInput[] },
      context
    ) {
      return setClasses(args.id, args.courses, context);
    },
    createNewPlan(
      _parent,
      args: {
        colleges: Colleges[];
        majors: string[];
        minors: string[];
        startYear: number;
        endYear: number;
      },
      context
    ) {
      return createPlan(
        args.colleges,
        args.majors,
        args.minors,
        args.startYear,
        args.endYear,
        context
      );
    },
    editPlan(_parent, args: { plan: PlanInput }, context) {
      return editPlan(args.plan, context);
    },
    deletePlan(_parent, _args, context) {
      return deletePlan(context);
    },
  },
};

export default resolvers;
