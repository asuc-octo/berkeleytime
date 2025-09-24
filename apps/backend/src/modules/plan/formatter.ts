import {
  PlanTermType,
  SelectedCourseType,
  PlanType,
  MajorReqType,
  LabelType,
} from "@repo/common";

import { PlanModule } from "./generated-types/module-types";

export function formatPlan(
  plan: PlanType
): PlanModule.Plan {
  return {
    _id: plan._id as string,
    userEmail: plan.userEmail,
    planTerms: plan.planTerms.map(formatPlanTerm),
    majors: plan.majors,
    minors: plan.minors,
    college: plan.college,
    majorReqs: plan.majorReqs.map(formatMajorReq),
    created: plan.createdAt.toISOString(),
    revised: plan.updatedAt.toISOString(),
    labels: plan.labels.map(formatLabel),
    uniReqsSatisfied: plan.uniReqsSatisfied,
    collegeReqsSatisfied: plan.collegeReqsSatisfied
  };
}

export function formatPlanTerm(
  planTerm: PlanTermType
): PlanModule.PlanTerm {
  return {
    _id: planTerm._id as string,
    name: planTerm.name,
    userEmail: planTerm.userEmail,
    courses: planTerm.courses.map(formatCourse),
    year: planTerm.year,
    term: planTerm.term,
    hidden: planTerm.hidden,
    status: planTerm.status,
    pinned: planTerm.pinned
  };
}

export function formatMajorReq(
  majorReq: MajorReqType
): PlanModule.MajorReq {
  return {
    name: majorReq.name,
    major: majorReq.major,
    numCoursesRequired: majorReq.numCoursesRequired,
    satisfyingCourseIds: majorReq.satisfyingCourseIds ? majorReq.satisfyingCourseIds : [],
    isMinor: majorReq.isMinor ? majorReq.isMinor : false
  }
}

function formatCourse(
  course: SelectedCourseType
): PlanModule.SelectedCourse {
  return {
    courseID: course.courseID,
    courseName: course.courseName,
    courseTitle: course.courseTitle,
    courseUnits: course.courseUnits,
    collegeReqs: course.collegeReqs,
    uniReqs: course.uniReqs,
    labels: course.labels,
    pnp: course.pnp,
    transfer: course.transfer
  };
}

function formatLabel(
  label: LabelType
): PlanModule.Label {
  return {
    name: label.name,
    color: label.color
  };
}