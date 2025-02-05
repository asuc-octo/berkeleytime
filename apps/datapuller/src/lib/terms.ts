import { Logger } from "tslog";

import { Term, TermsAPI } from "@repo/sis-api/terms";
import { ITermItem } from "@repo/common";

const formatTerm = (term: Term) => {
  const academicCareerCode = term.academicCareer?.code;
  const temporalPosition = term.temporalPosition as "Current" | "Past" | "Future" | undefined;
  const id = term.id;
  const name = term.name;
  const academicYear = term.academicYear;
  const beginDate = term.beginDate;
  const endDate = term.endDate;
  const sessions = term.sessions;

  const essentialFields = {
    academicCareerCode,
    temporalPosition,
    id,
    name,
    academicYear,
    beginDate,
    endDate,
    sessions,
  };

  const missingField = Object.keys(essentialFields).find(
    (key) => !essentialFields[key as keyof typeof essentialFields]
  );

  if (missingField)
    throw new Error(`Missing essential section field: ${missingField[0]}`);


  const output: ITermItem = {
    academicCareerCode: academicCareerCode!,
    temporalPosition: temporalPosition!,
    id: id!,
    name: name!,
    academicYear: academicYear!,
    beginDate: beginDate!,
    endDate: endDate!,
    weeksOfInstruction: term.weeksOfInstruction,
    holidayScheduleCode: term.holidaySchedule?.code,
    censusDate: term.censusDate,
    fullyEnrolledDeadline: term.fullyEnrolledDeadline,
    fullyGradedDeadline: term.fullyGradedDeadline,
    cancelDeadline: term.cancelDeadline,
    withdrawNoPenaltyDeadline: term.withdrawNoPenaltyDeadline,
    degreeConferDate: term.degreeConferDate,
    selfServicePlanBeginDate: term.selfServicePlanBeginDate,
    selfServicePlanEndDate: term.selfServicePlanEndDate,
    selfServiceEnrollBeginDate: term.selfServiceEnrollBeginDate,
    selfServiceEnrollEndDate: term.selfServiceEnrollEndDate,
    sessions: term.sessions!.map((session) => ({
      temporalPosition: session.temporalPosition! as "Current" | "Past" | "Future",
      id: session.id!,
      name: session.name!,
      beginDate: session.beginDate!,
      endDate: session.endDate!,
      weeksOfInstruction: session.weeksOfInstruction,
      holidaySchedule: session.holidaySchedule?.code,
      censusDate: session.censusDate,
      sixtyPercentPoint: session.sixtyPercentPoint,
      openEnrollmentDate: session.openEnrollmentDate,
      enrollBeginDate: session.enrollBeginDate,
      enrollEndDate: session.enrollEndDate,
      waitListEndDate: session.waitListEndDate,
      fullyEnrolledDeadline: session.fullyEnrolledDeadline,
      dropDeletedFromRecordDeadline: session.dropDeletedFromRecordDeadline,
      dropRetainedOnRecordDeadline: session.dropRetainedOnRecordDeadline,
      dropWithPenaltyDeadline: session.dropWithPenaltyDeadline,
      cancelDeadline: session.cancelDeadline,
      withdrawNoPenaltyDeadline: session.withdrawNoPenaltyDeadline,
      withdrawWithPenaltyDeadline: session.withdrawWithPenaltyDeadline,
      timePeriods: session.timePeriods?.map((timePeriod) => ({
        periodDescription: timePeriod.period.description!,
        endDate: timePeriod.endDate,
      })),
    })),
  };

  return output;
}

/**
 * Fetch all active terms denoted by the "Previous", "Current", and "Next" temporal positions.
 */
export const getNearbyTerms = async (
  logger: Logger<unknown>,
  id: string,
  key: string
) => {
  const termsAPI = new TermsAPI();

  const temporalPositions = ["Previous", "Current", "Next"] as const;

  const terms: ITermItem[] = [];

  for (const temporalPosition of temporalPositions) {
    try {
      logger.info(`Fetching "${temporalPosition}" terms...`);

      const response = await termsAPI.v2.getByTermsUsingGet(
        {
          "temporal-position": temporalPosition,
        },
        {
          headers: {
            app_id: id,
            app_key: key,
          },
        }
      );

      // TODO: Filter out redundant terms
      const responseTerms = response.data.response.terms;
      if (!responseTerms) continue;

      terms.push(...responseTerms.map(formatTerm));
    } catch (error: unknown) {
      const parsedError = error as Error;

      logger.error(`Unexpected error fetching term: "${parsedError}"`);
      logger.error(`Error details: ${JSON.stringify(parsedError, null, 2)}`);

      if (!parsedError.cause) continue;

      logger.error(`Error cause: ${parsedError.cause}`);
    }
  }

  logger.info(`Fetched ${terms.length} active terms...`);

  return terms;
};

/**
 * Recursively fetch all terms.
 */
export const getAllTerms = async (
  logger: Logger<unknown>,
  id: string,
  key: string
) => {
  const termsAPI = new TermsAPI();

  const terms: ITermItem[] = [];

  logger.info(`Fetching initial terms...`);

  try {
    const initialResponse = await termsAPI.v2.getByTermsUsingGet(
      {
        "temporal-position": "Next",
      },
      {
        headers: {
          app_id: id,
          app_key: key,
        },
      }
    );

    const initialTerms = initialResponse.data.response.terms;
    if (!initialTerms) throw new Error("No initial terms found");

    terms.push(...initialTerms.map(formatTerm));
  } catch (error: unknown) {
    const parsedError = error as Error;

    logger.error(`Unexpected error fetching term: "${parsedError}"`);
    logger.error(`Error details: ${JSON.stringify(parsedError, null, 2)}`);
    logger.error(`Error cause: ${parsedError.cause}`);

    return terms;
  }

  logger.info(`Fetched ${terms.length} initial terms...`);

  let currentTerm = terms[0];

  logger.info(`Fetching remaining terms...`);

  while (currentTerm) {
    try {
      if (!currentTerm.beginDate)
        throw new Error(`No "beginDate" found for term ${currentTerm.id}`);

      const currentResponse = await termsAPI.v2.getByTermsUsingGet(
        {
          "temporal-position": "Previous",
          "as-of-date": currentTerm.beginDate,
        },
        {
          headers: {
            app_id: id,
            app_key: key,
          },
        }
      );

      const currentTerms = currentResponse.data.response.terms;
      if (!currentTerms) throw new Error("No terms found");

      const additionalTerms = currentTerms.map(formatTerm);
      terms.push(...additionalTerms);
      currentTerm = additionalTerms[0];
    } catch (error: unknown) {
      const parsedError = error as Error;

      logger.error(`Unexpected error fetching term: "${parsedError}"`);
      logger.error(`Error details: ${JSON.stringify(parsedError, null, 2)}`);
      logger.error(`Error cause: ${parsedError.cause}`);

      break;
    }
  }

  logger.info(`Fetched ${terms.length} total terms...`);

  return terms;
};
