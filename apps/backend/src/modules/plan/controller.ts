import { omitBy } from "lodash";

import { PlanTermModel, PlanModel, SelectedCourseModel, CustomEventModel, MajorReqModel } from "@repo/common";

import {
  CustomEventInput,
  PlanTerm,
  Plan,
  PlanTermInput,
  SelectedCourseInput,
  PlanInput,
  Colleges
} from "../../generated-types/graphql";
import { formatPlanTerm, formatPlan } from "./formatter";

// General University Requirements
const UniReqs = [
  "AC",
  "AH",
  "AI",
  "CW",
  "QR",
  "RCA",
  "RCB"
];
// Different College Requirements
const LnSReqs = [
    "LnS_AL",
    "LnS_BS",
    "LnS_HS",
    "LnS_IS",
    "LnS_PV",
    "LnS_PS",
    "LnS_SBS"
];
const CoEReqs = [
  "CoE_HSS"
];
const HaasReqs = [
  "HAAS_AL",
  "HAAS_BS",
  "HAAS_HS",
  "HAAS_IS",
  "HAAS_PV",
  "HAAS_PS",
  "HAAS_SBS"
];

// get plan for a user
export async function getPlanByUser(
  context: any
): Promise<Plan | null> {
  if (!context.user.email) throw new Error("Unauthorized");

  const gt = await PlanModel.findOne({ userEmail: context.user.email });
  if (!gt) {
    throw new Error("No Plan found for this user");
  }
  return formatPlan(gt);
}

// get the planTerm for a user and a specific term
export async function getPlanTermByID(id: string): Promise<PlanTerm> {
  const planTermFromID = await PlanTermModel.findById({ _id: id });
  if (!planTermFromID) {
    throw new Error("No planTerms found with this ID");
  }
  return formatPlanTerm(planTermFromID);
}

// delete a planTerm specified by ObjectID
export async function removePlanTerm(planTermID: string, context: any): Promise<string> {
  if (!context.user.email) throw new Error("Unauthorized");

  // check if planTerm belongs to plan
  const gt = await PlanModel.findOne({ userEmail: context.user.email });
  if (!gt) {
    throw new Error("No Plan found for this user");
  }
  const planTermIndex = gt.planTerms.findIndex((sem) => sem._id as string == planTermID);
  if (planTermIndex === -1) {
    throw new Error("PlanTerm does not exist in user's plan");
  }
  gt.planTerms.splice(planTermIndex, 1);
  await gt.save();

  return planTermID;
}

function removeNullEventVals(customEvent: CustomEventInput) {
  for (const key in customEvent) {
    if (customEvent[key as keyof CustomEventInput] === null) {
      delete customEvent[key as keyof CustomEventInput];
    }
  }
}

// create a new planTerm
export async function createPlanTerm(
  mainPlanTerm: PlanTermInput,
  context: any
): Promise<PlanTerm> {
  if (!context.user.email) throw new Error("Unauthorized");
  if (mainPlanTerm.customEvents) {
    mainPlanTerm.customEvents.forEach(removeNullEventVals);
  }
  const nonNullPlanTerm = omitBy(mainPlanTerm, (value) => value == null);
  nonNullPlanTerm.userEmail = context.user.email;
  const newPlanTerm = new PlanTermModel({
    ...nonNullPlanTerm
  });

  // add to plan
  const gt = await PlanModel.findOne({ userEmail: context.user.email });
  if (!gt) {
    throw new Error("No Plan found for this user");
  }
  gt.planTerms.push(newPlanTerm);
  await gt.save();

  return formatPlanTerm(newPlanTerm);
}

// update an existing planTerm
export async function editPlanTerm(
  planTermID: string,
  mainPlanTerm: PlanTermInput,
  context: any
): Promise<PlanTerm> {
  if (!context.user.email) throw new Error("Unauthorized");
  const gt = await PlanModel.findOne({ userEmail: context.user.email });
  if (!gt) {
    throw new Error("No Plan found for this user");
  }
  if (mainPlanTerm.customEvents) {
    mainPlanTerm.customEvents.forEach(removeNullEventVals);
  }
  const nonNullPlanTerm = omitBy(mainPlanTerm, (value) => value == null);
  nonNullPlanTerm.userEmail = context.user.email;
  const updatedPlanTerm = new PlanTermModel({
    ...nonNullPlanTerm
  });
  const planTermIndex = gt.planTerms.findIndex((sem) => sem._id as string == planTermID);
  if (planTermIndex === -1) {
    // update miscellanous
    if (gt.miscellaneous._id == planTermID) {
      gt.miscellaneous = updatedPlanTerm;
      await gt.save();
      return formatPlanTerm(updatedPlanTerm);
    }
    throw new Error("PlanTerm does not exist in user's plan");
  }
  gt.planTerms[planTermIndex] = updatedPlanTerm; 
  await gt.save();
  return formatPlanTerm(updatedPlanTerm);
}

// update class selection in an existing planTerm
export async function setClasses(
  planTermID: string,
  courses: SelectedCourseInput[],
  customEvents: CustomEventInput[],
  context: any
): Promise<PlanTerm> {
  if (!context.user.email) throw new Error("Unauthorized");
  const gt = await PlanModel.findOne({ userEmail: context.user.email });
  if (!gt) {
    throw new Error("No Plan found for this user");
  }
  const planTermIndex = gt.planTerms.findIndex((sem) => sem._id as string == planTermID);
  if (planTermIndex === -1) {
    // update miscellaneous
    if (gt.miscellaneous._id == planTermID) {
      gt.miscellaneous.courses = courses.map(courseInput => new SelectedCourseModel(courseInput));
      gt.miscellaneous.customEvents = customEvents.map(customEventInput => new CustomEventModel(customEventInput));
      await gt.save();
      return formatPlanTerm(gt.miscellaneous);
    }
    throw new Error("PlanTerm does not exist in user's plan");
  }
  gt.planTerms[planTermIndex].courses = courses.map(courseInput => new SelectedCourseModel(courseInput));
  gt.planTerms[planTermIndex].customEvents = customEvents.map(customEventInput => new CustomEventModel(customEventInput));
  await gt.save();
  return formatPlanTerm(gt.planTerms[planTermIndex]);
}

// create a new plan
export async function createPlan(
  college: Colleges,
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
    customEvents: [],
    userEmail: context.user.email,
    year: -1,
    term: "Misc",
  });

  let collegeReqs = [""];
  
  // set college
  if (college as String == "LnS") {
    collegeReqs = LnSReqs;
  } else if (college as String == "CoE") {
    collegeReqs = CoEReqs;
  } else if (college as String == "HAAS") {
    collegeReqs = HaasReqs;
  } else {
    collegeReqs = [];
  }

  const newPlan = await PlanModel.create({
    userEmail: context.user.email,
    planTerms: [],
    miscellaneous: miscellaneous,
    collegeReqs: collegeReqs,
    uniReqs: UniReqs,
    majorReqs: [],
  });
  return formatPlan(newPlan);
}

export async function editPlan(
  plan: PlanInput,
  context: any
): Promise<Plan> {
  if (!context.user.email) throw new Error("Unauthorized");
  const gt = await PlanModel.findOne({ userEmail: context.user.email });
  if (!gt) {
    throw new Error("No Plan found for this user");
  }
  // set college
  if (plan.college as String == "LnS") {
    gt.collegeReqs = LnSReqs;
  } else if (plan.college as String == "CoE") {
    gt.collegeReqs = CoEReqs;
  } else if (plan.college as String == "HAAS") {
    gt.collegeReqs = HaasReqs;
  } else {
    gt.collegeReqs = [];
  }
  // set major reqs
  gt.majorReqs = plan.majorReqs.map(majorReqInput => new MajorReqModel(majorReqInput));

  await gt.save();
  return formatPlan(gt);
}

export async function deletePlan(
  context: any
): Promise<string> {
  if (!context.user.email) throw new Error("Unauthorized");
  console.log(context.user);
  await PlanModel.deleteOne({ userEmail: context.user.email })
  .catch(err => {
    return err;
  });
  return context.user.email;
}