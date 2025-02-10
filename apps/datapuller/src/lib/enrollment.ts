import { Logger } from "tslog";

import { IEnrollmentSingularItem } from "@repo/common";
import { ClassSection, ClassesAPI } from "@repo/sis-api/classes";

import { fetchPaginatedData } from "./api/sis-api";
import { filterSection } from "./sections";

const formatEnrollmentSingular = (input: ClassSection, time: Date) => {
  const termId = input.class?.session?.term?.id;
  const sessionId = input.class?.session?.id;
  const sectionId = input.id?.toString();

  const essentialFields = {
    termId,
    sessionId,
    sectionId,
  };

  const missingField = Object.keys(essentialFields).find(
    (key) => !essentialFields[key as keyof typeof essentialFields]
  );

  if (missingField)
    throw new Error(`Missing essential section field: ${missingField[0]}`);

  const output: IEnrollmentSingularItem = {
    termId: termId!,
    sessionId: sessionId!,
    sectionId: sectionId!,
    data: {
      time: time.toISOString(),
      status: input.enrollmentStatus?.status?.code,
      enrolledCount: input.enrollmentStatus?.enrolledCount,
      reservedCount: input.enrollmentStatus?.reservedCount,
      waitlistedCount: input.enrollmentStatus?.waitlistedCount,
      minEnroll: input.enrollmentStatus?.minEnroll,
      maxEnroll: input.enrollmentStatus?.maxEnroll,
      maxWaitlist: input.enrollmentStatus?.maxWaitlist,
      openReserved: input.enrollmentStatus?.openReserved,
      instructorAddConsentRequired:
        input.enrollmentStatus?.instructorAddConsentRequired,
      instructorDropConsentRequired:
        input.enrollmentStatus?.instructorDropConsentRequired,
      seatReservations: input.enrollmentStatus?.seatReservations?.map(
        (reservation) => ({
          number: reservation.number,
          maxEnroll: reservation.maxEnroll,
          enrolledCount: reservation.enrolledCount,
        })
      ),
    },
    seatReservations: input.enrollmentStatus?.seatReservations?.map(
      (reservation) => ({
        number: reservation.number,
        requirementGroup: reservation.requirementGroup?.description,
        fromDate: reservation.fromDate,
      })
    ),
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

  const sections = await fetchPaginatedData<
    IEnrollmentSingularItem,
    ClassSection
  >(
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
    (input) => formatEnrollmentSingular(input, new Date())
  );

  return sections;
};
