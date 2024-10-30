import { ISectionItem } from "@repo/common";
import { ClassSection } from "@repo/sis-api/classes";

import { getRequiredField } from "./utils";

export default function mapSectionToNewSection(
  original: ClassSection
): ISectionItem {
  const newSection: ISectionItem = {
    courseId: getRequiredField(
      original.class?.course?.identifiers?.find((i) => i.type == "cs-course-id")
        ?.id,
      "courseId",
      ""
    ),
    classNumber: getRequiredField(original.class?.number, "classNumber", ""),
    sessionId: getRequiredField(original.class?.session?.id, "sessionId", ""),
    termId: getRequiredField(original.class?.session?.term?.id, "termId", ""),
    sectionId: getRequiredField(original.id, "sectionId", 0),
    number: getRequiredField(original.number, "number", ""),
    component: getRequiredField(original.component?.code, "component.code", ""),
    status: getRequiredField(original.status?.code, "status.code", ""),
    instructionMode: getRequiredField(
      original.instructionMode?.code,
      "instructionMode.code",
      ""
    ),
    printInScheduleOfClasses: getRequiredField(
      original.printInScheduleOfClasses,
      "printInScheduleOfClasses",
      false
    ),
    graded: getRequiredField(original.graded, "graded", false),
    feesExist: getRequiredField(original.feesExist, "feesExist", false),
    startDate: getRequiredField(original.startDate, "startDate", ""),
    endDate: getRequiredField(original.endDate, "endDate", ""),
    addConsentRequired: getRequiredField(
      original.addConsentRequired?.code,
      "addConsentRequired.code",
      ""
    ),
    dropConsentRequired: getRequiredField(
      original.dropConsentRequired?.code,
      "dropConsentRequired.code",
      ""
    ),
    primary: getRequiredField(
      original.association?.primary,
      "association.primary",
      false
    ),
    type: getRequiredField(original.type?.code, "type.code", ""),
    combinedSections: getRequiredField(
      original.combination?.combinedSections,
      "combination.combinedSections",
      []
    ),
    enrollment: {
      status: getRequiredField(
        original.enrollmentStatus?.status?.code,
        "enrollmentStatus.status.code",
        ""
      ),
      enrolledCount: getRequiredField(
        original.enrollmentStatus?.enrolledCount,
        "enrollmentStatus.enrolledCount",
        0
      ),
      minEnroll: getRequiredField(
        original.enrollmentStatus?.minEnroll,
        "enrollmentStatus.minEnroll",
        0
      ),
      maxEnroll: getRequiredField(
        original.enrollmentStatus?.maxEnroll,
        "enrollmentStatus.maxEnroll",
        0
      ),
      waitlistedCount: getRequiredField(
        original.enrollmentStatus?.waitlistedCount,
        "enrollmentStatus.waitlistedCount",
        0
      ),
      maxWaitlist: getRequiredField(
        original.enrollmentStatus?.maxWaitlist,
        "enrollmentStatus.maxWaitlist",
        0
      ),
      reservations:
        original.enrollmentStatus?.seatReservations?.map((reservation) => ({
          number: getRequiredField(reservation.number, "reservation.number", 0),
          requirementGroup: getRequiredField(
            reservation.requirementGroup?.description,
            "reservation.requirementGroup.description",
            ""
          ),
          maxEnroll: getRequiredField(
            reservation.maxEnroll,
            "reservation.maxEnroll",
            0
          ),
          enrolledCount: getRequiredField(
            reservation.enrolledCount,
            "reservation.enrolledCount",
            0
          ),
        })) || [],
    },
    exams:
      original.exams?.map((exam) => ({
        date: getRequiredField(exam.date, "exam.date", ""),
        startTime: getRequiredField(exam.startTime, "exam.startTime", ""),
        endTime: getRequiredField(exam.endTime, "exam.endTime", ""),
        location: getRequiredField(
          exam.location?.description,
          "exam.location.description",
          ""
        ),
        number: getRequiredField(exam.number, "exam.number", 0),
        type: getRequiredField(exam.type?.code, "exam.type.code", ""),
      })) || [],
    meetings:
      original.meetings?.map((meeting) => ({
        number: getRequiredField(meeting.number, "meeting.number", 0),
        days: [
          meeting.meetsMonday,
          meeting.meetsTuesday,
          meeting.meetsWednesday,
          meeting.meetsThursday,
          meeting.meetsFriday,
          meeting.meetsSaturday,
          meeting.meetsSunday,
        ].map((day, index) =>
          getRequiredField(day, `meeting.day[${index}]`, false)
        ),
        startTime: getRequiredField(meeting.startTime, "meeting.startTime", ""),
        endTime: getRequiredField(meeting.endTime, "meeting.endTime", ""),
        startDate: getRequiredField(meeting.startDate, "meeting.startDate", ""),
        endDate: getRequiredField(meeting.endDate, "meeting.endDate", ""),
        location: getRequiredField(
          meeting.location?.description,
          "meeting.location.description",
          ""
        ),
        instructors:
          meeting.assignedInstructors?.map((instructor) => {
            const name =
              instructor.instructor?.names?.find(
                (n: any) => n.type?.code === "PRF"
              ) || instructor.instructor?.names?.[0];
            return {
              printInScheduleOfClasses: getRequiredField(
                instructor.printInScheduleOfClasses,
                "instructor.printInScheduleOfClasses",
                false
              ),
              familyName: getRequiredField(
                name?.familyName,
                "instructor.familyName",
                ""
              ),
              givenName: getRequiredField(
                name?.givenName,
                "instructor.givenName",
                ""
              ),
              role: getRequiredField(
                instructor.role?.code,
                "instructor.role.code",
                ""
              ),
            };
          }) || [],
      })) || [],
  };

  return newSection;
}
