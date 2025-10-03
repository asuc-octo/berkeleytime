import { omitBy } from "lodash";

import {
  LabelModel,
  MajorReqModel,
  PlanModel,
  PlanTermModel,
  SelectedCourseModel,
} from "@repo/common";

import {
  Colleges,
  EditPlanTermInput,
  Plan,
  PlanInput,
  PlanTerm,
  PlanTermInput,
  SelectedCourseInput,
} from "../../generated-types/graphql";
import { formatPlan, formatPlanTerm } from "./formatter";

// Helper functions for chronological insertion
function getTermOrder(term: string): number {
  switch (term) {
    case 'Spring': return 1;
    case 'Summer': return 2;
    case 'Fall': return 3;
    default: return 0;
  }
}

function findInsertionIndex(planTerms: any[], newTerm: any): number {
  for (let i = 0; i < planTerms.length; i++) {
    const currentTerm = planTerms[i];
    if (newTerm.year < currentTerm.year) {
      return i;
    }
    if (newTerm.year === currentTerm.year) {
      if (getTermOrder(newTerm.term) < getTermOrder(currentTerm.term)) {
        return i;
      }
      if (getTermOrder(newTerm.term) === getTermOrder(currentTerm.term) && newTerm.name < currentTerm.name) {
        return i;
      }
    }
  }
  return planTerms.length;
}

// get plan for a user
export async function getPlanByUser(context: any): Promise<Plan[]> {
  if (!context.user.email) throw new Error("Unauthorized");

  const gt = await PlanModel.findOne({ userEmail: context.user.email });
  if (!gt) {
    throw new Error("No Plan found for this user");
  }
  const tmp = formatPlan(gt);
  return tmp ? [tmp] : [];
}

// delete a planTerm specified by ObjectID
export async function removePlanTerm(
  planTermID: string,
  context: any
): Promise<string> {
  if (!context.user.email) throw new Error("Unauthorized");

  // check if planTerm belongs to plan
  const gt = await PlanModel.findOne({ userEmail: context.user.email });
  if (!gt) {
    throw new Error("No Plan found for this user");
  }
  const planTermIndex = gt.planTerms.findIndex(
    (sem) => (sem._id as string) == planTermID
  );
  if (planTermIndex === -1) {
    throw new Error("PlanTerm does not exist in user's plan");
  }
  gt.planTerms.splice(planTermIndex, 1);
  await gt.save();

  return planTermID;
}

// create a new planTerm
export async function createPlanTerm(
  mainPlanTerm: PlanTermInput,
  context: any
): Promise<PlanTerm> {
  if (!context.user.email) throw new Error("Unauthorized");
  const nonNullPlanTerm = omitBy(mainPlanTerm, (value) => value == null);
  nonNullPlanTerm.userEmail = context.user.email;
  const newPlanTerm = new PlanTermModel({
    ...nonNullPlanTerm,
  });

  // add to plan in chronological order
  const gt = await PlanModel.findOne({ userEmail: context.user.email });
  if (!gt) {
    throw new Error("No Plan found for this user");
  }
  const insertIndex = findInsertionIndex(gt.planTerms, newPlanTerm);
  gt.planTerms.splice(insertIndex, 0, newPlanTerm);
  await gt.save();

  return formatPlanTerm(newPlanTerm);
}

// update an existing planTerm
export async function editPlanTerm(
  planTermID: string,
  mainPlanTerm: EditPlanTermInput,
  context: any
): Promise<PlanTerm> {
  if (!context.user.email) throw new Error("Unauthorized");
  const gt = await PlanModel.findOne({ userEmail: context.user.email });
  if (!gt) {
    throw new Error("No Plan found for this user");
  }

  const planTermIndex = gt.planTerms.findIndex(
    (sem) => (sem._id as string) == planTermID
  );
  if (planTermIndex === -1) {
    throw new Error("PlanTerm does not exist in user's plan");
  }

  const termToUpdate = gt.planTerms[planTermIndex];

  if (mainPlanTerm.name != null) {
    termToUpdate.name = mainPlanTerm.name;
  }
  if (mainPlanTerm.year != null) {
    termToUpdate.year = mainPlanTerm.year;
  }
  if (mainPlanTerm.term != null) {
    termToUpdate.term = mainPlanTerm.term;
  }
  if (mainPlanTerm.hidden != null) {
    termToUpdate.hidden = mainPlanTerm.hidden;
  }
  if (mainPlanTerm.status != null) {
    termToUpdate.status = mainPlanTerm.status;
  }
  if (mainPlanTerm.pinned != null) {
    termToUpdate.pinned = mainPlanTerm.pinned;
  }
  if (mainPlanTerm.courses != null) {
    termToUpdate.courses = mainPlanTerm.courses.map(
      (courseInput) => new SelectedCourseModel(courseInput)
    );
  }

  await gt.save();
  return formatPlanTerm(termToUpdate);
}

// update class selection in an existing planTerm
export async function setClasses(
  planTermID: string,
  courses: SelectedCourseInput[],
  context: any
): Promise<PlanTerm> {
  if (!context.user.email) throw new Error("Unauthorized");
  const gt = await PlanModel.findOne({ userEmail: context.user.email });
  if (!gt) {
    throw new Error("No Plan found for this user");
  }
  const planTermIndex = gt.planTerms.findIndex(
    (sem) => (sem._id as string) == planTermID
  );
  if (planTermIndex === -1) {
    throw new Error("PlanTerm does not exist in user's plan");
  }
  gt.planTerms[planTermIndex].courses = courses.map(
    (courseInput) => new SelectedCourseModel(courseInput)
  );
  await gt.save();
  return formatPlanTerm(gt.planTerms[planTermIndex]);
}

// create a new plan
export async function createPlan(
  college: Colleges,
  majors: string[],
  minors: string[],
  startYear: number,
  endYear: number,
  context: any
): Promise<Plan> {
  if (!context.user.email) throw new Error("Unauthorized");
  // if existing plan, overwrite
  const gt = await PlanModel.findOne({ userEmail: context.user.email });
  if (gt) {
    throw new Error("User already has existing plan");
  }
  const miscellaneous = new PlanTermModel({
    name: "Miscellaneous",
    courses: [],
    userEmail: context.user.email,
    year: -1,
    term: "Misc",
    hidden: false,
    status: "None",
    pinned: false,
  });

  // Create all the plan terms
  const planTerms = [miscellaneous];
  planTerms.push(
    new PlanTermModel({
      name: "Fall " + startYear,
      courses: [],
      userEmail: context.user.email,
      year: startYear,
      term: "Fall",
      hidden: false,
      status: "None",
      pinned: false,
    })
  );
  for (let i = startYear + 1; i < endYear; i++) {
    planTerms.push(
      new PlanTermModel({
        name: "Spring " + i,
        courses: [],
        userEmail: context.user.email,
        year: i,
        term: "Spring",
        hidden: false,
        status: "None",
        pinned: false,
      })
    );
    planTerms.push(
      new PlanTermModel({
        name: "Fall " + i,
        courses: [],
        userEmail: context.user.email,
        year: i,
        term: "Fall",
        hidden: false,
        status: "None",
        pinned: false,
      })
    );
  }
  planTerms.push(
    new PlanTermModel({
      name: "Spring " + endYear,
      courses: [],
      userEmail: context.user.email,
      year: endYear,
      term: "Spring",
      hidden: false,
      status: "None",
      pinned: false,
    })
  );

  const newPlan = await PlanModel.create({
    userEmail: context.user.email,
    planTerms: planTerms,
    majors: majors,
    minors: minors,
    majorReqs: [],
    college: college,
    labels: [],
    uniReqsSatisfied: [],
    collegeReqsSatisfied: [],
  });
  return formatPlan(newPlan);
}

export async function editPlan(plan: PlanInput, context: any): Promise<Plan> {
  if (!context.user.email) throw new Error("Unauthorized");
  const gt = await PlanModel.findOne({ userEmail: context.user.email });
  if (!gt) {
    throw new Error("No Plan found for this user");
  }

  if (plan.college != null) {
    gt.college = plan.college;
  }
  if (plan.majors != null) {
    gt.majors = plan.majors;
  }
  if (plan.minors != null) {
    gt.minors = plan.minors;
  }
  if (plan.majorReqs != null) {
    gt.majorReqs = plan.majorReqs.map(
      (majorReqInput) => new MajorReqModel(majorReqInput)
    );
  }
  if (plan.labels != null) {
    gt.labels = plan.labels.map((labelInput) => new LabelModel(labelInput));
  }
  if (plan.uniReqsSatisfied != null) {
    gt.uniReqsSatisfied = plan.uniReqsSatisfied;
  }
  if (plan.collegeReqsSatisfied != null) {
    gt.collegeReqsSatisfied = plan.collegeReqsSatisfied;
  }

  await gt.save();
  return formatPlan(gt);
}

export async function deletePlan(context: any): Promise<string> {
  if (!context.user.email) throw new Error("Unauthorized");
  console.log(context.user);
  await PlanModel.deleteOne({ userEmail: context.user.email }).catch((err) => {
    return err;
  });
  return context.user.email;
}
