import { connection } from "mongoose";

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

  // Insert classes in batches of 4 terms
  for (let i = 0; i < terms.length; i += TERMS_PER_API_BATCH) {
    const termsBatch = terms.slice(i, i + TERMS_PER_API_BATCH);
    const termsBatchIds = termsBatch.map((term) => term.id);
    const session = await connection.startSession();
    try {
      await session.withTransaction(async () => {
        log.trace(
          `Fetching classes for terms ${termsBatch.map((term) => term.name).toLocaleString()}...`
        );
        const classes = await getClasses(
          log,
          CLASS_APP_ID,
          CLASS_APP_KEY,
          termsBatchIds
        );

        if (classes.length === 0) {
          throw new Error(`No classes found, skipping update.`);
        }

        log.trace(`Deleting classes in batch ${i}...`);

        const { deletedCount } = await ClassModel.deleteMany({
          termId: { $in: termsBatchIds },
        });

        log.trace(`Inserting batch ${i}`);

        const { insertedCount } = await ClassModel.insertMany(classes, {
          ordered: false,
          rawResult: true,
        });

        // avoid replacing data if a non-negligible amount is deleted
        if (insertedCount / deletedCount <= 0.9) {
          throw new Error(
            `Deleted ${deletedCount} classes and inserted only ${insertedCount} in batch ${i}; aborting data insertion process`
          );
        }

        totalClasses += classes.length;
        totalDeleted += deletedCount;
        totalInserted += insertedCount;
      });
    } catch (error: any) {
      log.error(`Error inserting batch: ${error.message}`);
    } finally {
      await session.endSession();
    }
  }

  log.info(`Deleted ${totalDeleted.toLocaleString()} total classes`);
  log.info(
    `Inserted ${totalInserted.toLocaleString()} classes, after fetching ${totalClasses.toLocaleString()} classes.`
  );

  await updateTermsCatalogDataFlags(log);

  // Warm catalog cache for all terms with catalog data
  const distinctTermNames = await TermModel.distinct("name", {
    hasCatalogData: true,
  });
  const termsWithCatalogData = distinctTermNames.map((name) => ({ name }));

  // Sort by year descending (latest first)
  termsWithCatalogData.sort((a, b) => {
    const yearA = parseInt(a.name.split(" ")[0], 10);
    const yearB = parseInt(b.name.split(" ")[0], 10);
    return yearB - yearA;
  });

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
