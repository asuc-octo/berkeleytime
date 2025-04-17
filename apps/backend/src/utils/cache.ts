const DATAPULLER_HOUR = 5; // 5AM

/**
 * Returns the time in seconds until the next datapuller run (5AM).
 */
export const timeToNextPull = () => {
  const nowPT = new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
    })
  );

  const nextPullPT = new Date(nowPT);
  if (nowPT.getHours() >= DATAPULLER_HOUR) {
    nextPullPT.setDate(nextPullPT.getDate() + 1);
  }
  nextPullPT.setHours(DATAPULLER_HOUR, 0, 0, 0);

  return Math.floor((nextPullPT.getTime() - nowPT.getTime()) / 1000);
};
