import { ClassModel, TermModel } from "@repo/common";

import { warmCatalogCacheForTerms } from "../lib/cache-warming";
import { getClasses } from "../lib/classes";
import { Config } from "../shared/config";
import {
  type TermSelector,
  getActiveTerms,
  getLastFiveYearsTerms,
} from "../shared/term-selectors";

const TERMS_PER_API_BATCH = 4;

// Note: We scan ALL terms in the database rather than just the affected ones.
// This is intentional to ensure data consistency, as class data may be modified
// by sources other than the datapuller. Since the query is fast, the overhead
// is minimal. Future optimization could track only affected terms if needed.
const updateTermsCatalogDataFlags = async (log: Config["log"]) => {
  log.trace("Updating hasCatalogData flags for all terms...");

  const allTerms = await TermModel.find({}).select({ _id: 1, name: 1 }).lean();

  // Single aggregation query to get all year+semester combinations with catalog data
  const termsWithClasses = await ClassModel.aggregate<{
    _id: { year: number; semester: string };
  }>([
    {
      $match: {
        anyPrintInScheduleOfClasses: true,
      },
    },
    {
      $group: {
        _id: { year: "$year", semester: "$semester" },
      },
    },
  ]);

  const catalogDataSet = new Set(
    termsWithClasses.map((t) => `${t._id.year} ${t._id.semester}`)
  );

  const bulkOps = allTerms
    .map((term) => {
      const parts = term.name.split(" ");
      if (parts.length !== 2) {
        log.warn(`Invalid term name format: ${term.name}`);
        return null;
      }

      const [yearStr, semester] = parts;
      const year = parseInt(yearStr, 10);
      if (isNaN(year)) {
        log.warn(`Invalid year in term name: ${term.name}`);
        return null;
      }

      const hasCatalogData = catalogDataSet.has(`${year} ${semester}`);

      return {
        updateOne: {
          filter: { _id: term._id },
          update: { $set: { hasCatalogData } },
        },
      };
    })
    .filter((op): op is NonNullable<typeof op> => op !== null);

  if (bulkOps.length > 0) {
    const result = await TermModel.bulkWrite(bulkOps);
    log.info(
      `Updated hasCatalogData flag for ${result.modifiedCount.toLocaleString()} / ${allTerms.length.toLocaleString()} terms.`
    );
    log.info(
      `Found ${catalogDataSet.size.toLocaleString()} terms with catalog data.`
    );
  }
};

const updateClasses = async (
  { log, sis: { CLASS_APP_ID, CLASS_APP_KEY } }: Config,
  termSelector: TermSelector
) => {
  log.trace(`Fetching terms....`);

  const allTerms = await termSelector(); // includes LAW, Graduate, etc. which are duplicates of Undergraduate
  const terms = allTerms.filter((term) => term.academicCareerCode === "UGRD");

  log.info(
    `Fetched ${terms.length.toLocaleString()} undergraduate terms: ${terms.map((term) => term.name).toLocaleString()}.`
  );
  if (terms.length == 0) {
    log.warn(`No terms found, skipping update.`);
    return;
  }

  let totalClasses = 0;
  let totalInserted = 0;
  for (let i = 0; i < terms.length; i += TERMS_PER_API_BATCH) {
    const termsBatch = terms.slice(i, i + TERMS_PER_API_BATCH);
    const termsBatchIds = termsBatch.map((term) => term.id);

    log.trace(
      `Fetching classes for term ${termsBatch.map((term) => term.name).toLocaleString()}...`
    );

    const classes = await getClasses(
      log,
      CLASS_APP_ID,
      CLASS_APP_KEY,
      termsBatchIds
    );

    log.info(`Fetched ${classes.length.toLocaleString()} classes.`);
    if (classes.length === 0) {
      log.error(`No classes found, skipping update.`);
      return;
    }
    totalClasses += classes.length;

    log.trace("Deleting classes to be replaced...");

    const { deletedCount } = await ClassModel.deleteMany({
      termId: { $in: termsBatchIds },
    });

    log.info(`Deleted ${deletedCount.toLocaleString()} classes.`);

    // Insert classes in batches of 5000
    const insertBatchSize = 5000;
    for (let i = 0; i < classes.length; i += insertBatchSize) {
      const batch = classes.slice(i, i + insertBatchSize);

      log.trace(`Inserting batch ${i / insertBatchSize + 1}...`);

      const { insertedCount } = await ClassModel.insertMany(batch, {
        ordered: false,
        rawResult: true,
      });
      totalInserted += insertedCount;
    }
  }

  log.info(
    `Completed updating database with ${totalClasses.toLocaleString()} classes, inserted ${totalInserted.toLocaleString()} documents.`
  );

  await updateTermsCatalogDataFlags(log);

  // Warm catalog cache for all terms with catalog data
  const distinctTermNames = await TermModel.distinct("name", {
    hasCatalogData: true,
  });
  const termsWithCatalogData = distinctTermNames.map((name) => ({ name }));

  // Process sequentially to avoid overwhelming the server
  await warmCatalogCacheForTerms(termsWithCatalogData, log);
};

const activeTerms = async (config: Config) => {
  return updateClasses(config, getActiveTerms);
};

const lastFiveYearsTerms = async (config: Config) => {
  return updateClasses(config, getLastFiveYearsTerms);
};

export default {
  activeTerms,
  lastFiveYearsTerms,
};
