import { describe, expect, it } from "vitest";

import { LETTER_GRADES, PASS_FAIL } from "@/lib/grades";

import { buildGradeChartData } from "./GradeBarGraph.utils";

describe("buildGradeChartData", () => {
  it("excludes P/NP from letter-grade percentages and percentiles", () => {
    const rows = buildGradeChartData(
      [
        [
          { letter: "A", count: 30 },
          { letter: "F", count: 10 },
          { letter: "P", count: 40 },
          { letter: "NP", count: 20 },
        ],
      ],
      ["course0"],
      [...LETTER_GRADES, ...PASS_FAIL]
    );

    const a = rows.find((row) => row.letter === "A");
    const f = rows.find((row) => row.letter === "F");
    const pass = rows.find((row) => row.letter === "P");
    const noPass = rows.find((row) => row.letter === "NP");

    expect(a).toMatchObject({
      course0: 75,
      course0_pctlLo: 25,
      course0_pctlHi: 100,
    });
    expect(f).toMatchObject({
      course0: 25,
      course0_pctlLo: 0,
      course0_pctlHi: 25,
    });
    expect(pass).toEqual({ letter: "P", course0: 40 });
    expect(noPass).toEqual({ letter: "NP", course0: 20 });
  });

  it("uses all records as the denominator for visible P/NP columns", () => {
    const rows = buildGradeChartData(
      [
        [
          { letter: "A", count: 20 },
          { letter: "P", count: 10 },
        ],
      ],
      ["course0"],
      ["P", "NP"]
    );

    expect(rows[0]).toMatchObject({ letter: "P" });
    expect(rows[0].course0).toBeCloseTo(100 / 3);
    expect(rows[1]).toEqual({ letter: "NP", course0: 0 });
  });
});
