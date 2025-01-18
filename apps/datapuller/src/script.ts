import { Config } from "./config";
import { updateClasses } from "./pullers/class";
import { updateCourses } from "./pullers/course";
import { updateSections } from "./pullers/section";
import { runDatapuller } from "./runDatapuller";
import setup from "./shared";

type cliArgs = {
  script: string;
  [key: string]: string;
};

const scriptMap: { [key: string]: (config: Config) => Promise<void> } = {
  courses: updateCourses,
  sections: updateSections,
  classes: updateClasses,
  datapuller: runDatapuller,
};

const parseArgs = (args: string[]): cliArgs => {
  const result: cliArgs = { script: "" };
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

  if (!args.script || !scriptMap[args.script]) {
    throw new Error(
      "Please specify a valid script: courses, sections, classes, or datapuller."
    );
  }

  const { config } = await setup();
  const logger = config.log.getSubLogger({ name: "ScriptRunner" });
  try {
    logger.info(`Starting ${args.script} script`);

    await scriptMap[args.script](config);

    logger.info(`${args.script} script completed successfully`);
    process.exit(0);
  } catch (error: any) {
    logger.error(`${args.script} script failed: ${error.message}`);
    process.exit(1);
  }
};

runScript();
