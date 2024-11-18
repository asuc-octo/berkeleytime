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
const Uni_Reqs = [
  "AC",
  "AH",
  "AI",
  "CW",
  "QR",
  "RCA",
  "RCB"
];
// Different College Requirements
const LnS_Reqs = [
    "LnS_AL",
    "LnS_BS",
    "LnS_HS",
    "LnS_IS",
    "LnS_PV",
    "LnS_PS",
    "LnS_SBS"
];
const CoE_Reqs = [
  "CoE_HSS"
];
const Haas_Reqs = [
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

  const gt = await GradtrakModel.findOne({ user_email: context.user._id });
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
  const gt = await GradtrakModel.findOne({ user_email: context.user._id });
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

function removeNullEventVals(custom_event: CustomEventInput) {
  for (const key in custom_event) {
    if (custom_event[key as keyof CustomEventInput] === null) {
      delete custom_event[key as keyof CustomEventInput];
    }
  }
}

// create a new planTerm
export async function createPlanTerm(
  main_planTerm: PlanTermInput,
  context: any
): Promise<PlanTerm> {
  if (!context.user._id) throw new Error("Unauthorized");
  if (main_planTerm.custom_events) {
    main_planTerm.custom_events.forEach(removeNullEventVals);
  }
  const non_null_planTerm = omitBy(main_planTerm, (value) => value == null);
  non_null_planTerm.user_email = context.user._id;
  const newPlanTerm = new PlanTermModel({
    ...non_null_planTerm
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
  main_planTerm: PlanTermInput,
  context: any
): Promise<PlanTerm> {
  if (!context.user._id) throw new Error("Unauthorized");
  const gt = await GradtrakModel.findOne({ user_email: context.user._id });
  if (!gt) {
    throw new Error("No Gradtrak found for this user");
  }
  if (main_planTerm.custom_events) {
    main_planTerm.custom_events.forEach(removeNullEventVals);
  }
  const non_null_planTerm = omitBy(main_planTerm, (value) => value == null);
  non_null_planTerm.user_email = context.user._id;
  const updatedPlanTerm = new PlanTermModel({
    ...non_null_planTerm
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
  custom_events: CustomEventInput[],
  context: any
): Promise<PlanTerm> {
  if (!context.user._id) throw new Error("Unauthorized");
  const gt = await GradtrakModel.findOne({ user_email: context.user._id });
  if (!gt) {
    throw new Error("No Gradtrak found for this user");
  }
  const planTermIndex = gt.planTerms.findIndex((sem) => sem._id as string == planTermID);
  if (planTermIndex === -1) {
    // update miscellaneous
    if (gt.miscellaneous._id == planTermID) {
      gt.miscellaneous.courses = courses.map(courseInput => new SelectedCourseModel(courseInput));
      gt.miscellaneous.custom_events = custom_events.map(customEventInput => new CustomEventModel(customEventInput));
      await gt.save();
      return formatPlanTerm(gt.miscellaneous);
    }
    throw new Error("PlanTerm does not exist in user's gradtrak");
  }
  gt.planTerms[planTermIndex].courses = courses.map(courseInput => new SelectedCourseModel(courseInput));
  gt.planTerms[planTermIndex].custom_events = custom_events.map(customEventInput => new CustomEventModel(customEventInput));
  await gt.save();
  return formatPlanTerm(gt.planTerms[planTermIndex]);
}

// create a new gradtrak
export async function createGradtrak(
  context: any
): Promise<Gradtrak> {
  if (!context.user._id) throw new Error("Unauthorized");
  // if existing gradtrak, overwrite
  const gt = await GradtrakModel.findOne({ user_email: context.user._id });
  if (gt) {
    throw new Error("User already has existing gradtrak");
  }
  const miscellaneous = new PlanTermModel({
    name: "Miscellaneous",
    courses: [],
    custom_events: [],
    user_email: context.user._id
  });
  const newGradtrak = await GradtrakModel.create({
    user_email: context.user._id,
    planTerms: [],
    miscellaneous: miscellaneous,
    college_reqs: [],
    uni_reqs: Uni_Reqs,
    major_reqs: [],
  });
  return formatGradtrak(newGradtrak);
}

export async function changeCollege(
  college: Colleges,
  context: any
): Promise<Gradtrak> {
  if (!context.user._id) throw new Error("Unauthorized");
  const gt = await GradtrakModel.findOne({ user_email: context.user._id });
  if (!gt) {
    throw new Error("No Gradtrak found for this user");
  }
  if (college as String == "LnS") {
    gt.college_reqs = LnS_Reqs;
  } else if (college as String == "CoE") {
    gt.college_reqs = CoE_Reqs;
  } else if (college as String == "HAAS") {
    gt.college_reqs = Haas_Reqs;
  } else {
    gt.college_reqs = [];
  }
  await gt.save();
  return formatGradtrak(gt);
}

export async function editMajorRequirements(
  major_reqs: MajorReqInput[],
  context: any
): Promise<Gradtrak> {
  if (!context.user._id) throw new Error("Unauthorized");
  const gt = await GradtrakModel.findOne({ user_email: context.user._id });
  if (!gt) {
    throw new Error("No Gradtrak found for this user");
  }
  gt.major_reqs = major_reqs.map(majorReqInput => new MajorReqModel(majorReqInput));
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