import {
  GradtrakCustomEventType,
  PlanTermType,
  SelectedCourseType,
  GradtrakType,
  MajorReqType,
} from "@repo/common";

import { GradtrakModule } from "./generated-types/module-types";

export function formatGradtrak(
  gradtrak: GradtrakType
): GradtrakModule.Gradtrak {
  return {
    userEmail: gradtrak.userEmail,
    planTerms: gradtrak.planTerms.map(formatPlanTerm),
    miscellaneous: formatPlanTerm(gradtrak.miscellaneous),
    uniReqs: gradtrak.uniReqs,
    collegeReqs: gradtrak.collegeReqs,
    majorReqs: gradtrak.majorReqs.map(formatMajorReq),
    created: gradtrak.createdAt.toISOString(),
    revised: gradtrak.updatedAt.toISOString(),
  };
}

export function formatPlanTerm(
  planTerm: PlanTermType
): GradtrakModule.PlanTerm {
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
): GradtrakModule.MajorReq {
  return {
    name: majorReq.name,
    major: majorReq.major,
    numCoursesRequired: majorReq.numCoursesRequired,
    satisfyingCourseIds: majorReq.satisfyingCourseIds,
    isMinor: majorReq.isMinor ? majorReq.isMinor : false
  }
}

function formatCustomEvents(
  customEvent: GradtrakCustomEventType
): GradtrakModule.CustomEvent {
  return {
    title: customEvent.title,
    description: customEvent.description,
    collegeReqs: customEvent.collegeReqs,
    uniReqs: customEvent.uniReqs
  };
}

function formatCourse(
  course: SelectedCourseType
): GradtrakModule.SelectedCourse {
  return {
    classID: course.classID,
    collegeReqs: course.collegeReqs,
    uniReqs: course.uniReqs
  };
}
