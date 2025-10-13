import { Logger } from "tslog";

import { IEnrollmentSingularItem } from "@repo/common";
import { ClassSection, ClassesAPI } from "@repo/sis-api/classes";

import { fetchPaginatedData } from "./api/sis-api";
import { filterSection } from "./sections";

const formatEnrollmentSingular = (input: ClassSection, time: Date) => {
  const termId = input.class?.session?.term?.id;
  const year = input.class?.session?.term?.name?.split(" ")[0];
  const semester = input.class?.session?.term?.name?.split(" ")[1];
  const sessionId = input.class?.session?.id;
  const sectionId = input.id?.toString();
  const subject = input.class?.course?.subjectArea?.code?.replaceAll(" ", "");
  const courseNumber = input.class?.course?.catalogNumber?.formatted;
  const sectionNumber = input.number;

  const essentialFields = {
    termId,
    year,
    semester,
    sessionId,
    sectionId,
    subject,
    courseNumber,
    sectionNumber,
  };

  const missingField = Object.keys(essentialFields).find(
    (key) => !essentialFields[key as keyof typeof essentialFields]
  );

  if (missingField)
    throw new Error(`Missing essential section field: ${missingField[0]}`);

  const output: IEnrollmentSingularItem = {
    termId: termId!,
    year: parseInt(year!),
    semester: semester!,
    sessionId: sessionId!,
    sectionId: sectionId!,
    subject: subject!,
    courseNumber: courseNumber!,
    sectionNumber: sectionNumber!,

    data: {
      time: time.toISOString(),
      status: input.enrollmentStatus?.status?.code,
      enrolledCount: input.enrollmentStatus?.enrolledCount ?? 0,
      reservedCount: input.enrollmentStatus?.reservedCount ?? 0,
      waitlistedCount: input.enrollmentStatus?.waitlistedCount ?? 0,
      minEnroll: input.enrollmentStatus?.minEnroll ?? undefined,
      maxEnroll: input.enrollmentStatus?.maxEnroll ?? 0,
      maxWaitlist: input.enrollmentStatus?.maxWaitlist ?? 0,
      openReserved: input.enrollmentStatus?.openReserved ?? 0,
      instructorAddConsentRequired:
        input.enrollmentStatus?.instructorAddConsentRequired,
      instructorDropConsentRequired:
        input.enrollmentStatus?.instructorDropConsentRequired,
      seatReservationCounts: input.enrollmentStatus?.seatReservations?.map(
        (reservation) => ({
          number: reservation.number ?? 0,
          maxEnroll: reservation.maxEnroll ?? 0,
          enrolledCount: reservation.enrolledCount ?? 0,
        })
      ),
    },
    seatReservationTypes: input.enrollmentStatus?.seatReservations
      ?.filter((reservation) => reservation.requirementGroup?.description)
      .map((reservation) => ({
        number: reservation.number ?? 0,
        requirementGroup: reservation.requirementGroup?.description!,
        fromDate: reservation.fromDate ?? "",
      })),
  };

  return output;
};

export const getEnrollmentSingulars = async (
  logger: Logger<unknown>,
  id: string,
  key: string,
  termIds?: string[]
) => {
  const classesAPI = new ClassesAPI();

  const sections = await fetchPaginatedData(
    logger,
    classesAPI.v1,
    termIds || null,
    "getClassSectionsUsingGet",
    {
      app_id: id,
      app_key: key,
    },
    (data) => data.apiResponse?.response.classSections || [],
    filterSection,
    (input) => formatEnrollmentSingular(input, new Date())
  );

  return sections;
};
