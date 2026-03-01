import type { ApolloServer } from "@apollo/server";
import { type Application, type Request, type Response } from "express";
import { RedisClientType } from "redis";

import { flushViewCounts } from "../class/controller";
import { warmCatalogCache } from "./controller";

const VALID_SEMESTERS = new Set(["fall", "spring", "summer", "winter"]);

export default (
  app: Application,
  server: ApolloServer,
  redis: RedisClientType
) => {
  /**
   * POST /cache/warm-catalog
   *
   * Warms catalog cache by executing GetCanonicalCatalog query through Apollo,
   * then atomically swapping staging → production keys.
   *
   * Request body:
   * {
   *   "year": 2025,
   *   "semester": "fall"  // case-insensitive
   * }
   *
   * Response:
   * {
   *   "success": true,
   *   "key": "apollo-cache:fqc:catalog:2025-fall"
   * }
   *
   * Process:
   * 1. Acquires per-term lock to avoid concurrent warm collisions
   * 2. Apollo executes GetCanonicalCatalog with run-scoped staging suffix
   * 3. RENAME staging → production (atomic, zero downtime)
   * 4. Users immediately see fresh data
   */
  app.post(
    "/cache/warm-catalog",
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { year, semester } = req.body;

        // Validate input
        if (
          typeof year !== "number" ||
          !Number.isInteger(year) ||
          typeof semester !== "string"
        ) {
          res.status(400).json({
            error: "year (integer) and semester (string) are required",
          });
          return;
        }
        const normalizedSemester = semester.toLowerCase();
        if (!VALID_SEMESTERS.has(normalizedSemester)) {
          res.status(400).json({
            error: "semester must be one of: fall, spring, summer, winter",
          });
          return;
        }

        // Warm cache
        const result = await warmCatalogCache(
          server,
          redis,
          year,
          normalizedSemester
        );

        res.status(200).json(result);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error("[Cache API] Error:", error);
        res.status(500).json({
          error: "Internal server error",
          message: error.message,
        });
      }
    }
  );

  app.post(
    "/cache/flush-view-counts",
    async (_req: Request, res: Response): Promise<void> => {
      try {
        const result = await flushViewCounts(redis);
        res.status(200).json(result);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error("[Cache API] Flush error:", error);
        res.status(500).json({
          error: "Internal server error",
          message: error.message,
        });
      }
    }
  );
};
