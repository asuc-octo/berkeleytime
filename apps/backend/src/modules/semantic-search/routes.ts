import { type Response, Router } from "express";

import { config } from "../../../../../packages/common/src/utils/config";
import { searchCourses } from "./controller";

const router = Router();
const baseUrl = config.semanticSearch.url.replace(/\/$/, "");

async function forward(
  target: string,
  init: RequestInit,
  res: Response
): Promise<void> {
  try {
    const response = await fetch(target, init);
    const contentType = response.headers.get("content-type") ?? "";
    const raw = await response.text();

    if (contentType.includes("application/json")) {
      const payload = raw ? JSON.parse(raw) : {};
      res.status(response.status).json(payload);
    } else {
      res.status(response.status).send(raw);
    }
  } catch (error) {
    console.error("Semantic search proxy error:", error);
    res.status(502).json({
      error: "Unable to reach semantic search service",
      details: String(error),
    });
  }
}

router.get("/health", async (_req, res) => {
  await forward(`${baseUrl}/health`, { method: "GET" }, res);
});

router.post("/refresh", async (req, res) => {
  const body = req.body ?? {};
  await forward(
    `${baseUrl}/refresh`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    },
    res
  );
});

// Lightweight endpoint: returns only course identifiers for frontend filtering
router.get("/courses", searchCourses);

// Full proxy endpoint (kept for backwards compatibility)
router.post("/search", async (req, res) => {
  const body = req.body ?? {};
  if (!body.query || !String(body.query).trim()) {
    res.status(400).json({ error: "query is required" });
    return;
  }

  await forward(
    `${baseUrl}/search`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    },
    res
  );
});

export default router;
