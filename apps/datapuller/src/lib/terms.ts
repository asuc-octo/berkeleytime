import { Logger } from "tslog";

import { Term, TermsAPI } from "@repo/sis-api/terms";

/**
 * Fetch all active terms denoted by the "Current" and "Next" temporal positions.
 */
export const getActiveTerms = async (
  logger: Logger<unknown>,
  id: string,
  key: string
) => {
  const termsAPI = new TermsAPI();

  const temporalPositions = ["Current", "Next"] as const;

  const terms: Term[] = [];

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
      const currentTerms = response.data.response.terms;
      if (!currentTerms) continue;

      terms.push(...currentTerms);
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
 * Recursively fetch all terms denoted by the "Previous" temporal position.
 */
export const getTerms = async (
  logger: Logger<unknown>,
  id: string,
  key: string
) => {
  const termsAPI = new TermsAPI();

  const terms: Term[] = [];

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

    // TODO: Filter out redundant terms
    const initialTerms = initialResponse.data.response.terms;
    if (!initialTerms) throw new Error("No initial terms found");

    terms.push(...initialTerms);
  } catch (error: unknown) {
    const parsedError = error as Error;

    logger.error(`Unexpected error fetching term: "${parsedError}"`);
    logger.error(`Error details: ${JSON.stringify(parsedError, null, 2)}`);

    if (!parsedError.cause) return;

    logger.error(`Error cause: ${parsedError.cause}`);
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
      if (!currentTerms) continue;

      terms.push(...currentTerms);
    } catch (error: unknown) {
      const parsedError = error as Error;

      logger.error(`Unexpected error fetching term: "${parsedError}"`);
      logger.error(`Error details: ${JSON.stringify(parsedError, null, 2)}`);

      if (!parsedError.cause) continue;

      logger.error(`Error cause: ${parsedError.cause}`);
    }
  }

  logger.info(`Fetched ${terms.length} total terms...`);

  return terms;
};

/**
 * Fetch all previous terms denoted by the "Previous" temporal position.
 */
export const getPreviousTerms = async (
  logger: Logger<unknown>,
  id: string,
  key: string
) => {
  const termsAPI = new TermsAPI();

  logger.info(`Fetching previous terms...`);

  try {
    const response = await termsAPI.v2.getByTermsUsingGet(
      {
        "temporal-position": "Previous",
        "as-of-date": new Date().toISOString().split("T")[0], // format as yyyy-mm-dd
      },
      {
        headers: {
          app_id: id,
          app_key: key,
        },
      }
    );

    const previousTerms = response.data.response.terms;
    if (!previousTerms) throw new Error("No previous terms found");

    logger.info(`Fetched current term...`);

    return previousTerms;
  } catch (error: unknown) {
    const parsedError = error as Error;

    logger.error(`Unexpected error fetching term: "${parsedError}"`);
    logger.error(`Error details: ${JSON.stringify(parsedError, null, 2)}`);

    if (!parsedError.cause) return;

    logger.error(`Error cause: ${parsedError.cause}`);
  }
};
