import { Types } from "mongoose";

import {
  LabelType,
  MajorReqType,
  PlanTermType,
  PlanType,
  SelectedCourseType,
  SelectedPlanRequirementType,
} from "@repo/common";

import {
  CollegeReqs,
  Colleges,
  Status,
  Terms,
  UniReqs,
} from "../../generated-types/graphql";
import { PlanModule } from "./generated-types/module-types";

export function formatPlan(plan: PlanType): PlanModule.Plan {
  return {
    _id: (plan._id as Types.ObjectId).toString(),
    userEmail: plan.userEmail,
    planTerms: plan.planTerms.map(formatPlanTerm),
    majors: plan.majors,
    minors: plan.minors,
    colleges: plan.colleges.map((college) => college as Colleges),
    majorReqs: plan.majorReqs.map(formatMajorReq),
    created: plan.createdAt.toISOString(),
    revised: plan.updatedAt.toISOString(),
    labels: plan.labels.map(formatLabel),
    uniReqsSatisfied: plan.uniReqsSatisfied as UniReqs[],
    collegeReqsSatisfied: plan.collegeReqsSatisfied as CollegeReqs[],
    selectedPlanRequirements: (plan.selectedPlanRequirements || []).map(
      formatSelectedPlanRequirement
    ),
  };
}

function formatSelectedPlanRequirement(
  spr: SelectedPlanRequirementType
): PlanModule.SelectedPlanRequirement & { planRequirementId: string } {
  return {
    planRequirementId: spr.planRequirementId.toString(),
    manualOverrides: spr.manualOverrides,
  } as PlanModule.SelectedPlanRequirement & { planRequirementId: string };
}

export function formatPlanTerm(planTerm: PlanTermType): PlanModule.PlanTerm {
  return {
    _id: (planTerm._id as Types.ObjectId).toString(),
    name: planTerm.name,
    userEmail: planTerm.userEmail,
    courses: planTerm.courses.map(formatCourse),
    year: planTerm.year,
    term: planTerm.term as Terms,
    hidden: planTerm.hidden,
    status: planTerm.status as Status,
    pinned: planTerm.pinned,
  };
}

export function formatMajorReq(majorReq: MajorReqType): PlanModule.MajorReq {
  return {
    name: majorReq.name,
    major: majorReq.major,
    numCoursesRequired: majorReq.numCoursesRequired,
    satisfyingCourseIds: majorReq.satisfyingCourseIds
      ? majorReq.satisfyingCourseIds
      : [],
    isMinor: majorReq.isMinor ? majorReq.isMinor : false,
  };
}

function formatCourse(course: SelectedCourseType): PlanModule.SelectedCourse {
  return {
    courseID: course.courseID,
    courseName: course.courseName,
    courseTitle: course.courseTitle,
    courseUnits: course.courseUnits,
    collegeReqs: course.collegeReqs as CollegeReqs[],
    uniReqs: course.uniReqs as UniReqs[],
    labels: course.labels,
    pnp: course.pnp,
    transfer: course.transfer,
  };
}

function formatLabel(label: LabelType): PlanModule.Label {
  return {
    name: label.name,
    color: label.color,
  };
}
