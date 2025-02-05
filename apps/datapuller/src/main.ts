import { parseArgs } from "node:util";
import setup from "./shared";
import { Config } from "./shared/config";
import { type TermSelector, getRecentPastTerms, getActiveTerms, getLastFiveYearsTerms } from "./shared/term-selectors";
import updateCourses from "./pullers/courses";
import updateSections from "./pullers/sections";
import updateClasses from "./pullers/classes";
import updateEnrollmentHistories from "./pullers/enrollment";
import updateGradeDistributions from "./pullers/grade-distributions";
import updateTerms from "./pullers/terms";

const cliArgs = {
  puller: {
    type: "string" as const
  },
  terms: {
    type: "string" as const
  },
  "all-terms": {
    type: "boolean" as const
  },
} as const;

const pullersThatRequireTerms = ["classes", "sections", "grades"];

const pullerMap: { [key: string]: (config: Config, ...arg: any) => Promise<unknown> } = {
  courses: updateCourses,
  sections: updateSections,
  classes: updateClasses,
  grades: updateGradeDistributions,
  enrollments: updateEnrollmentHistories,
  terms: updateTerms,
} as const;

const termsSelectorsMap: { [key: string]: TermSelector } = {
  previous: getRecentPastTerms,
  active: getActiveTerms,
  "last-five-years": getLastFiveYearsTerms,
} as const;

const runPuller = async () => {
  const { values: args } = parseArgs({ options: cliArgs });

  if (!args.puller || !pullerMap[args.puller]) {
    throw new Error(
      "Please specify a valid puller argument: " + Object.keys(pullerMap).join(", ")
    );
  }

  const requiresTermsArg = pullersThatRequireTerms.find((puller) => puller === args.puller) !== undefined;
  if (requiresTermsArg && (!args.terms || !termsSelectorsMap[args.terms])) {
    // terms is a required argument for all pullers except terms
    throw new Error(
      "Please specify a valid terms argument: " + Object.keys(termsSelectorsMap).join(", ")
    )
  }

  const { config } = await setup();
  const logger = config.log.getSubLogger({ name: "PullerRunner" });
  try {
    logger.info(`Starting ${args.puller} puller with args: ${JSON.stringify(args)}`);

    if (args.puller === "terms") {
      await pullerMap[args.puller](config, args["all-terms"]!);
    } else if (requiresTermsArg) {
      await pullerMap[args.puller](config, termsSelectorsMap[args.terms!]);
    } else {
      await pullerMap[args.puller](config);
    }

    logger.trace(`${args.puller} puller completed successfully`);
    process.exit(0);
  } catch (error: any) {
    logger.error(`${args.puller} puller failed: ${error.message}`);
    process.exit(1);
  }
};

runPuller();
