/*
 * Run with `npx vitest bench src/lib/scheduler` from apps/frontend.
 * README.md ("Performance") explains the cases and the numbers.
 */
import { bench, describe } from "vitest";

import {
  adversarialClasses,
  preferences,
  realLikeClasses,
  realisticClasses,
} from "./fixtures";
import { generateSchedules } from "./index";

const inputs = {
  "realistic: 4 large classes": realisticClasses(),
  "real-like: few sections share a time": realLikeClasses(),
  "worst case: 1.7 x 10^14 raw combinations": adversarialClasses(),
};

const cases = {
  "fewest gaps, no rules": preferences(),
  "latest start, no classes before 9 or after 6": preferences({
    sortBy: "latest-start",
    earliestStart: 9 * 60,
    latestEnd: 18 * 60,
  }),
};

for (const [name, classes] of Object.entries(inputs))
  describe(name, () => {
    for (const [label, rules] of Object.entries(cases))
      bench(label, () => {
        // A budget this large is never reached, so this times the full search.
        generateSchedules(classes, [], rules, { budgetMs: 1e9 });
      });
  });
