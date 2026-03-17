import { UserModel } from "@repo/common/models";

import {
  ACTIVE_FORMULA,
  ACTIVE_FORMULA_NAME,
} from "./activity-score-formulas";

// The minimum activityScore for a user to be considered "active".
export const ACTIVITY_THRESHOLD = 0.5;

const UPDATE_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
const STARTUP_DELAY_MS = 2 * 60 * 1000; // 2 minutes

let isRunning = false;

export const updateActivityScores = async (): Promise<number> => {
  const users = await UserModel.find({}).select("lastSeenAt createdAt").lean();

  const bulkOps = users.map((user) => ({
    updateOne: {
      filter: { _id: user._id },
      update: {
        $set: {
          activityScore: ACTIVE_FORMULA({
            lastSeenAt: user.lastSeenAt ?? new Date(0),
            createdAt: user.createdAt ?? new Date(),
          }),
        },
      },
    },
  }));

  if (bulkOps.length > 0) {
    await UserModel.bulkWrite(bulkOps);
  }

  console.log(
    `[ActivityScore] Updated scores for ${bulkOps.length} users (formula: ${ACTIVE_FORMULA_NAME})`
  );

  return bulkOps.length;
};

export const startActivityScoreUpdateJob = (): void => {
  const run = async () => {
    if (isRunning) return;
    isRunning = true;
    try {
      await updateActivityScores();
    } catch (error) {
      console.error("[ActivityScore] Error updating activity scores:", error);
    } finally {
      isRunning = false;
    }
  };

  setInterval(run, UPDATE_INTERVAL_MS);
  setTimeout(run, STARTUP_DELAY_MS);
};
