import updateClasses from "./pullers/classes";
import updateCourses from "./pullers/courses";
import updateGradeDistributions from "./pullers/grade-distributions";
import main from "./pullers/main";
import updateSections from "./pullers/sections";
import setup from "./shared";
import { Config } from "./shared/config";

type cliArgs = {
  puller: string;
  [key: string]: string | boolean;
};

const scriptMap: { [key: string]: (config: Config) => Promise<void> } = {
  courses: updateCourses,
  sections: updateSections,
  classes: updateClasses,
  "grade-distributions": updateGradeDistributions,
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

const runScript = async () => {
  const args = parseArgs(process.argv.slice(2));

  if (!args.puller || !scriptMap[args.puller]) {
    throw new Error(
      "Please specify a valid script: " + Object.keys(scriptMap).join(", ")
    );
  }

  const { config } = await setup();
  const logger = config.log.getSubLogger({ name: "ScriptRunner" });
  try {
    logger.info(`Starting ${args.puller} script`);

    await scriptMap[args.puller](config);

    logger.info(`${args.puller} script completed successfully`);
    process.exit(0);
  } catch (error: any) {
    logger.error(`${args.puller} script failed: ${error.message}`);
    process.exit(1);
  }
};

runScript();
