import { Logger } from "tslog";

import { updateClasses } from "./class";
import { cleanupLogs } from "./cleanupLogs";
import { Config } from "./config";
import { updateCourses } from "./course";
import { runDatapuller } from "./runDatapuller";
import { updateSections } from "./section";
import setup from "./shared";

const scriptMap: { [key: string]: (config: Config) => Promise<void> } = {
  courses: updateCourses,
  sections: updateSections,
  classes: updateClasses,
  logs: cleanupLogs,
  datapuller: runDatapuller,
};

const parseArgs = (
  args: string[]
): { script: string; [key: string]: string } => {
  const result: { script: string; [key: string]: string } = { script: "" };
  args.forEach((arg) => {
    const [key, value] = arg.split("=");
    if (key.startsWith("--")) {
      result[key.slice(2)] = value || "true";
    }
  });
  return result;
};

const args = parseArgs(process.argv.slice(2));

if (!args.script || !scriptMap[args.script]) {
  console.error(
    "Please specify a valid script: courses, sections, classes, logs, or datapuller"
  );
  process.exit(1);
}

const runScript = async () => {
  const { config } = await setup();
  const logger = new Logger({ name: "ScriptRunner" });
  try {
    logger.info(`Starting ${args.script} script`);

    await scriptMap[args.script](config);

    logger.info(`${args.script} script completed successfully`);
  } catch (error: any) {
    logger.error(`${args.script} script failed: ${error.message}`);
    process.exit(1);
  }
};

runScript();
