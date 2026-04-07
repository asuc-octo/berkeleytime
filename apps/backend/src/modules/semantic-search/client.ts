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
