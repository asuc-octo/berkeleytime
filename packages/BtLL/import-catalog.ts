/// <reference types="node" />
/**
 * Generates GradTrak requirement programs (BtLL) from the Berkeley undergraduate
 * catalog (Coursedog) and writes them to catalog_reqs.generated.ts, which
 * generate-mongosh-commands.ts seeds alongside the hand-written programs.
 *
 * MVP scope: a curated, diverse set of programs (PROGRAMS below). Output is
 * best-effort: structured rules are converted, and anything that can't be
 * converted (free text, major-specific requirement sets, unsupported rules)
 * becomes an unmet placeholder requirement students can check off manually.
 * See .claude/docs/features/gradtrak/catalog-requirements-source.md.
 *
 * Usage: npm run import:catalog
 */
import { readFileSync, writeFileSync } from "node:fs";

import { init } from "./src/index";

const API = "https://app.coursedog.com/api/v1";
const SCHOOL = "ucberkeley_peoplesoft";
const CATALOG_ID = "hMSTjlpIK6VX5nnJn7ZE"; // 2026-27 undergraduate catalog

// Programs to generate, by programGroupId. Their catalog names must exactly
// match a GradTrak major/minor so the generated program can be seeded.
const PROGRAMS = [
  "25345U", // English major: fully structured
  "25I071U", // Mathematics minor: fully structured (catalog data known to be wrong)
  "16I020U", // Structural Engineering minor: fully structured, option-style rules
  "25179U", // Cognitive Science major: mostly structured, some free text
  "16279U", // Aerospace Engineering major: option-style rules, some free text
  "25699U", // Political Science major: course sets, option-style rules
  "25I072U", // Physics minor: course sets, minimum units, rule descriptions
  "04779U", // Environmental Economics and Policy major: course sets, free text, major-specific requirement set
  "z5SVnW3RWZv5syG4KuEY", // Ecosystem Management and Forestry major: free text only
  "25I034U", // Chinese Language minor: free text only
];

// UC, campus and college requirement sets, which GradTrak's UC and college
// programs already cover. Rules that reference only these are dropped; any
// other (major-specific) set becomes a placeholder.
const SKIPPABLE_REQUISITE_SETS = new Set([
  "kYxMvh1XxU", // 1/3 Passed Grade Limit
  "Ir9XEqkeEu", // American Cultures
  "RrMDt6AX1t", // American History and Institutions
  "hyTQ88jgEk", // CDSS Breadth
  "rsB2P1O8uh", // CDSS Computational Reasoning
  "uQjn20qaPU", // CDSS Human and Social Dynamics of Data and Technology
  "Ob9RBkY8zd", // CDSS Statistical Reasoning
  "m7vxRaCrsR", // CDSS Unit and Academic Requirements
  "G0zvfQfwQd", // CED Environmental Design
  "Fo9ZJEsTsm", // CED Seven Course Breadth
  "mM4bxGFMvi", // CED Unit and Academic Requirements
  "I7brkBx0xE", // COC Breadth
  "mpX9mMa6gj", // COC Unit and Academic Requirements
  "GuvH7MlH8z", // COE Humanities and Social Sciences Requirement
  "xnayJjgV8t", // COE Unit and Academic Requirements
  "aqpOcZRaCl", // Entry Level Writing (ELWR)
  "br311mpo7D", // Haas Academic Requirements
  "k049GesLq0", // Haas Seven Course Breadth
  "owExj1yVKM", // L&S General Guidelines
  "jZIqwbO7zz", // L&S Language Requirement
  "ONfHGUOPKd", // L&S Minor Guidelines
  "yrC5yMuOlP", // L&S Quantitative Reasoning
  "bpUWoFAIH0", // L&S Seven-Course Breadth
  "DFzgs4HE4z", // L&S Unit Requirements
  "Jijd4SqOSt", // Minimum Cumulative GPA
  "keUo8oeU8W", // Minimum Total Units
  "FbH5M0OhaN", // RCNR Unit and Academic Requirements
  "EgUjZ8V0AT", // Reading and Composition
  "eLBVK0Snrt", // Senior Residence
]);

// Renumbered courses: plans from before the change still use the old number
const EQUIVALENT_COURSES: Record<string, string[]> = {
  "MATH 51": ["MATH 1A"],
  "MATH 52": ["MATH 1B"],
};

const RULE_CONDITIONS = [
  "completedAllOf",
  "completedAtLeastXOf",
  "completedAnyOf",
  "minimumCredits",
];

// Flagged in the summary for the refinement agent; converted literally for now
const OPTION_NAME = /option|track|concentration|either/i;

interface Rule {
  name: string;
  condition: string; // a catalog rule condition, or "placeholder"
  n: number; // courses (groups) or units required
  groups: string[][]; // course IDs, later codes; each group is a set of alternatives
}

interface Program {
  name: string;
  kind: "major" | "minor";
  rules: Rule[];
  flags: string[];
}

async function api(path: string, body?: unknown) {
  const res = await fetch(`${API}${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Origin: "https://undergraduate.catalog.berkeley.edu",
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${path}`);
  return res.json();
}

const stripHtml = (html?: string) =>
  (html ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim();

// Drop characters that confuse the BtLL line parser (brackets, quotes)
const sanitize = (s: string) =>
  s
    .replace(/[()[\]{}<>"'`\\]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const placeholder = (name: string): Rule => ({
  name,
  condition: "placeholder",
  n: 0,
  groups: [],
});

/** Converts a catalog program's rules, best-effort. */
function parseProgram(p: any): { rules: Rule[]; flags: string[] } {
  const rules: Rule[] = [];
  const flags = new Set<string>();
  for (const block of p.requisites?.requisitesSimple ?? []) {
    if (block.type === "Narrative Text") continue;
    for (const r of block.rules ?? []) {
      const name =
        sanitize(r.name ?? "") || sanitize(block.name ?? "") || "Requirement";
      if (stripHtml(r.description)) flags.add("rule descriptions");
      if (OPTION_NAME.test(r.name ?? "")) flags.add("option-style rules");

      if (r.condition === "freeformText") {
        flags.add("free text");
        rules.push(placeholder(name));
        continue;
      }
      const ids: string[][] = r.value?.values?.map((g: any) => g.value) ?? [];
      if (r.value?.condition === "requisiteSets") {
        if (ids.flat().every((id) => SKIPPABLE_REQUISITE_SETS.has(id)))
          continue;
        flags.add("major-specific requirement set");
        rules.push(placeholder(name));
        continue;
      }
      if (
        !RULE_CONDITIONS.includes(r.condition) ||
        !["courses", "courseSets"].includes(r.value?.condition)
      ) {
        flags.add(`unsupported rule (${r.condition}/${r.value?.condition})`);
        rules.push(placeholder(name));
        continue;
      }

      if (r.value.condition === "courseSets") flags.add("course sets");
      if (r.condition === "completedAtLeastXOf" && r.restriction == null)
        flags.add(`missing count on "${name}", assumed 1`);
      const groups =
        r.value.condition === "courseSets"
          ? ids.flat().map((id) => [`set:${id}`])
          : ids;
      rules.push({
        name,
        condition: r.condition,
        n:
          r.condition === "minimumCredits"
            ? r.credits
            : r.condition === "completedAllOf"
              ? groups.length
              : r.condition === "completedAnyOf"
                ? 1
                : (r.restriction ?? 1),
        groups,
      });
    }
  }
  return { rules, flags: [...flags] };
}

const courseLiteral = (code: string) => {
  const [subject, ...number] = code.split(" ");
  return `{"${subject}", "${number.join(" ")}"}`;
};

/** Builds the BtLL program; here each rule's groups hold course codes ("MATH 53"). */
function toBtLL(rules: Rule[]) {
  const lines = [
    "Function<List<Requirement>>() main (){",
    '  List<Course> courses get_attr(this, "allCourses")',
  ];
  rules.forEach((rule, i) => {
    if (rule.condition === "placeholder") {
      lines.push(
        `  BooleanRequirement r${i} {false, "${rule.name} - manual check, see catalog"}`
      );
      return;
    }
    const all = [...new Set(rule.groups.flat())].map(courseLiteral).join(", ");
    lines.push(
      `  List<Course> r${i}_m filter(courses, (c) { boolean return one_common_course([c], [${all}]) })`
    );
    if (rule.condition === "minimumCredits") {
      lines.push(
        `  NumberRequirement r${i} {r${i}_m, sum_units(r${i}_m), ${rule.n}, "${rule.name}"}`
      );
      return;
    }
    rule.groups.forEach((group, j) => {
      lines.push(
        `  boolean r${i}_g${j} one_common_course(courses, [${group.map(courseLiteral).join(", ")}])`
      );
    });
    const count = rule.groups
      .map((_, j) => `if_else(r${i}_g${j}, 1, 0)`)
      .join(", ");
    lines.push(
      `  NCoursesRequirement r${i} {r${i}_m, add([${count}]), ${rule.n}, "${rule.name}"}`
    );
  });
  lines.push(
    `  List<Requirement> return [${rules.map((_, i) => `r${i}`).join(", ")}]`
  );
  lines.push("}");
  return lines.join("\n");
}

/** Evaluates the program on a plan with the given courses; returns each requirement's result. */
function evaluate(code: string, courseCodes: string[]): boolean[] {
  const courses = courseCodes.map((c) => {
    const [subject, ...number] = c.split(" ");
    return {
      subject: { data: subject, type: "string" },
      number: { data: number.join(" "), type: "string" },
      units: { data: 10, type: "number" }, // generous, so unit minimums are satisfiable
      universityRequirement: { data: "", type: "string" },
      breadthRequirements: { data: [], type: "List<string>" },
      languageLevel: { data: "", type: "string" },
    };
  });
  const plan = {
    data: {
      allCourses: { data: courses, type: "List<Course>" },
      columns: { data: [], type: "List<Column>" },
      units: { data: 0, type: "number" },
    },
    type: "Plan",
  };
  const vars = new Map<string, any>([
    ["this", plan],
    ["columns", { data: [], type: "List<Column>" }],
  ]);
  return init(code, vars).map((r: any) => r.result.data);
}

async function main() {
  const gradtrak = JSON.parse(
    readFileSync(
      new URL(
        "../../apps/frontend/src/components/MajorSearch/degree-programs-types.json",
        import.meta.url
      ),
      "utf8"
    )
  );

  const { data: programs } = await api(
    `/cm/${SCHOOL}/programs/search/%24filters?catalogId=${CATALOG_ID}&skip=0&limit=500&columns=catalogDisplayName,programGroupId,type,requisites`,
    { programGroupIds: PROGRAMS }
  );

  const selected: Program[] = [];
  for (const id of PROGRAMS) {
    const p = programs.find((x: any) => x.programGroupId === id);
    if (!p) throw new Error(`Program ${id} not found in the catalog`);
    const kind = p.type === "Minor" ? "minor" : "major";
    const name = (p.catalogDisplayName ?? "").trim();
    if (!gradtrak[`${kind}s`].includes(name))
      throw new Error(
        `"${name}" (${kind}) doesn't match a GradTrak ${kind} name`
      );
    selected.push({ name, kind, ...parseProgram(p) });
  }

  // Expand course sets into their courses, one group per course
  const setIds = [
    ...new Set(
      selected
        .flatMap((p) => p.rules.flatMap((r) => r.groups.flat()))
        .filter((id) => id.startsWith("set:"))
    ),
  ].map((id) => id.slice(4));
  const sets: Record<string, string[]> = {};
  if (setIds.length) {
    const res = await api(
      `/cm/${SCHOOL}/courseSets?courseSetGroupIds=${setIds.join(",")}`
    );
    for (const s of Object.values<any>(res))
      sets[s.courseSetGroupId] =
        s.type === "dynamic" ? s.dynamicCourseList : s.courseList;
  }
  for (const p of selected)
    for (const r of p.rules)
      r.groups = r.groups.flatMap((g) =>
        g[0].startsWith("set:")
          ? (sets[g[0].slice(4)] ?? []).map((id) => [id])
          : [g]
      );

  // Resolve course IDs to "SUBJECT NUMBER"
  const courseIds = [
    ...new Set(
      selected.flatMap((p) => p.rules.flatMap((r) => r.groups.flat()))
    ),
  ];
  const codes: Record<string, string> = {};
  for (let i = 0; i < courseIds.length; i += 200) {
    const { data } = await api(
      `/cm/${SCHOOL}/courses/search/%24filters?catalogId=${CATALOG_ID}&skip=0&limit=500&columns=subjectCode,courseNumber,courseGroupId,deprecatedCourseGroupId`,
      { courseGroupIds: courseIds.slice(i, i + 200) }
    );
    // Some rules still reference courses by their old (deprecated) ID
    for (const c of data)
      for (const id of [c.courseGroupId, c.deprecatedCourseGroupId])
        if (id) codes[id] = `${c.subjectCode} ${c.courseNumber}`;
  }

  const output: {
    name: string;
    major: string | null;
    minor: string | null;
    code: string;
  }[] = [];
  for (const p of selected) {
    // Drop courses the catalog can't resolve; a rule left with nothing becomes a placeholder
    const unresolved = p.rules
      .flatMap((r) => r.groups.flat())
      .filter((id) => !codes[id]);
    if (unresolved.length)
      p.flags.push(`${unresolved.length} unresolved course IDs dropped`);
    const rules = p.rules.map((r) => {
      if (r.condition === "placeholder") return r;
      const groups = r.groups
        .map((g) => [
          ...new Set(
            g
              .filter((id) => codes[id])
              .flatMap((id) => [
                codes[id],
                ...(EQUIVALENT_COURSES[codes[id]] ?? []),
              ])
          ),
        ])
        .filter((g) => g.length);
      if (!groups.length) {
        p.flags.push(`no resolvable courses in "${r.name}"`);
        return placeholder(r.name);
      }
      // A catalog rule asking for more courses than it lists can never be met
      if (r.condition !== "minimumCredits" && r.n > groups.length) {
        p.flags.push(
          `unsatisfiable catalog rule "${r.name}" (${r.n} of ${groups.length})`
        );
        return placeholder(r.name);
      }
      return { ...r, groups };
    });
    const code = toBtLL(rules);

    // Sanity check: nothing met on an empty plan; every non-placeholder rule met
    // when the first option of every group is taken (placeholders stay unmet)
    const isPlaceholder = rules.map((r) => r.condition === "placeholder");
    const empty = evaluate(code, []);
    const full = evaluate(
      code,
      rules.flatMap((r) => r.groups.map((g) => g[0]))
    );
    const failed = rules
      .filter((_, i) => empty[i] || full[i] === isPlaceholder[i])
      .map(
        (r) =>
          `"${r.name}" (${r.condition} ${r.n} of ${r.groups.length} groups)`
      );
    if (failed.length)
      throw new Error(
        `${p.name} (${p.kind}) failed the sanity check: ${failed.join(", ")}`
      );

    output.push({
      name: `${p.name} ${p.kind === "major" ? "Major" : "Minor"} Requirements`,
      major: p.kind === "major" ? p.name : null,
      minor: p.kind === "minor" ? p.name : null,
      code,
    });
    const placeholders = isPlaceholder.filter(Boolean).length;
    console.log(
      `+ ${output.at(-1)!.name}: ${rules.length - placeholders} converted, ${placeholders} placeholders` +
        (p.flags.length ? ` [${p.flags.join("; ")}]` : "")
    );
  }

  const file = `// GENERATED by import-catalog.ts from the Berkeley catalog (catalog ${CATALOG_ID}). Do not edit.
// Regenerate with: npm run import:catalog -w @repo/BtLL

export const CATALOG_REQUIREMENTS: {
  name: string;
  major: string | null;
  minor: string | null;
  code: string;
}[] = ${JSON.stringify(output, null, 2)};
`;
  writeFileSync(new URL("./catalog_reqs.generated.ts", import.meta.url), file);
  console.log(`\nWrote ${output.length} programs to catalog_reqs.generated.ts`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
