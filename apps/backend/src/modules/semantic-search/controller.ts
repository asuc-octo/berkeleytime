import { Request, Response } from "express";

import { searchSemantic } from "./client";

/**
 * Lightweight semantic search endpoint that only returns course identifiers
 * Frontend will use these to filter the already-loaded catalog
 */
export async function searchCourses(req: Request, res: Response) {
  const { query, year, semester, threshold } = req.query;

  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "query parameter is required" });
  }

  const yearNum = year ? parseInt(year as string, 10) : undefined;
  const semesterStr = semester as string | undefined;
  const thresholdNum = threshold ? parseFloat(threshold as string) : 0.3;

  try {
    const results = await searchSemantic(
      query,
      yearNum!,
      semesterStr!,
      undefined,
      thresholdNum
    );

    // Return lightweight response: only subject + courseNumber + score
    const courseIds = results.results.map((r) => ({
      subject: r.subject,
      courseNumber: r.courseNumber,
      score: r.score,
    }));

    return res.json({
      query,
      threshold: thresholdNum,
      results: courseIds,
      count: courseIds.length,
    });
  } catch (error) {
    console.error("Semantic search error:", error);
    return res.status(500).json({
      error: "Semantic search failed",
      results: [],
      count: 0,
    });
  }
}
