import mongoose from "mongoose";

import { Config } from "../config";

// Close the Mongoose default connection is the event of application termination
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});

// Your Mongoose setup goes here
export default async (config: Config): Promise<mongoose.Mongoose> => {
  // Connect to MongoDB
  config.log.info("Connecting to MongoDB...");
  config.log.info("MongoDB URI:", config.mongoDB.uri);
  const connection = mongoose.connect(config.mongoDB.uri);

  // Log when the connection is established
  mongoose.connection.on("connected", () => {
    config.log.info("MongoDB connection established successfully");
  });

  // Log any errors during the connection
  mongoose.connection.on("error", (err) => {
    config.log.error("MongoDB connection error:", err);
  });

  // Log when the connection is disconnected
  mongoose.connection.on("disconnected", () => {
    config.log.info("MongoDB connection disconnected");
  });

  return connection;
};
