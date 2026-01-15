import { omitBy } from "lodash";
import { Types } from "mongoose";

import {
  LabelModel,
  MajorReqModel,
  PlanModel,
  PlanRequirementModel,
  PlanTermModel,
  SelectedCourseModel,
  SelectedPlanRequirementModel,
} from "@repo/common";

import {
  Colleges,
  EditPlanTermInput,
  Plan,
  PlanInput,
  PlanRequirement,
  PlanTerm,
  PlanTermInput,
  SelectedCourseInput,
  SelectedPlanRequirementInput,
  UpdateManualOverrideInput,
} from "../../generated-types/graphql";
import { RequestContext } from "../../types/request-context";
import { formatPlan, formatPlanTerm } from "./formatter";

// get plan for a user
export async function getPlanByUser(context: RequestContext): Promise<Plan[]> {
  if (!context.user?.email) throw new Error("Unauthorized");
  const userEmail = context.user.email;

  const gt = await PlanModel.findOne({ userEmail });
  if (!gt) {
    throw new Error("No Plan found for this user");
  }
  const tmp = formatPlan(gt);
  return tmp ? [tmp] : [];
}

// delete a planTerm specified by ObjectID
export async function removePlanTerm(
  planTermID: string,
  context: RequestContext
): Promise<string> {
  if (!context.user?.email) throw new Error("Unauthorized");
  const userEmail = context.user.email;

  // check if planTerm belongs to plan
  const gt = await PlanModel.findOne({ userEmail });
  if (!gt) {
    throw new Error("No Plan found for this user");
  }
  const planTermIndex = gt.planTerms.findIndex(
    (sem) => (sem._id as Types.ObjectId).toString() === planTermID
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
  context: RequestContext
): Promise<PlanTerm> {
  if (!context.user?.email) throw new Error("Unauthorized");
  const userEmail = context.user.email;
  const nonNullPlanTerm = omitBy(mainPlanTerm, (value) => value == null);
  nonNullPlanTerm.userEmail = userEmail;
  const newPlanTerm = new PlanTermModel({
    ...nonNullPlanTerm,
  });

  // add to plan in chronological order
  const gt = await PlanModel.findOne({ userEmail });
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
  mainPlanTerm: EditPlanTermInput,
  context: RequestContext
): Promise<PlanTerm> {
  if (!context.user?.email) throw new Error("Unauthorized");
  const userEmail = context.user.email;
  const gt = await PlanModel.findOne({ userEmail });
  if (!gt) {
    throw new Error("No Plan found for this user");
  }

  const planTermIndex = gt.planTerms.findIndex(
    (sem) => (sem._id as Types.ObjectId).toString() === planTermID
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
  context: RequestContext
): Promise<PlanTerm> {
  if (!context.user?.email) throw new Error("Unauthorized");
  const userEmail = context.user.email;
  const gt = await PlanModel.findOne({ userEmail });
  if (!gt) {
    throw new Error("No Plan found for this user");
  }
  const planTermIndex = gt.planTerms.findIndex(
    (sem) => (sem._id as Types.ObjectId).toString() === planTermID
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
  colleges: Colleges[],
  majors: string[],
  minors: string[],
  startYear: number,
  endYear: number,
  context: RequestContext
): Promise<Plan> {
  if (!context.user?.email) throw new Error("Unauthorized");
  const userEmail = context.user.email;
  // if existing plan, overwrite
  const gt = await PlanModel.findOne({ userEmail });
  if (gt) {
    throw new Error("User already has existing plan");
  }
  const miscellaneous = new PlanTermModel({
    name: "Miscellaneous",
    courses: [],
    userEmail,
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
      userEmail,
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
        userEmail,
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
        userEmail,
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
      userEmail,
      year: endYear,
      term: "Spring",
      hidden: false,
      status: "None",
      pinned: false,
    })
  );

  const newPlan = await PlanModel.create({
    userEmail,
    planTerms: planTerms,
    majors: majors,
    minors: minors,
    majorReqs: [],
    colleges: colleges,
    labels: [],
    uniReqsSatisfied: [],
    collegeReqsSatisfied: [],
  });
  return formatPlan(newPlan);
}

export async function editPlan(
  plan: PlanInput,
  context: RequestContext
): Promise<Plan> {
  if (!context.user?.email) throw new Error("Unauthorized");
  const userEmail = context.user.email;
  const gt = await PlanModel.findOne({ userEmail });
  if (!gt) {
    throw new Error("No Plan found for this user");
  }

  if (plan.colleges != null) {
    gt.colleges = plan.colleges;
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

export async function deletePlan(context: RequestContext): Promise<string> {
  if (!context.user?.email) throw new Error("Unauthorized");
  const userEmail = context.user.email;
  await PlanModel.deleteOne({ userEmail });
  return userEmail;
}

// Get PlanRequirements by majors and minors
export async function getPlanRequirementsByMajorsAndMinors(
  majors: string[],
  minors: string[]
): Promise<PlanRequirement[]> {
  const requirements = await PlanRequirementModel.find({
    $or: [{ major: { $in: majors } }, { minor: { $in: minors } }],
  });

  return requirements.map((req) => ({
    _id: (req._id as Types.ObjectId).toString(),
    code: req.code,
    isUcReq: req.isUcReq,
    college: req.college || null,
    major: req.major || null,
    minor: req.minor || null,
    createdBy: req.createdBy,
    isOfficial: req.isOfficial,
    createdAt: req.createdAt?.toISOString() || "",
    updatedAt: req.updatedAt?.toISOString() || "",
  }));
}

// Get UC requirements
export async function getUcRequirements(): Promise<PlanRequirement[]> {
  const requirements = await PlanRequirementModel.find({ isUcReq: true });

  return requirements.map((req) => ({
    _id: (req._id as Types.ObjectId).toString(),
    code: req.code,
    isUcReq: req.isUcReq,
    college: req.college || null,
    major: req.major || null,
    minor: req.minor || null,
    createdBy: req.createdBy,
    isOfficial: req.isOfficial,
    createdAt: req.createdAt?.toISOString() || "",
    updatedAt: req.updatedAt?.toISOString() || "",
  }));
}

// Get college requirements
export async function getCollegeRequirements(
  college: string
): Promise<PlanRequirement[]> {
  const requirements = await PlanRequirementModel.find({ college });

  return requirements.map((req) => ({
    _id: (req._id as Types.ObjectId).toString(),
    code: req.code,
    isUcReq: req.isUcReq,
    college: req.college || null,
    major: req.major || null,
    minor: req.minor || null,
    createdBy: req.createdBy,
    isOfficial: req.isOfficial,
    createdAt: req.createdAt?.toISOString() || "",
    updatedAt: req.updatedAt?.toISOString() || "",
  }));
}

// Get PlanRequirement by ID
export async function getPlanRequirementById(
  id: string
): Promise<PlanRequirement | null> {
  const requirement = await PlanRequirementModel.findById(id);
  if (!requirement) {
    return null;
  }

  return {
    _id: (requirement._id as Types.ObjectId).toString(),
    code: requirement.code,
    isUcReq: requirement.isUcReq,
    college: requirement.college || null,
    major: requirement.major || null,
    minor: requirement.minor || null,
    createdBy: requirement.createdBy,
    isOfficial: requirement.isOfficial,
    createdAt: requirement.createdAt?.toISOString() || "",
    updatedAt: requirement.updatedAt?.toISOString() || "",
  };
}

// Update manual override for a specific requirement
export async function updateManualOverride(
  input: UpdateManualOverrideInput,
  context: RequestContext
): Promise<Plan> {
  if (!context.user?.email) throw new Error("Unauthorized");
  const userEmail = context.user.email;

  const gt = await PlanModel.findOne({ userEmail });
  if (!gt) {
    throw new Error("No Plan found for this user");
  }

  // Find the selectedPlanRequirement
  const sprIndex = gt.selectedPlanRequirements.findIndex(
    (spr) => spr.planRequirementId.toString() === input.planRequirementId
  );

  if (sprIndex === -1) {
    throw new Error("SelectedPlanRequirement not found in user's plan");
  }

  // Update the manual override at the specified index
  const spr = gt.selectedPlanRequirements[sprIndex];
  if (
    input.requirementIndex < 0 ||
    input.requirementIndex >= spr.manualOverrides.length
  ) {
    // Extend the array if needed
    while (spr.manualOverrides.length <= input.requirementIndex) {
      spr.manualOverrides.push(undefined);
    }
  }
  spr.manualOverrides[input.requirementIndex] = input.manualOverride;

  await gt.save();
  return formatPlan(gt);
}

// Update all selectedPlanRequirements
export async function updateSelectedPlanRequirements(
  selectedPlanRequirements: SelectedPlanRequirementInput[],
  context: RequestContext
): Promise<Plan> {
  if (!context.user?.email) throw new Error("Unauthorized");
  const userEmail = context.user.email;

  const gt = await PlanModel.findOne({ userEmail });
  if (!gt) {
    throw new Error("No Plan found for this user");
  }

  gt.selectedPlanRequirements = selectedPlanRequirements.map(
    (spr) =>
      new SelectedPlanRequirementModel({
        planRequirementId: new Types.ObjectId(spr.planRequirementId),
        manualOverrides: spr.manualOverrides,
      })
  );

  await gt.save();
  return formatPlan(gt);
}
