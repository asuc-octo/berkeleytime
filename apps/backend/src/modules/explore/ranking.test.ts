import assert from "node:assert/strict";
import { describe, it } from "node:test";

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
    assert.strictEqual(capLimit(null), 20);
    assert.strictEqual(capLimit(undefined), 20);
    assert.strictEqual(capLimit(NaN), 20);
  });

  it("clamps to at least 1", () => {
    assert.strictEqual(capLimit(0), 1);
    assert.strictEqual(capLimit(-5), 1);
  });

  it("clamps to the rail cap", () => {
    assert.strictEqual(capLimit(999), 48);
    assert.strictEqual(capLimit(48), 48);
  });

  it("floors fractional limits", () => {
    assert.strictEqual(capLimit(20.7), 20);
  });
});

describe("recommendPoolSize", () => {
  it("over-fetches by the pool factor", () => {
    assert.strictEqual(recommendPoolSize(10), 30);
  });

  it("stops at the pool cap", () => {
    assert.strictEqual(recommendPoolSize(20), 48);
    assert.strictEqual(recommendPoolSize(48), 48);
  });
});

describe("uniqueCourseIds", () => {
  it("keeps the first occurrence of a cross-listed course", () => {
    assert.deepStrictEqual(
      uniqueCourseIds(["157712", "125364", "157712", "999"]),
      ["157712", "125364", "999"]
    );
  });

  it("returns an empty list unchanged", () => {
    assert.deepStrictEqual(uniqueCourseIds([]), []);
  });
});

describe("scoreRange", () => {
  it("returns the span of the pool", () => {
    const results = [
      { subject: "COMPSCI", courseNumber: "61A", score: 0.92 },
      { subject: "COMPSCI", courseNumber: "61B", score: 0.9 },
      { subject: "COMPSCI", courseNumber: "70", score: 0.86 },
    ];

    assert.ok(Math.abs(scoreRange(results) - 0.06) < 10 ** -10 / 2);
  });

  it("returns 0 for pools too small to have a span", () => {
    assert.strictEqual(scoreRange([]), 0);
    assert.strictEqual(
      scoreRange([{ subject: "COMPSCI", courseNumber: "61A", score: 0.92 }]),
      0
    );
  });
});

describe("perturbRecommendResults", () => {
  const results = [
    { subject: "COMPSCI", courseNumber: "61A", score: 0.9 },
    { subject: "COMPSCI", courseNumber: "61B", score: 0.8 },
  ];

  it("returns the input when there is nothing to jitter", () => {
    assert.strictEqual(perturbRecommendResults(results, 0, 0.4), results);
    assert.strictEqual(perturbRecommendResults(results, 0.5, 0), results);
    assert.strictEqual(
      perturbRecommendResults([results[0]!], 0.5, 0.4).length,
      1
    );
  });

  it("leaves scores untouched at the midpoint of the noise", () => {
    const out = perturbRecommendResults(results, 0.5, 0.4, () => 0.5);

    assert.deepStrictEqual(
      out.map((r) => r.score),
      [0.9, 0.8]
    );
  });

  it("can reorder the pool", () => {
    const out = perturbRecommendResults(results, 0.5, 0.4, seededRng([0, 1]));

    assert.deepStrictEqual(
      out.map((r) => r.courseNumber),
      ["61B", "61A"]
    );
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
        assert.ok(Math.abs(r.score - original.score) <= temperature + 1e-9);
      }
    }
  });

  it("does not mutate the input", () => {
    perturbRecommendResults(results, 0.5, 0.4, seededRng([0, 1]));

    assert.deepStrictEqual(
      results.map((r) => r.score),
      [0.9, 0.8]
    );
  });
});

describe("inferUserCareer", () => {
  it("defaults to UGRD when nothing is known", () => {
    assert.strictEqual(inferUserCareer([]), "UGRD");
    assert.strictEqual(inferUserCareer([null, null]), "UGRD");
  });

  it("takes the majority career", () => {
    assert.strictEqual(inferUserCareer(["GRAD", "GRAD", "UGRD"]), "GRAD");
  });

  it("ignores nulls when counting", () => {
    assert.strictEqual(inferUserCareer([null, "GRAD", null]), "GRAD");
  });

  it("keeps the first career on a tie", () => {
    assert.strictEqual(inferUserCareer(["GRAD", "UGRD"]), "GRAD");
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

    assert.deepStrictEqual(
      withoutAdministrative(
        titles.map((title, i) => snapshot(`${i}`, { title }))
      ),
      []
    );
  });

  it("keeps real courses whose title starts with a matched word", () => {
    const kept = withoutAdministrative([
      snapshot("1", { title: "Research Methods in Psychology" }),
      snapshot("2", {
        title: "Structure and Interpretation of Computer Programs",
      }),
      snapshot("3", { title: "Special Relativity" }),
    ]);

    assert.deepStrictEqual(ids(kept), ["1", "2", "3"]);
  });
});

describe("shuffle", () => {
  it("does not mutate the input", () => {
    const items = ["a", "b", "c"];
    shuffle(items, seededRng([0.99, 0.01]));

    assert.deepStrictEqual(items, ["a", "b", "c"]);
  });

  it("returns a permutation of the input", () => {
    const items = ["a", "b", "c", "d"];

    assert.deepStrictEqual(
      [...shuffle(items, seededRng([0.3, 0.7, 0.1]))].sort(),
      items
    );
  });

  it("is deterministic for a given rng", () => {
    const items = ["a", "b", "c", "d"];
    const draws = [0.3, 0.7, 0.1];

    assert.deepStrictEqual(
      shuffle(items, seededRng(draws)),
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

    assert.deepStrictEqual(ids(out), ["b", "c", "a"]);
  });

  it("treats a missing score as 0", () => {
    const out = ranked([snapshot("a"), snapshot("b")], { b: 0.5 });

    assert.deepStrictEqual(ids(out), ["b", "a"]);
  });

  it("docks a course whose classes are all full", () => {
    const out = ranked(
      [
        snapshot("full", { seatScore: SeatScore.Full }),
        snapshot("open", { seatScore: SeatScore.Open }),
      ],
      { full: 0.92, open: 0.9 }
    );

    assert.deepStrictEqual(ids(out), ["open", "full"]);
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

    assert.deepStrictEqual(ids(out), ["full", "open"]);
  });

  it("does not dock a course whose capacity is unpublished", () => {
    const out = ranked(
      [
        snapshot("unknown", { seatScore: SeatScore.Unknown }),
        snapshot("open", { seatScore: SeatScore.Open }),
      ],
      { unknown: 0.95, open: 0.9 }
    );

    assert.deepStrictEqual(ids(out), ["unknown", "open"]);
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

    assert.deepStrictEqual(ids(forUndergrad), ["ugrd", "grad"]);
    assert.deepStrictEqual(ids(forGrad), ["grad", "ugrd"]);
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

    assert.deepStrictEqual(ids(out), ["unknown", "match"]);
  });

  it("docks a course already shown in an earlier rail", () => {
    const out = ranked(
      [snapshot("shown"), snapshot("fresh")],
      { shown: 0.95, fresh: 0.9 },
      "UGRD",
      new Set(["shown"])
    );

    assert.deepStrictEqual(ids(out), ["fresh", "shown"]);
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

    assert.deepStrictEqual(ids(out), ["clean", "fullOnly", "both"]);
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

    assert.deepStrictEqual(ids(penalized), ids(unpenalized));
  });

  it("docks by the configured fraction of the range", () => {
    const gap = 0.01;
    const clears = (fraction: number) => fraction * range > gap;

    const seat = ranked(
      [snapshot("full", { seatScore: SeatScore.Full }), snapshot("open")],
      { full: 0.9 + gap, open: 0.9 }
    );

    assert.strictEqual(clears(RECOMMEND_FULL_SEAT_PENALTY_FRACTION), true);
    assert.strictEqual(
      clears(RECOMMEND_CAREER_MISMATCH_PENALTY_FRACTION),
      true
    );
    assert.strictEqual(clears(RECOMMEND_CROSS_RAIL_PENALTY_FRACTION), true);
    assert.deepStrictEqual(ids(seat), ["open", "full"]);
  });

  it("does not mutate the input", () => {
    const snapshots = [snapshot("a"), snapshot("b")];
    ranked(snapshots, { a: 0.1, b: 0.9 });

    assert.deepStrictEqual(ids(snapshots), ["a", "b"]);
  });
});
