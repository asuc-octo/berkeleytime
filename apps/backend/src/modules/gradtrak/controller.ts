import { omitBy } from "lodash";

import { PlanTermModel, GradtrakModel, SelectedCourseModel, CustomEventModel, MajorReqModel } from "@repo/common";

import {
  CustomEventInput,
  PlanTerm,
  Gradtrak,
  PlanTermInput,
  SelectedCourseInput,
  Colleges,
  MajorReqInput
} from "../../generated-types/graphql";
import { formatPlanTerm, formatGradtrak } from "./formatter";

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

// get gradtrak for a user
export async function getGradtrakByUser(
  context: any
): Promise<Gradtrak | null> {
  if (!context.user._id) throw new Error("Unauthorized");

  const gt = await GradtrakModel.findOne({ userEmail: context.user._id });
  if (!gt) {
    throw new Error("No Gradtrak found for this user");
  }
  return formatGradtrak(gt);
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
  if (!context.user._id) throw new Error("Unauthorized");

  // check if planTerm belongs to gradtrak
  const gt = await GradtrakModel.findOne({ userEmail: context.user._id });
  if (!gt) {
    throw new Error("No Gradtrak found for this user");
  }
  const planTermIndex = gt.planTerms.findIndex((sem) => sem._id as string == planTermID);
  if (planTermIndex === -1) {
    throw new Error("PlanTerm does not exist in user's gradtrak");
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
  if (!context.user._id) throw new Error("Unauthorized");
  if (mainPlanTerm.customEvents) {
    mainPlanTerm.customEvents.forEach(removeNullEventVals);
  }
  const nonNullPlanTerm = omitBy(mainPlanTerm, (value) => value == null);
  nonNullPlanTerm.userEmail = context.user._id;
  const newPlanTerm = new PlanTermModel({
    ...nonNullPlanTerm
  });

  // add to gradtrak
  const gt = await GradtrakModel.findOne({ user_email: context.user._id });
  if (!gt) {
    throw new Error("No Gradtrak found for this user");
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
  if (!context.user._id) throw new Error("Unauthorized");
  const gt = await GradtrakModel.findOne({ userEmail: context.user._id });
  if (!gt) {
    throw new Error("No Gradtrak found for this user");
  }
  if (mainPlanTerm.customEvents) {
    mainPlanTerm.customEvents.forEach(removeNullEventVals);
  }
  const nonNullPlanTerm = omitBy(mainPlanTerm, (value) => value == null);
  nonNullPlanTerm.userEmail = context.user._id;
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
    throw new Error("PlanTerm does not exist in user's gradtrak");
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
  if (!context.user._id) throw new Error("Unauthorized");
  const gt = await GradtrakModel.findOne({ userEmail: context.user._id });
  if (!gt) {
    throw new Error("No Gradtrak found for this user");
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
    throw new Error("PlanTerm does not exist in user's gradtrak");
  }
  gt.planTerms[planTermIndex].courses = courses.map(courseInput => new SelectedCourseModel(courseInput));
  gt.planTerms[planTermIndex].customEvents = customEvents.map(customEventInput => new CustomEventModel(customEventInput));
  await gt.save();
  return formatPlanTerm(gt.planTerms[planTermIndex]);
}

// create a new gradtrak
export async function createGradtrak(
  context: any
): Promise<Gradtrak> {
  if (!context.user._id) throw new Error("Unauthorized");
  // if existing gradtrak, overwrite
  const gt = await GradtrakModel.findOne({ userEmail: context.user._id });
  if (gt) {
    throw new Error("User already has existing gradtrak");
  }
  const miscellaneous = new PlanTermModel({
    name: "Miscellaneous",
    courses: [],
    customEvents: [],
    userEmail: context.user._id
  });
  const newGradtrak = await GradtrakModel.create({
    userEmail: context.user._id,
    planTerms: [],
    miscellaneous: miscellaneous,
    collegeReqs: [],
    uniReqs: UniReqs,
    majorReqs: [],
  });
  return formatGradtrak(newGradtrak);
}

export async function changeCollege(
  college: Colleges,
  context: any
): Promise<Gradtrak> {
  if (!context.user._id) throw new Error("Unauthorized");
  const gt = await GradtrakModel.findOne({ userEmail: context.user._id });
  if (!gt) {
    throw new Error("No Gradtrak found for this user");
  }
  if (college as String == "LnS") {
    gt.collegeReqs = LnSReqs;
  } else if (college as String == "CoE") {
    gt.collegeReqs = CoEReqs;
  } else if (college as String == "HAAS") {
    gt.collegeReqs = HaasReqs;
  } else {
    gt.collegeReqs = [];
  }
  await gt.save();
  return formatGradtrak(gt);
}

export async function editMajorRequirements(
  majorReqs: MajorReqInput[],
  context: any
): Promise<Gradtrak> {
  if (!context.user._id) throw new Error("Unauthorized");
  const gt = await GradtrakModel.findOne({ user_email: context.user._id });
  if (!gt) {
    throw new Error("No Gradtrak found for this user");
  }
  console.log(new MajorReqModel(majorReqs[0]));
  gt.majorReqs = majorReqs.map(majorReqInput => new MajorReqModel(majorReqInput));
  await gt.save();
  return formatGradtrak(gt);
}

export async function deleteGradtrak(
  context: any
): Promise<string> {
  if (!context.user._id) throw new Error("Unauthorized");
  await GradtrakModel.deleteOne({ user_email: context.user._id })
  .catch(err => {
    return err;
  });
  return context.user._id;
}