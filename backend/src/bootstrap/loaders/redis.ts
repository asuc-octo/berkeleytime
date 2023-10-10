import { load, redis } from "../../redis";

// Close the Mongoose default connection is the event of application termination
process.on("SIGINT", async () => {
  if(redis != null) await redis.quit();
  process.exit(0);
});

// Redis connection
export default async () => {
    load();
}
