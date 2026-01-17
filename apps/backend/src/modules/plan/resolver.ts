import {
  Colleges,
  EditPlanTermInput,
  PlanInput,
  PlanTermInput,
  SelectedCourseInput,
  SelectedPlanRequirementInput,
  UpdateManualOverrideInput,
} from "../../generated-types/graphql";
import {
  createPlan,
  createPlanTerm,
  deletePlan,
  editPlan,
  editPlanTerm,
  getCollegeRequirements,
  getPlanByUser,
  getPlanRequirementById,
  getPlanRequirementsByMajorsAndMinors,
  getUcRequirements,
  removePlanTerm,
  setClasses,
  updateManualOverride,
  updateSelectedPlanRequirements,
} from "./controller";
import { PlanModule } from "./generated-types/module-types";

const resolvers: PlanModule.Resolvers = {
  Query: {
    planByUser(_parent, _args, context) {
      return getPlanByUser(context);
    },
    planRequirementsByMajorsAndMinors(
      _parent,
      args: { majors: string[]; minors: string[] }
    ) {
      return getPlanRequirementsByMajorsAndMinors(args.majors, args.minors);
    },
    ucRequirements() {
      return getUcRequirements();
    },
    collegeRequirements(_parent, args: { college: string }) {
      return getCollegeRequirements(args.college);
    },
  },
  SelectedPlanRequirement: {
    planRequirement: async (parent: PlanModule.SelectedPlanRequirement) => {
      // The formatter adds planRequirementId to the object, but it's not in the GraphQL type
      const planRequirementId = parent.planRequirementId;
      if (!planRequirementId) {
        throw new Error("planRequirementId not found");
      }
      const requirement = await getPlanRequirementById(planRequirementId);
      if (!requirement) {
        throw new Error(
          `PlanRequirement with id ${planRequirementId} not found`
        );
      }
      return requirement;
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
    updateManualOverride(
      _parent,
      args: { input: UpdateManualOverrideInput },
      context
    ) {
      return updateManualOverride(args.input, context);
    },
    updateSelectedPlanRequirements(
      _parent,
      args: { selectedPlanRequirements: SelectedPlanRequirementInput[] },
      context
    ) {
      return updateSelectedPlanRequirements(
        args.selectedPlanRequirements,
        context
      );
    },
  },
};

export default resolvers;
