import { performance } from "node:perf_hooks";
import { parseArgs } from "node:util";
import { Logger } from "tslog";

import { updateCatalogGradeSummaries } from "./lib/catalog-denormalize";
import classesPuller from "./pullers/classes";
import coursesPuller from "./pullers/courses";
import decalsPuller from "./pullers/decals";
import enrollmentHistoriesPuller from "./pullers/enrollment";
import enrollmentTimeframePuller from "./pullers/enrollment-timeframe";
import gradeDistributionsPuller from "./pullers/grade-distributions";
import migrationsPuller from "./pullers/migrations";
import sectionsPuller from "./pullers/sections";
import termsPuller from "./pullers/terms";
import setup from "./shared";
import { Config } from "./shared/config";

const cliArgs = {
  puller: {
    type: "string" as const,
  },
} as const;

const pullerMap: {
  [key: string]: (config: Config) => Promise<unknown>;
} = {
  courses: coursesPuller.updateCourses,
  decals: decalsPuller.scrapeDeCals,
  "sections-active": sectionsPuller.activeTerms,
  "sections-last-five-years": sectionsPuller.lastFiveYearsTerms,
  "classes-active": classesPuller.activeTerms,
  "classes-last-five-years": classesPuller.lastFiveYearsTerms,
  "grades-recent": gradeDistributionsPuller.recentPastTerms,
  "grades-last-five-years": gradeDistributionsPuller.lastFiveYearsTerms,
  enrollments: enrollmentHistoriesPuller.updateEnrollmentHistories,
  "enrollment-timeframe": enrollmentTimeframePuller.syncEnrollmentTimeframe,
  "terms-all": termsPuller.allTerms,
  "terms-nearby": termsPuller.nearbyTerms,
  "migrate-aggregated-metrics-classid":
    migrationsPuller.backfillAggregatedMetricsClassId,
  "catalog-sync-grades": async (config: Config) =>
    updateCatalogGradeSummaries(config.log),
} as const;

const runPuller = async () => {
  const logger = new Logger<unknown>({ type: "json", name: "PullerRunner" });
  const startedAt = performance.now();
  let puller = "unknown";
  let stage = "arguments";

  try {
    const { values: args } = parseArgs({ options: cliArgs });
    puller = args.puller ?? "unknown";
    if (!args.puller || !pullerMap[args.puller]) {
      throw new Error(
        "Please specify a valid puller argument: " +
          Object.keys(pullerMap).join(", ")
      );
    }
    logger.info({ event: "run.started", puller });
    stage = "setup";
    const { config } = await setup(logger);

    stage = "execution";
    await pullerMap[args.puller](config);
    logger.info({
      event: "run.completed",
      puller,
      duration_ms: performance.now() - startedAt,
      message: "Puller execution finished.",
    });
    process.exit(0);
  } catch (error: unknown) {
    logger.error({
      event: "run.failed",
      puller,
      stage,
      duration_ms: performance.now() - startedAt,
      message: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }
};

runPuller();
