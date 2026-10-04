/*
 * Run with `npx vitest bench src/lib/scheduler` from apps/frontend.
 */
import { bench, describe } from "vitest";

import { adversarialClasses, preferences, realisticClasses } from "./fixtures";
import { generateSchedules } from "./index";

const inputs = {
  realistic: realisticClasses(),
  "worst case": adversarialClasses(),
};

const mixed = preferences({
  fewerGaps: true,
  fewerDays: true,
  earliestStart: 10 * 60,
  latestEnd: 17 * 60,
  avoidDays: [false, false, false, false, true, false, false],
});

describe("8 results, mixed preferences", () => {
  for (const [name, classes] of Object.entries(inputs))
    bench(name, () => {
      // A budget this large is never reached, so this times the full search.
      generateSchedules(classes, [], mixed, { budgetMs: 1e9 });
    });
});
