/*
 * Run with `npx vitest bench src/lib/scheduler` from apps/frontend.
 * README.md ("Performance") explains the cases and the numbers.
 */
import { bench, describe } from "vitest";

import { adversarialClasses, preferences, realisticClasses } from "./fixtures";
import { GenerateOptions, generateSchedules } from "./index";

const policies: Record<string, GenerateOptions> = {
  "exact only": { softBudgetMs: 1e9, hardBudgetMs: 1e9, gap: 0 },
  default: {},
  "5% gap from the start": { softBudgetMs: 0, gap: 0.05 },
};

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

for (const [inputName, classes] of Object.entries(inputs))
  describe(`${inputName}, 8 results, mixed preferences`, () => {
    for (const [policyName, options] of Object.entries(policies))
      bench(policyName, () => {
        generateSchedules(classes, [], mixed, options);
      });
  });
