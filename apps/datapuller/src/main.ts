import updateClasses from "./pullers/classes";
import updateCourses from "./pullers/courses";
import updateEnrollmentHistories from "./pullers/enrollment";
import updateGradeDistributions from "./pullers/grade-distributions";
import main from "./pullers/main";
import updateSections from "./pullers/sections";
import setup from "./shared";
import { Config } from "./shared/config";

type cliArgs = {
  puller: string;
  [key: string]: string | boolean;
};

const pullerMap: { [key: string]: (config: Config) => Promise<void> } = {
  courses: updateCourses,
  sections: updateSections,
  classes: updateClasses,
  "grade-distributions": updateGradeDistributions,
  enrollments: updateEnrollmentHistories,
  main: main,
};

const parseArgs = (args: string[]): cliArgs => {
  const result: cliArgs = { puller: "" };
  args.forEach((arg) => {
    const [key, value] = arg.split("=");
    if (key.startsWith("--")) {
      result[key.slice(2)] = value || "true";
    }
  });
  return result;
};

const runPuller = async () => {
  const args = parseArgs(process.argv.slice(2));

  if (!args.puller || !pullerMap[args.puller]) {
    throw new Error(
      "Please specify a valid puller: " + Object.keys(pullerMap).join(", ")
    );
  }

  const { config } = await setup();
  const logger = config.log.getSubLogger({ name: "PullerRunner" });
  try {
    logger.info(`Starting ${args.puller} puller`);

    await pullerMap[args.puller](config);

    logger.info(`${args.puller} puller completed successfully`);
    process.exit(0);
  } catch (error: any) {
    logger.error(`${args.puller} puller failed: ${error.message}`);
    process.exit(1);
  }
};

runPuller();
