/*
 * Run with `npx vitest bench src/lib/scheduler` from apps/frontend.
 * README.md ("Performance") explains the cases and the numbers.
 */
import { bench, describe } from "vitest";

import { adversarialClasses, preferences, realisticClasses } from "./fixtures";
import { generateSchedules } from "./index";

const inputs = {
  "realistic: 4 large classes": realisticClasses(),
  "worst case: 1.7 x 10^14 raw combinations": adversarialClasses(),
};

const rules = preferences({ earliestStart: 9 * 60, latestEnd: 18 * 60 });

for (const [name, classes] of Object.entries(inputs))
  describe(name, () => {
    bench("no rules, fewest gaps", () => {
      generateSchedules(classes, [], preferences());
    });
    bench("no classes before 9 or after 6", () => {
      generateSchedules(classes, [], rules);
    });
  });
