import { ISectionItem } from "@repo/common";
import { ClassSection } from "@repo/sis-api/classes";

export default function mapSectionToNewSection(
  original: ClassSection
): ISectionItem {
  const courseId = original.class?.course?.identifiers?.find(
    (i) => i.type === "cs-course-id"
  )?.id;
  const classNumber = original.class?.number;
  const sectionId = original.id?.toString();
  const number = original.number;
  const subject = original.class?.course?.subjectArea?.code?.replaceAll(" ", "");
  const courseNumber = original.class?.course?.catalogNumber?.formatted;
  const year = parseInt(
    original.class?.session?.term?.name?.split(" ")[0] || "0",
    10
  );
  const semester = original.class?.session?.term?.name?.split(" ")[1] || "";

  if (
    !courseId ||
    !classNumber ||
    !sectionId ||
    !number ||
    !subject ||
    !courseNumber ||
    !year ||
    !semester
  ) {
    throw new Error("Missing essential section fields");
  }

  const newSection: ISectionItem = {
    courseId,
    classNumber,
    sessionId: original.class?.session?.id,
    termId: original.class?.session?.term?.id,
    sectionId,
    number,
    subject,
    courseNumber,
    year,
    semester,
    component: original.component?.code,
    status: original.status?.code,
    instructionMode: original.instructionMode?.code,
    printInScheduleOfClasses: original.printInScheduleOfClasses,
    graded: original.graded,
    feesExist: original.feesExist,
    startDate: original.startDate,
    endDate: original.endDate,
    addConsentRequired: original.addConsentRequired?.code,
    dropConsentRequired: original.dropConsentRequired?.code,
    primary: original.association?.primary,
    type: original.type?.code,
    combinedSections: original.combination?.combinedSections,
    enrollment: {
      status: original.enrollmentStatus?.status?.code,
      enrolledCount: original.enrollmentStatus?.enrolledCount,
      minEnroll: original.enrollmentStatus?.minEnroll,
      maxEnroll: original.enrollmentStatus?.maxEnroll,
      waitlistedCount: original.enrollmentStatus?.waitlistedCount,
      maxWaitlist: original.enrollmentStatus?.maxWaitlist,
      reservations: original.enrollmentStatus?.seatReservations?.map(
        (reservation) => ({
          number: reservation.number,
          requirementGroup: reservation.requirementGroup?.description,
          maxEnroll: reservation.maxEnroll,
          enrolledCount: reservation.enrolledCount,
        })
      ),
    },
    exams: original.exams?.map((exam) => ({
      date: exam.date,
      startTime: exam.startTime,
      endTime: exam.endTime,
      location: exam.location?.description,
      number: exam.number,
      type: exam.type?.code,
    })),
    meetings: original.meetings?.map((meeting) => ({
      number: meeting.number,
      days: [
        meeting.meetsMonday || false,
        meeting.meetsTuesday || false,
        meeting.meetsWednesday || false,
        meeting.meetsThursday || false,
        meeting.meetsFriday || false,
        meeting.meetsSaturday || false,
        meeting.meetsSunday || false,
      ],
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      startDate: meeting.startDate,
      endDate: meeting.endDate,
      location: meeting.location?.description,
      instructors: meeting.assignedInstructors?.map((instructor) => {
        const name =
          instructor.instructor?.names?.find(
            (n: any) => n.type?.code === "PRF"
          ) || instructor.instructor?.names?.[0];
        return {
          printInScheduleOfClasses: instructor.printInScheduleOfClasses,
          familyName: name?.familyName,
          givenName: name?.givenName,
          role: instructor.role?.code,
        };
      }),
    })),
  };

  return newSection;
}
