import fs from "fs/promises";
import path from "path";
import { Logger } from "tslog";

export async function cleanupLogs() {
  const logger = new Logger({ name: "LogCleanup" });
  const logDir = path.join(__dirname, "logs"); // Adjust the path if necessary
  const retentionDays = 7; // Number of days to retain logs

  try {
    logger.info(
      `Starting log cleanup. Retaining logs from the last ${retentionDays} days.`
    );

    // Get the current time and calculate the cutoff time
    const now = Date.now();
    const cutoffTime = now - retentionDays * 24 * 60 * 60 * 1000;

    // Read the contents of the log directory
    const files = await fs.readdir(logDir);

    for (const file of files) {
      // Only process log files that match the naming pattern
      if (file.startsWith("error_") && file.endsWith(".log")) {
        const filePath = path.join(logDir, file);
        const stats = await fs.stat(filePath);

        // Check if the file is older than the retention period
        if (stats.mtime.getTime() < cutoffTime) {
          await fs.unlink(filePath);
          logger.info(`Deleted old log file: ${file}`);
        }
      }
    }

    logger.info("Log cleanup completed successfully.");
  } catch (error: any) {
    logger.error(`Log cleanup failed: ${error.message}`);
    process.exit(1);
  }
}
