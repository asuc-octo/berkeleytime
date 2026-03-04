import { UserModel } from "@repo/common/models";

// The minimum activityScore for a user to be considered "active".
export const ACTIVITY_THRESHOLD = 0.5;

const UPDATE_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
const STARTUP_DELAY_MS = 2 * 60 * 1000; // 2 minutes

let isRunning = false;

/**
 * Computes an activity score in the range [0, 1] for a single user.
 *
 * TODO: Replace this placeholder with the real scoring formula once determined.
 * Inputs available on each user document:
 *   - lastSeenAt: Date  — when the user last visited
 *   - createdAt:  Date  — when the account was created
 *
 * Additional signals (e.g. number of schedules, ratings, collections) can be
 * fetched inside this function or pre-aggregated before the bulk update loop.
 */
const computeActivityScore = (_user: {
  lastSeenAt: Date;
  createdAt: Date;
}): number => {
  console.log(_user);
  return 0; // placeholder
};

const updateActivityScores = async (): Promise<void> => {
  const users = await UserModel.find({}).select("lastSeenAt createdAt").lean();

  const bulkOps = users.map((user) => ({
    updateOne: {
      filter: { _id: user._id },
      update: {
        $set: {
          activityScore: computeActivityScore({
            lastSeenAt: user.lastSeenAt,
            createdAt: user.createdAt ?? new Date(),
          }),
        },
      },
    },
  }));

  if (bulkOps.length > 0) {
    await UserModel.bulkWrite(bulkOps);
  }

  console.log(`[ActivityScore] Updated scores for ${bulkOps.length} users`);
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
