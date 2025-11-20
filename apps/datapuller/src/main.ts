import { parseArgs } from "node:util";

import classesPuller from "./pullers/classes";
import coursesPuller from "./pullers/courses";
import enrollmentHistoriesPuller from "./pullers/enrollment";
import enrollmentCalendarPuller from "./pullers/enrollment-calendar";
import gradeDistributionsPuller from "./pullers/grade-distributions";
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
  [key: string]: (config: Config, ...arg: any) => Promise<unknown>;
} = {
  courses: coursesPuller.updateCourses,
  "sections-active": sectionsPuller.activeTerms,
  "sections-last-five-years": sectionsPuller.lastFiveYearsTerms,
  "classes-active": classesPuller.activeTerms,
  "classes-last-five-years": classesPuller.lastFiveYearsTerms,
  "grades-recent": gradeDistributionsPuller.recentPastTerms,
  "grades-last-five-years": gradeDistributionsPuller.lastFiveYearsTerms,
  enrollments: enrollmentHistoriesPuller.updateEnrollmentHistories,
  "enrollment-calendar": enrollmentCalendarPuller.syncEnrollmentCalendar,
  "terms-all": termsPuller.allTerms,
  "terms-nearby": termsPuller.nearbyTerms,
} as const;

const runPuller = async () => {
  const { values: args } = parseArgs({ options: cliArgs });

  if (!args.puller || !pullerMap[args.puller]) {
    throw new Error(
      "Please specify a valid puller argument: " +
        Object.keys(pullerMap).join(", ")
    );
  }

  const { config } = await setup();
  const logger = config.log.getSubLogger({ name: "PullerRunner" });
  try {
    logger.info(
      `Starting ${args.puller} puller with args: ${JSON.stringify(args)}`
    );

    await pullerMap[args.puller](config);

    logger.trace(`${args.puller} puller completed successfully`);
    process.exit(0);
  } catch (error: any) {
    logger.error(`${args.puller} puller failed: ${error.message}`);
    process.exit(1);
  }
};

runPuller();
