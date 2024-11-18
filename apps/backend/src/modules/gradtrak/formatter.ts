import {
  GradtrakCustomEventType,
  PlanTermType,
  SelectedCourseType,
  GradtrakType,
} from "../../gradtrak";

import { GradtrakModule } from "./generated-types/module-types";

export function formatGradtrak(
  gradtrak: GradtrakType
): GradtrakModule.Gradtrak {
  return {
    user_email: gradtrak.user_email,
    planTerms: gradtrak.planTerms.map(formatPlanTerm),
    miscellaneous: formatPlanTerm(gradtrak.miscellaneous),
    uni_reqs: gradtrak.uni_reqs,
    college_reqs: gradtrak.college_reqs,
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
    user_email: planTerm.user_email,
    courses: planTerm.courses.map(formatCourse),
    term: planTerm.term ? formatTerm(planTerm.term.planTerm, planTerm.term.year) : undefined,
    custom_events: planTerm.custom_events
      ? planTerm.custom_events.map(formatCustomEvents)
      : undefined,
  };
}

function formatTerm(planTerm: string, year: number): GradtrakModule.Term {
  return {
    planTerm: planTerm,
    year: year,
  };
}

function formatCustomEvents(
  customEvent: GradtrakCustomEventType
): GradtrakModule.CustomEvent {
  return {
    start_time: customEvent.start_time,
    end_time: customEvent.end_time,
    title: customEvent.title,
    location: customEvent.location,
    description: customEvent.description,
    days_of_week: customEvent.days_of_week,
    college_reqs: customEvent.college_reqs,
    uni_reqs: customEvent.uni_reqs
  };
}

function formatCourse(
  course: SelectedCourseType
): GradtrakModule.SelectedCourse {
  return {
    class_ID: course.class_ID,
    primary_section_ID: course.primary_section_ID,
    secondary_section_IDs: course.secondary_section_IDs,
    college_reqs: course.college_reqs,
    uni_reqs: course.uni_reqs
  };
}
