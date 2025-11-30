import { type Response, Router } from "express";
import type { ParsedQs } from "qs";
import { RequestInit, fetch } from "undici";

import { config } from "../../config";
import { searchCourses } from "./controller";

const router = Router();
const baseUrl = config.semanticSearch.url.replace(/\/$/, "");

type QueryValue = string | ParsedQs | Array<string | ParsedQs> | undefined;

const asString = (value: QueryValue): string | undefined => {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    for (const entry of value) {
      const found = asString(entry as QueryValue);
      if (found) return found;
    }
  }
  return undefined;
};

const toStringList = (value: QueryValue): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    const items: string[] = [];
    for (const entry of value) {
      items.push(...toStringList(entry as QueryValue));
    }
    return items;
  }
  return typeof value === "string" && value.length > 0 ? [value] : [];
};

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
router.get("/search", async (req, res) => {
  const query = asString(req.query.query);
  if (!query || !query.trim()) {
    res.status(400).json({ error: "query parameter is required" });
    return;
  }

  const params = new URLSearchParams({ query });

  const topK = asString(req.query.top_k);
  if (topK) params.set("top_k", topK);

  const year = asString(req.query.year);
  if (year) params.set("year", year);

  const semester = asString(req.query.semester);
  if (semester) params.set("semester", semester);

  const allowedSubjects = toStringList(req.query.allowed_subjects);
  allowedSubjects.forEach((subject) =>
    params.append("allowed_subjects", subject)
  );

  await forward(
    `${baseUrl}/search?${params.toString()}`,
    { method: "GET" },
    res
  );
});

export default router;
