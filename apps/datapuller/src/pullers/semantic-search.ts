import { TermModel } from "@repo/common";

import { Config } from "../shared/config";

const refreshSemanticSearch = async (config: Config) => {
  const { log, SEMANTIC_SEARCH_URL } = config;

  log.trace("Refreshing semantic search indices...");

  // Find all active terms (terms that are currently open or will open soon)
  const now = new Date();
  const activeTerms = await TermModel.find({
    endDate: { $gte: now },
  })
    .sort({ startDate: 1 })
    .limit(3) // Refresh current and next 2 terms
    .lean();

  if (activeTerms.length === 0) {
    log.info("No active terms found to refresh.");
    return;
  }

  log.info(`Found ${activeTerms.length} active term(s) to refresh.`);

  for (const term of activeTerms) {
    try {
      const year = term.year;
      const semester = term.semester;

      log.trace(`Refreshing index for ${year} ${semester}...`);

      const response = await fetch(`${SEMANTIC_SEARCH_URL}/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          year,
          semester,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to refresh ${year} ${semester}: ${response.status} ${errorText}`
        );
      }

      const result = await response.json();
      log.info(`Refreshed ${year} ${semester}: ${result.size} courses indexed`);
    } catch (error: any) {
      log.error(
        `Error refreshing ${term.year} ${term.semester}: ${error.message}`
      );
      // Continue with other terms even if one fails
    }
  }

  log.trace("Semantic search refresh completed.");
};

export default {
  refreshSemanticSearch,
};
