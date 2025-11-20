import { ClassModel, TermModel } from "@repo/common";

import { warmCatalogCacheForTerms } from "../lib/cache-warming";
import { getClasses } from "../lib/classes";
import { Config } from "../shared/config";
import {
  type TermSelector,
  getActiveTerms,
  getLastFiveYearsTerms,
} from "../shared/term-selectors";
import { connection } from "mongoose";

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

const updateClasses = async (config: Config, termSelector: TermSelector) => {
  const {
    log,
    sis: { CLASS_APP_ID, CLASS_APP_KEY },
  } = config;

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
  let totalDeleted = 0;

  const termsBatchIds = terms.map((term) => term.id);
  log.trace(`Fetching classes for ${terms.length.toLocaleString()} terms...`);
  const classes = await getClasses(
    log,
    CLASS_APP_ID,
    CLASS_APP_KEY,
    termsBatchIds
  );

  log.info(`Fetched ${classes.length.toLocaleString()} classes.`);
  if (!classes || classes.length === 0) {
    log.error(`No classes found, skipping update.`);
    return;
  }
  totalClasses += classes.length;

  // Insert classes in batches of 5000
  for (let i = 0; i < termsBatchIds.length; i += 1) {
    const session = await connection.startSession();
    let currentTerm = termsBatchIds[i];
    try {
      await session.withTransaction(async () => {
        // const batch = classes.slice(i, i + CLASSES_PER_BATCH);
        const batch = classes.filter((x) => x.termId == currentTerm);

        log.trace(`Deleting classes in term ${currentTerm}...`);

        const { deletedCount } = await ClassModel.deleteMany({
          termId: currentTerm,
        });

        log.trace(`Inserting term ${currentTerm}...`);

        const { insertedCount } = await ClassModel.insertMany(batch, {
          ordered: false,
          rawResult: true,
        });

        // avoid replacing data if a non-negligible amount is deleted
        if (insertedCount / deletedCount <= 0.90) {
          throw new Error(`Deleted ${deletedCount} classes and inserted only ${insertedCount} in term ${currentTerm}; aborting data insertion process`);
        }

        totalDeleted += deletedCount;
        totalInserted += insertedCount;
      });
    } catch (error: any) {
      log.warn(`Error inserting batch: ${error.message}`);
    } finally {
      await session.endSession();
    }
  }

  log.info(`Deleted ${totalDeleted.toLocaleString()} classes`);
  log.info(
    `Inserted ${totalInserted.toLocaleString()} classes, after fetching ${totalClasses.toLocaleString()} classes.`
  );

  await updateTermsCatalogDataFlags(log);

  // Warm catalog cache for all terms with catalog data
  const distinctTermNames = await TermModel.distinct("name", {
    hasCatalogData: true,
  });
  const termsWithCatalogData = distinctTermNames.map((name) => ({ name }));

  // Process sequentially to avoid overwhelming the server
  await warmCatalogCacheForTerms(config, termsWithCatalogData);
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
