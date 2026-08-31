import { describe, expect, it } from "vitest";

import {
  type ExploreCourseSnapshot,
  RECOMMEND_CAREER_MISMATCH_PENALTY_FRACTION,
  RECOMMEND_CROSS_RAIL_PENALTY_FRACTION,
  RECOMMEND_FULL_SEAT_PENALTY_FRACTION,
  type Rng,
  SeatScore,
  capLimit,
  inferUserCareer,
  perturbRecommendResults,
  rankByAdjustedScore,
  recommendPoolSize,
  scoreRange,
  shuffle,
  uniqueCourseIds,
  withoutAdministrative,
} from "./ranking";

function seededRng(values: number[]): Rng {
  let i = 0;
  return () => values[Math.min(i++, values.length - 1)]!;
}

function snapshot(
  courseId: string,
  overrides: Partial<ExploreCourseSnapshot> = {}
): ExploreCourseSnapshot {
  return {
    courseId,
    subject: "COMPSCI",
    number: "61A",
    classNumber: "001",
    sessionId: "1",
    title: "Test Course",
    totalRatingCount: 10,
    gradeAverage: 3.5,
    seatScore: SeatScore.Open,
    academicCareer: "UGRD",
    ...overrides,
  };
}

function ids(snapshots: ExploreCourseSnapshot[]): string[] {
  return snapshots.map((s) => s.courseId);
}

describe("capLimit", () => {
  it("defaults to 20 when the client sends nothing", () => {
    expect(capLimit(null)).toBe(20);
    expect(capLimit(undefined)).toBe(20);
    expect(capLimit(NaN)).toBe(20);
  });

  it("clamps to at least 1", () => {
    expect(capLimit(0)).toBe(1);
    expect(capLimit(-5)).toBe(1);
  });

  it("clamps to the rail cap", () => {
    expect(capLimit(999)).toBe(48);
    expect(capLimit(48)).toBe(48);
  });

  it("floors fractional limits", () => {
    expect(capLimit(20.7)).toBe(20);
  });
});

describe("recommendPoolSize", () => {
  it("over-fetches by the pool factor", () => {
    expect(recommendPoolSize(10)).toBe(30);
  });

  it("stops at the pool cap", () => {
    expect(recommendPoolSize(20)).toBe(48);
    expect(recommendPoolSize(48)).toBe(48);
  });
});

describe("uniqueCourseIds", () => {
  it("keeps the first occurrence of a cross-listed course", () => {
    expect(uniqueCourseIds(["157712", "125364", "157712", "999"])).toEqual([
      "157712",
      "125364",
      "999",
    ]);
  });

  it("returns an empty list unchanged", () => {
    expect(uniqueCourseIds([])).toEqual([]);
  });
});

describe("scoreRange", () => {
  it("returns the span of the pool", () => {
    const results = [
      { subject: "COMPSCI", courseNumber: "61A", score: 0.92 },
      { subject: "COMPSCI", courseNumber: "61B", score: 0.9 },
      { subject: "COMPSCI", courseNumber: "70", score: 0.86 },
    ];

    expect(scoreRange(results)).toBeCloseTo(0.06, 10);
  });

  it("returns 0 for pools too small to have a span", () => {
    expect(scoreRange([])).toBe(0);
    expect(
      scoreRange([{ subject: "COMPSCI", courseNumber: "61A", score: 0.92 }])
    ).toBe(0);
  });
});

describe("perturbRecommendResults", () => {
  const results = [
    { subject: "COMPSCI", courseNumber: "61A", score: 0.9 },
    { subject: "COMPSCI", courseNumber: "61B", score: 0.8 },
  ];

  it("returns the input when there is nothing to jitter", () => {
    expect(perturbRecommendResults(results, 0, 0.4)).toBe(results);
    expect(perturbRecommendResults(results, 0.5, 0)).toBe(results);
    expect(perturbRecommendResults([results[0]!], 0.5, 0.4)).toHaveLength(1);
  });

  it("leaves scores untouched at the midpoint of the noise", () => {
    const out = perturbRecommendResults(results, 0.5, 0.4, () => 0.5);

    expect(out.map((r) => r.score)).toEqual([0.9, 0.8]);
  });

  it("can reorder the pool", () => {
    const out = perturbRecommendResults(results, 0.5, 0.4, seededRng([0, 1]));

    expect(out.map((r) => r.courseNumber)).toEqual(["61B", "61A"]);
  });

  it("bounds the noise by range times fraction", () => {
    const range = 0.4;
    const fraction = 0.5;
    const temperature = range * fraction;

    for (const draw of [0, 1]) {
      const out = perturbRecommendResults(results, fraction, range, () => draw);

      for (const r of out) {
        const original = results.find(
          (o) => o.courseNumber === r.courseNumber
        )!;
        expect(Math.abs(r.score - original.score)).toBeLessThanOrEqual(
          temperature + 1e-9
        );
      }
    }
  });

  it("does not mutate the input", () => {
    perturbRecommendResults(results, 0.5, 0.4, seededRng([0, 1]));

    expect(results.map((r) => r.score)).toEqual([0.9, 0.8]);
  });
});

describe("inferUserCareer", () => {
  it("defaults to UGRD when nothing is known", () => {
    expect(inferUserCareer([])).toBe("UGRD");
    expect(inferUserCareer([null, null])).toBe("UGRD");
  });

  it("takes the majority career", () => {
    expect(inferUserCareer(["GRAD", "GRAD", "UGRD"])).toBe("GRAD");
  });

  it("ignores nulls when counting", () => {
    expect(inferUserCareer([null, "GRAD", null])).toBe("GRAD");
  });

  it("keeps the first career on a tie", () => {
    expect(inferUserCareer(["GRAD", "UGRD"])).toBe("GRAD");
  });
});

describe("withoutAdministrative", () => {
  it("drops courses that exist to award credit", () => {
    const titles = [
      "Completion of Work",
      "Professional Preparation",
      "Dissertation Research",
      "Research",
      "Individual Study",
      "Directed Group Study",
      "Supervised Teaching",
      "Field Studies",
    ];

    expect(
      withoutAdministrative(
        titles.map((title, i) => snapshot(`${i}`, { title }))
      )
    ).toEqual([]);
  });

  it("keeps real courses whose title starts with a matched word", () => {
    const kept = withoutAdministrative([
      snapshot("1", { title: "Research Methods in Psychology" }),
      snapshot("2", {
        title: "Structure and Interpretation of Computer Programs",
      }),
      snapshot("3", { title: "Special Relativity" }),
    ]);

    expect(ids(kept)).toEqual(["1", "2", "3"]);
  });
});

describe("shuffle", () => {
  it("does not mutate the input", () => {
    const items = ["a", "b", "c"];
    shuffle(items, seededRng([0.99, 0.01]));

    expect(items).toEqual(["a", "b", "c"]);
  });

  it("returns a permutation of the input", () => {
    const items = ["a", "b", "c", "d"];

    expect([...shuffle(items, seededRng([0.3, 0.7, 0.1]))].sort()).toEqual(
      items
    );
  });

  it("is deterministic for a given rng", () => {
    const items = ["a", "b", "c", "d"];
    const draws = [0.3, 0.7, 0.1];

    expect(shuffle(items, seededRng(draws))).toEqual(
      shuffle(items, seededRng(draws))
    );
  });
});

describe("rankByAdjustedScore", () => {
  const range = 0.1;

  function ranked(
    snapshots: ExploreCourseSnapshot[],
    scores: Record<string, number>,
    userCareer = "UGRD",
    alreadyShown?: ReadonlySet<string>
  ) {
    return rankByAdjustedScore(
      snapshots,
      new Map(Object.entries(scores)),
      userCareer,
      range,
      alreadyShown
    );
  }

  it("orders by score when nothing is penalized", () => {
    const out = ranked([snapshot("a"), snapshot("b"), snapshot("c")], {
      a: 0.8,
      b: 0.95,
      c: 0.9,
    });

    expect(ids(out)).toEqual(["b", "c", "a"]);
  });

  it("treats a missing score as 0", () => {
    const out = ranked([snapshot("a"), snapshot("b")], { b: 0.5 });

    expect(ids(out)).toEqual(["b", "a"]);
  });

  it("docks a course whose classes are all full", () => {
    const out = ranked(
      [
        snapshot("full", { seatScore: SeatScore.Full }),
        snapshot("open", { seatScore: SeatScore.Open }),
      ],
      { full: 0.92, open: 0.9 }
    );

    expect(ids(out)).toEqual(["open", "full"]);
  });

  it("keeps a full course ahead when its lead exceeds the dock", () => {
    const lead = RECOMMEND_FULL_SEAT_PENALTY_FRACTION * range + 0.01;
    const out = ranked(
      [
        snapshot("full", { seatScore: SeatScore.Full }),
        snapshot("open", { seatScore: SeatScore.Open }),
      ],
      { full: 0.9 + lead, open: 0.9 }
    );

    expect(ids(out)).toEqual(["full", "open"]);
  });

  it("does not dock a course whose capacity is unpublished", () => {
    const out = ranked(
      [
        snapshot("unknown", { seatScore: SeatScore.Unknown }),
        snapshot("open", { seatScore: SeatScore.Open }),
      ],
      { unknown: 0.95, open: 0.9 }
    );

    expect(ids(out)).toEqual(["unknown", "open"]);
  });

  it("docks a career mismatch symmetrically", () => {
    const forUndergrad = ranked(
      [
        snapshot("grad", { academicCareer: "GRAD" }),
        snapshot("ugrd", { academicCareer: "UGRD" }),
      ],
      { grad: 0.95, ugrd: 0.9 },
      "UGRD"
    );
    const forGrad = ranked(
      [
        snapshot("grad", { academicCareer: "GRAD" }),
        snapshot("ugrd", { academicCareer: "UGRD" }),
      ],
      { grad: 0.9, ugrd: 0.95 },
      "GRAD"
    );

    expect(ids(forUndergrad)).toEqual(["ugrd", "grad"]);
    expect(ids(forGrad)).toEqual(["grad", "ugrd"]);
  });

  it("never docks a course with no known career", () => {
    const out = ranked(
      [
        snapshot("unknown", { academicCareer: null }),
        snapshot("match", { academicCareer: "GRAD" }),
      ],
      { unknown: 0.95, match: 0.9 },
      "GRAD"
    );

    expect(ids(out)).toEqual(["unknown", "match"]);
  });

  it("docks a course already shown in an earlier rail", () => {
    const out = ranked(
      [snapshot("shown"), snapshot("fresh")],
      { shown: 0.95, fresh: 0.9 },
      "UGRD",
      new Set(["shown"])
    );

    expect(ids(out)).toEqual(["fresh", "shown"]);
  });

  it("compounds penalties", () => {
    const out = ranked(
      [
        snapshot("both", {
          seatScore: SeatScore.Full,
          academicCareer: "GRAD",
        }),
        snapshot("fullOnly", { seatScore: SeatScore.Full }),
        snapshot("clean"),
      ],
      { both: 0.9, fullOnly: 0.9, clean: 0.9 }
    );

    expect(ids(out)).toEqual(["clean", "fullOnly", "both"]);
  });

  it("keeps the relative order of equally penalized courses", () => {
    const allFull = [
      snapshot("a", { seatScore: SeatScore.Full }),
      snapshot("b", { seatScore: SeatScore.Full }),
      snapshot("c", { seatScore: SeatScore.Full }),
    ];

    const penalized = ranked(allFull, { a: 0.8, b: 0.95, c: 0.9 });
    const unpenalized = ranked(
      allFull.map((s) => ({ ...s, seatScore: SeatScore.Open })),
      { a: 0.8, b: 0.95, c: 0.9 }
    );

    expect(ids(penalized)).toEqual(ids(unpenalized));
  });

  it("docks by the configured fraction of the range", () => {
    const gap = 0.01;
    const clears = (fraction: number) => fraction * range > gap;

    const seat = ranked(
      [snapshot("full", { seatScore: SeatScore.Full }), snapshot("open")],
      { full: 0.9 + gap, open: 0.9 }
    );

    expect(clears(RECOMMEND_FULL_SEAT_PENALTY_FRACTION)).toBe(true);
    expect(clears(RECOMMEND_CAREER_MISMATCH_PENALTY_FRACTION)).toBe(true);
    expect(clears(RECOMMEND_CROSS_RAIL_PENALTY_FRACTION)).toBe(true);
    expect(ids(seat)).toEqual(["open", "full"]);
  });

  it("does not mutate the input", () => {
    const snapshots = [snapshot("a"), snapshot("b")];
    ranked(snapshots, { a: 0.1, b: 0.9 });

    expect(ids(snapshots)).toEqual(["a", "b"]);
  });
});
