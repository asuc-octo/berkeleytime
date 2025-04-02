import { parseArgs } from "node:util";

import classesPuller from "./pullers/classes";
import coursesPuller from "./pullers/courses";
import { updateDecals } from "./pullers/decals";
import enrollmentHistoriesPuller from "./pullers/enrollment";
import gradeDistributionsPuller from "./pullers/grade-distributions";
import sectionsPuller from "./pullers/sections";
import termsPuller from "./pullers/terms";
import setup from "./shared";
import { Config } from "./shared/config";

const pullerMap: {
  [key: string]: (config: Config, ...arg: unknown[]) => Promise<unknown>;
} = {
  courses: coursesPuller.updateCourses,
  "sections-active": sectionsPuller.activeTerms,
  "sections-last-five-years": sectionsPuller.lastFiveYearsTerms,
  "classes-active": classesPuller.activeTerms,
  "classes-last-five-years": classesPuller.lastFiveYearsTerms,
  "grades-recent": gradeDistributionsPuller.recentPastTerms,
  "grades-last-five-years": gradeDistributionsPuller.lastFiveYearsTerms,
  enrollments: enrollmentHistoriesPuller.updateEnrollmentHistories,
  "terms-all": termsPuller.allTerms,
  "terms-nearby": termsPuller.nearbyTerms,
  decals: updateDecals,
} as const;

const main = async () => {
  const { values: args } = parseArgs({
    options: {
      puller: { type: "string" },
    },
  });

  if (!args.puller || !pullerMap[args.puller]) {
    throw new Error(
      "Please specify a valid puller: " + Object.keys(pullerMap).join(", ")
    );
  }

  const { config } = await setup();

  const logger = config.log.getSubLogger({ name: "Puller" });

  logger.info(
    `Starting ${args.puller} puller with args: ${JSON.stringify(args)}`
  );

  try {
    await pullerMap[args.puller](config);

    logger.trace(`${args.puller} puller completed successfully`);

    process.exit(0);
  } catch (error) {
    logger.error(`${args.puller} puller failed: ${error}`);

    process.exit(1);
  }
};

main();
