import { ClassModel, TermModel } from "@repo/common";

import { getClasses } from "../lib/classes";
import { Config } from "../shared/config";
import {
  type TermSelector,
  getActiveTerms,
  getLastFiveYearsTerms,
} from "../shared/term-selectors";

const TERMS_PER_API_BATCH = 4;

const checkTermHasCatalogData = async (
  year: number,
  semester: string,
  academicCareerCode: string
): Promise<boolean> => {
  const termExists = await TermModel.exists({
    name: `${year} ${semester}`,
    academicCareerCode,
  });

  if (!termExists) return false;

  const classExists = await ClassModel.exists({
    year,
    semester,
  });

  return !!classExists;
};

// Note: We scan ALL terms in the database rather than just the affected ones.
// This is intentional to ensure data consistency, as class data may be modified
// by sources other than the datapuller. Since the query is fast, the overhead
// is minimal. Future optimization could track only affected terms if needed.
const updateTermsCatalogDataFlags = async (log: any) => {
  log.trace("Updating hasCatalogData flags for all terms...");

  const allTerms = await TermModel.find({})
    .select({ name: 1, academicCareerCode: 1 })
    .lean();

  const BATCH_SIZE = 50;
  const bulkOps = [];

  for (let i = 0; i < allTerms.length; i += BATCH_SIZE) {
    const batch = allTerms.slice(i, i + BATCH_SIZE);
    const batchOps = await Promise.all(
      batch.map(async (term) => {
        const [year, semester] = term.name.split(" ");
        const hasCatalogData = await checkTermHasCatalogData(
          parseInt(year),
          semester,
          term.academicCareerCode
        );

        return {
          updateOne: {
            filter: {
              name: term.name,
              academicCareerCode: term.academicCareerCode,
            },
            update: { $set: { hasCatalogData } },
          },
        };
      })
    );
    bulkOps.push(...batchOps);
  }

  if (bulkOps.length > 0) {
    const result = await TermModel.bulkWrite(bulkOps);
    log.info(
      `Updated hasCatalogData flag for ${result.modifiedCount.toLocaleString()} / ${allTerms.length.toLocaleString()} terms.`
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
