import { config } from "../../../../../packages/common/src/utils/config";

interface SemanticSearchResult {
  subject: string;
  courseNumber: string;
}

interface SemanticSearchResponse {
  query: string;
  threshold: number;
  count: number;
  year: number;
  semester: string;
  allowed_subjects: string[] | null;
  last_refreshed: string;
  results: SemanticSearchResult[];
}

export interface RecommendResult {
  subject: string;
  courseNumber: string;
  score: number;
}

interface RecommendResponse {
  count: number;
  year: number;
  semester: string;
  results: RecommendResult[];
}

export async function searchSemantic(
  query: string,
  year: number,
  semester: string,
  allowedSubjects?: string[],
  threshold: number = 0.3
): Promise<SemanticSearchResponse> {
  const url = `${config.semanticSearch.url}/search`;
  const body = {
    query,
    threshold,
    year,
    semester,
    allowed_subjects: allowedSubjects ?? null,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let detail: string | undefined;
    try {
      const body = (await response.json()) as {
        detail?: string;
        error?: string;
      };
      detail = body?.detail ?? body?.error;
    } catch {
      /* ignore parse errors */
    }
    throw new Error(
      detail ?? `Semantic search service error: ${response.statusText}`
    );
  }

  return (await response.json()) as SemanticSearchResponse;
}

async function postRecommend(
  path: string,
  body: Record<string, unknown>
): Promise<RecommendResponse> {
  const url = `${config.semanticSearch.url}/recommend${path}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let detail: string | undefined;
    try {
      const err = (await response.json()) as {
        detail?: string;
        error?: string;
      };
      detail = err?.detail ?? err?.error;
    } catch {
      /* ignore parse errors */
    }
    throw new Error(
      detail ?? `Recommend service error: ${response.statusText}`
    );
  }

  return (await response.json()) as RecommendResponse;
}

export async function recommendBecauseViewed(
  subject: string,
  courseNumber: string,
  year: number,
  semester: string,
  limit: number
): Promise<RecommendResult[]> {
  const data = await postRecommend("/because-viewed", {
    subject,
    course_number: courseNumber,
    year,
    semester,
    limit,
  });
  return data.results;
}

export async function recommendTopPicks(
  history: Array<{ subject: string; courseNumber: string }>,
  year: number,
  semester: string,
  limit: number
): Promise<RecommendResult[]> {
  const data = await postRecommend("/top-picks", {
    history: history.map((h) => ({
      subject: h.subject,
      course_number: h.courseNumber,
    })),
    year,
    semester,
    limit,
  });
  return data.results;
}
