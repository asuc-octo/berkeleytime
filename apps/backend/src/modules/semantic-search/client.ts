import { config } from "../../../../../packages/common/src/utils/config";

interface SemanticSearchResult {
  subject: string;
  courseNumber: string;
  title: string;
  description: string;
  score: number;
  text: string;
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

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Semantic search failed: ${response.statusText}`);
    }

    return (await response.json()) as SemanticSearchResponse;
  } catch (error) {
    console.error("Semantic search error:", error);
    // Return empty results on error, gracefully falling back
    return {
      query,
      threshold,
      count: 0,
      year,
      semester,
      allowed_subjects: allowedSubjects || null,
      last_refreshed: new Date().toISOString(),
      results: [],
    };
  }
}
