import { Logger } from "tslog";

import { ISectionItem } from "@repo/common";
import { ClassSection, ClassesAPI } from "@repo/sis-api/classes";

import { fetchPaginatedData } from "./api/sis-api";

const filterSection = (input: ClassSection): boolean => {
  return input.status?.code === "A";
};

export const formatSection = (input: ClassSection) => {
  // Remove whitespace to prevent ambiguity
  const subject = input.class?.course?.subjectArea?.code?.replaceAll(" ", "");

  const courseId = input.class?.course?.identifiers?.find(
    (i) => i.type === "cs-course-id"
  )?.id;
  const sessionId = input.class?.session?.id;
  const termId = input.class?.session?.term?.id;
  const courseNumber = input.class?.course?.catalogNumber?.formatted;
  const classNumber = input.class?.number;
  const number = input.number;
  const sectionId = input.id?.toString();
  const semester = input.class?.session?.term?.name?.split(" ")[1];
  const year = input.class?.session?.term?.name?.split(" ")[0];

  const essentialFields = {
    courseId,
    sessionId,
    termId,
    classNumber,
    sectionId,
    number,
    subject,
    courseNumber,
    year,
    semester,
  };

  const missingField = Object.keys(essentialFields).find(
    (key) => !essentialFields[key as keyof typeof essentialFields]
  );

  if (missingField)
    throw new Error(`Missing essential section field: ${missingField[0]}`);

  const output: ISectionItem = {
    courseId: courseId!,
    classNumber: classNumber!,
    sessionId: input.class?.session?.id,
    termId: input.class?.session?.term?.id,
    sectionId: sectionId!,
    number: number!,
    subject: subject!,
    courseNumber: courseNumber!,
    year: parseInt(year!),
    semester: semester!,
    component: input.component?.code,
    status: input.status?.code,
    instructionMode: input.instructionMode?.code,
    printInScheduleOfClasses: input.printInScheduleOfClasses,
    graded: input.graded,
    feesExist: input.feesExist,
    startDate: input.startDate,
    endDate: input.endDate,
    addConsentRequired: input.addConsentRequired?.code,
    dropConsentRequired: input.dropConsentRequired?.code,
    primary: input.association?.primary,
    type: input.type?.code,
    combinedSections: input.combination?.combinedSections,
    enrollment: {
      status: input.enrollmentStatus?.status?.code,
      enrolledCount: input.enrollmentStatus?.enrolledCount,
      minEnroll: input.enrollmentStatus?.minEnroll,
      maxEnroll: input.enrollmentStatus?.maxEnroll,
      waitlistedCount: input.enrollmentStatus?.waitlistedCount,
      maxWaitlist: input.enrollmentStatus?.maxWaitlist,
      reservations: input.enrollmentStatus?.seatReservations?.map(
        (reservation) => ({
          number: reservation.number,
          requirementGroup: reservation.requirementGroup?.description,
          maxEnroll: reservation.maxEnroll,
          enrolledCount: reservation.enrolledCount,
        })
      ),
    },
    exams: input.exams?.map((exam) => ({
      date: exam.date,
      startTime: exam.startTime,
      endTime: exam.endTime,
      location: exam.location?.description,
      number: exam.number,
      type: exam.type?.code,
    })),
    meetings: input.meetings?.map((meeting) => ({
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

  return output;
};

export const getSections = async (
  logger: Logger<unknown>,
  id: string,
  key: string,
  termIds?: string[]
) => {
  const classesAPI = new ClassesAPI();

  const sections = await fetchPaginatedData<ISectionItem, ClassSection>(
    logger,
    classesAPI.v1,
    termIds || null,
    "getClassSectionsUsingGet",
    {
      app_id: id,
      app_key: key,
    },
    (data) => data.apiResponse.response.classSections || [],
    filterSection,
    formatSection
  );

  return sections;
};
