import {
  PlanCustomEventType,
  PlanTermType,
  SelectedCourseType,
  PlanType,
  MajorReqType,
} from "@repo/common";

import { PlanModule } from "./generated-types/module-types";

export function formatPlan(
  plan: PlanType
): PlanModule.Plan {
  return {
    userEmail: plan.userEmail,
    planTerms: plan.planTerms.map(formatPlanTerm),
    miscellaneous: formatPlanTerm(plan.miscellaneous),
    uniReqs: plan.uniReqs,
    collegeReqs: plan.collegeReqs,
    majorReqs: plan.majorReqs.map(formatMajorReq),
    created: plan.createdAt.toISOString(),
    revised: plan.updatedAt.toISOString(),
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
    customEvents: planTerm.customEvents
      ? planTerm.customEvents.map(formatCustomEvents)
      : undefined,
  };
}

export function formatMajorReq(
  majorReq: MajorReqType
): PlanModule.MajorReq {
  return {
    name: majorReq.name,
    major: majorReq.major,
    numCoursesRequired: majorReq.numCoursesRequired,
    satisfyingCourseIds: majorReq.satisfyingCourseIds,
    isMinor: majorReq.isMinor ? majorReq.isMinor : false
  }
}

function formatCustomEvents(
  customEvent: PlanCustomEventType
): PlanModule.CustomEvent {
  return {
    title: customEvent.title,
    description: customEvent.description,
    collegeReqs: customEvent.collegeReqs,
    uniReqs: customEvent.uniReqs
  };
}

function formatCourse(
  course: SelectedCourseType
): PlanModule.SelectedCourse {
  return {
    classID: course.classID,
    collegeReqs: course.collegeReqs,
    uniReqs: course.uniReqs
  };
}
