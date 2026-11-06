/// <reference types="node" />
/**
 * Generates GradTrak requirement programs (BtLL) from the Berkeley catalog
 * (Coursedog API), applies the overrides in catalog-overrides/, and writes
 * catalog_reqs.generated.ts. Usage: npm run import:catalog
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";

import { init } from "./src/index";

const API = "https://app.coursedog.com/api/v1";
const SCHOOL = "ucberkeley_peoplesoft";
const CATALOG_ID = "hMSTjlpIK6VX5nnJn7ZE"; // 2026-27 undergraduate catalog

// Catalog names must exactly match a GradTrak major/minor
const PROGRAMS = [
  "25345U", // English major
  "25I071U", // Mathematics minor
  "16I020U", // Structural Engineering minor
  "25179U", // Cognitive Science major
  "16279U", // Aerospace Engineering major
  "25699U", // Political Science major
  "25I072U", // Physics minor
  "04779U", // Environmental Economics and Policy major
  "z5SVnW3RWZv5syG4KuEY", // Ecosystem Management and Forestry major
  "25I034U", // Chinese Language minor
];

// Covered by GradTrak's UC and college programs; other requirement sets become placeholders
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

// Flagged for review, converted literally
const OPTION_NAME = /option|track|concentration|either/i;

const KINDS = [
  "allOf",
  "atLeast",
  "minUnits",
  "placeholder",
  "chooseRules",
  "matching",
] as const;

interface Rule {
  id?: string; // catalog rule id
  name: string;
  kind: (typeof KINDS)[number];
  n: number; // groups, units or sub-rules required
  groups: string[][]; // each group is a set of alternatives
  shared?: boolean; // may reuse courses other rules counted
  rules?: Rule[];
  subjects?: string[];
  upperDivision?: boolean; // numbered 100-199
  fromProgram?: boolean; // only courses listed in this program's other rules
  units?: boolean; // n is units, not courses
  description?: string;
  text?: string; // placeholder's catalog text
}

interface Program {
  id: string; // programGroupId
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
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

// Drop characters that confuse the BtLL line parser (brackets, quotes)
const sanitize = (s: string) =>
  s
    .replace(/[()[\]{}<>"'`\\]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const placeholder = (r: Partial<Rule> & { name: string }): Rule => ({
  id: r.id,
  name: r.name,
  kind: "placeholder",
  n: 0,
  groups: [],
  description: r.description,
  text: r.text,
});

const KIND_OF: Record<string, Rule["kind"]> = {
  completedAllOf: "allOf",
  completedAtLeastXOf: "atLeast",
  completedAnyOf: "atLeast",
  minimumCredits: "minUnits",
};

function parseProgram(p: any): { rules: Rule[]; flags: string[] } {
  const rules: Rule[] = [];
  const flags = new Set<string>();
  for (const block of p.requisites?.requisitesSimple ?? []) {
    if (block.type === "Narrative Text") continue;
    for (const r of block.rules ?? []) {
      const name =
        sanitize(r.name ?? "") || sanitize(block.name ?? "") || "Requirement";
      const description = stripHtml(r.description) || undefined;
      if (description) flags.add("rule descriptions");
      if (OPTION_NAME.test(r.name ?? "")) flags.add("option-style rules");

      if (r.condition === "freeformText") {
        flags.add("free text");
        rules.push(placeholder({ id: r.id, name, text: description }));
        continue;
      }
      const ids: string[][] = r.value?.values?.map((g: any) => g.value) ?? [];
      if (r.value?.condition === "requisiteSets") {
        const setIds = ids
          .flat()
          .filter((id) => !SKIPPABLE_REQUISITE_SETS.has(id));
        if (!setIds.length) continue;
        flags.add("major-specific requirement set");
        // Named after the referenced sets in main
        const text = setIds.map((id) => `set:${id}`).join(" ");
        rules.push(placeholder({ id: r.id, name, description, text }));
        continue;
      }
      if (
        !RULE_CONDITIONS.includes(r.condition) ||
        !["courses", "courseSets"].includes(r.value?.condition)
      ) {
        flags.add(`unsupported rule (${r.condition}/${r.value?.condition})`);
        rules.push(placeholder({ id: r.id, name, description }));
        continue;
      }

      if (r.value.condition === "courseSets") flags.add("course sets");
      if (r.condition === "completedAtLeastXOf" && r.restriction == null)
        flags.add(`missing count on "${name}", assumed 1`);
      const kind = KIND_OF[r.condition];
      rules.push({
        id: r.id,
        name,
        kind,
        // allOf counts are set once course sets are expanded (see main)
        n:
          kind === "minUnits"
            ? r.credits
            : r.condition === "completedAtLeastXOf"
              ? (r.restriction ?? 1)
              : 1,
        groups:
          r.value.condition === "courseSets"
            ? ids.flat().map((id) => [`set:${id}`])
            : ids,
        description,
      });
    }
  }
  return { rules, flags: [...flags] };
}

const courseLiteral = (code: string) => {
  const [subject, ...number] = code.split(" ");
  return `{"${subject}", "${number.join(" ")}"}`;
};

const allCodes = (rules: Rule[]): string[] => [
  ...new Set(
    rules.flatMap((r) => [...r.groups.flat(), ...allCodes(r.rules ?? [])])
  ),
];

// Each rule only sees courses earlier rules didn't use (p0, p1, ...), so a
// course counts toward at most one rule
function toBtLL(rules: Rule[]) {
  const lines = [
    "Function<List<Requirement>>() main (){",
    '  List<Course> courses get_attr(this, "allCourses")',
    "  List<Course> p0 courses",
  ];
  const programCodes = allCodes(rules).map(courseLiteral).join(", ");
  let programList = false;
  let pool = 0;

  const emit = (rule: Rule, v: string) => {
    const name = rule.name;
    if (rule.kind === "placeholder") {
      lines.push(
        `  BooleanRequirement ${v} {false, "${name} - manual check, see catalog"}`
      );
    } else if (rule.kind === "chooseRules") {
      const subs = (rule.rules ?? []).map((sub, k) => {
        emit(sub, `${v}_s${k}`);
        return `${v}_s${k}`;
      });
      const list = `[${subs.join(", ")}]`;
      lines.push(
        rule.n === 1
          ? `  OrRequirement ${v} {${list}, "${name}"}`
          : rule.n >= subs.length
            ? `  AndRequirement ${v} {${list}, "${name}"}`
            : `  OrRequirement ${v} {${list}, ${rule.n}, "${name}"}`
      );
    } else {
      const from = rule.shared ? "courses" : `p${pool}`;
      const byUnits = rule.kind === "minUnits" || rule.units;
      let countOf: string | undefined;
      if (rule.kind === "matching") {
        if (rule.fromProgram && !programList) {
          lines.push(`  List<Course> program [${programCodes}]`);
          programList = true;
        }
        const conditions = [
          rule.fromProgram && `one_common_course([c], program)`,
          rule.subjects?.length &&
            `contains([${rule.subjects.map((s) => `"${s}"`).join(", ")}], get_attr(c, "subject"))`,
          rule.upperDivision &&
            `regex_match(get_attr(c, "number"), "^[A-Z]*1[0-9][0-9]")`,
        ].filter(Boolean);
        lines.push(
          `  List<Course> ${v}_m filter(${from}, (c) { boolean return and([${conditions.join(", ")}]) })`
        );
      } else if (rule.kind === "minUnits") {
        const all = allCodes([rule]).map(courseLiteral).join(", ");
        lines.push(
          `  List<Course> ${v}_m filter(${from}, (c) { boolean return one_common_course([c], [${all}]) })`
        );
      } else {
        // A group with alternatives takes one course (its first match), so e.g.
        // MATH 104 and H104 can't use up another group's slot. Single-course
        // groups are matched together, since a variable per group is slow
        const singles = rule.groups.filter((g) => g.length === 1).flat();
        const multi = rule.groups.filter((g) => g.length > 1);
        const parts: string[] = [];
        if (singles.length) {
          lines.push(
            `  List<Course> ${v}_s filter(${from}, (c) { boolean return one_common_course([c], [${singles.map(courseLiteral).join(", ")}]) })`
          );
          parts.push(`${v}_s`);
        }
        multi.forEach((group, j) => {
          lines.push(
            `  List<Course> ${v}_f${j} slice(filter(${from}, (c) { boolean return one_common_course([c], [${group.map(courseLiteral).join(", ")}]) }), 0, 1)`
          );
          parts.push(`${v}_f${j}`);
        });
        lines.push(
          parts.length === 1
            ? `  List<Course> ${v}_m ${parts[0]}`
            : `  List<Course> ${v}_m filter(${from}, (c) { boolean return or([${parts.map((x) => `one_common_course([c], ${x})`).join(", ")}]) })`
        );
        countOf = `add([${parts.map((x) => `length(${x})`).join(", ")}])`;
      }
      // A rule lists only the courses it uses, so extras show up in later rules
      // instead of in both
      let shown = `${v}_m`;
      if (!rule.shared) {
        shown = `${v}_used`;
        lines.push(
          byUnits
            ? `  List<Course> ${v}_used take_until_units(${v}_m, ${rule.n})`
            : `  List<Course> ${v}_used slice(${v}_m, 0, ${rule.n})`
        );
      }
      lines.push(
        byUnits
          ? `  NumberRequirement ${v} {${shown}, sum_units(${shown}), ${rule.n}, "${name}"}`
          : `  NCoursesRequirement ${v} {${shown}, ${countOf ?? `length(${shown})`}, ${rule.n}, "${name}"}`
      );
      if (rule.shared) return;
      lines.push(
        `  List<Course> p${pool + 1} filter(p${pool}, (c) { boolean return not(one_common_course([c], ${v}_used)) })`
      );
      pool++;
    }
  };

  rules.forEach((rule, i) => emit(rule, `r${i}`));
  lines.push(
    `  List<Requirement> return [${rules.map((_, i) => `r${i}`).join(", ")}]`,
    "}"
  );
  return lines.join("\n");
}

const withEquivalents = (group: string[]) => [
  ...new Set(group.flatMap((c) => [c, ...(EQUIVALENT_COURSES[c] ?? [])])),
];

function checkRule(r: any, valid: Set<string>, where: string): Rule {
  const fail = (msg: string): never => {
    throw new Error(`${where}: ${msg}`);
  };
  if (!KINDS.includes(r?.kind)) fail(`unknown rule kind ${r?.kind}`);
  const name = sanitize(String(r.name ?? ""));
  if (!name) fail("rule needs a name");
  const n = r.kind === "allOf" ? r.groups?.length : r.n; // allOf needs every group
  const rule: Rule = { id: r.id, name, kind: r.kind, n, groups: [] };
  if (r.kind === "placeholder") return { ...rule, n: 0 };
  if (!Number.isInteger(n) || n < 1)
    fail(`"${name}": n must be a positive integer`);
  if (r.kind === "chooseRules") {
    if (!Array.isArray(r.rules) || n > r.rules.length)
      fail(`"${name}": needs at least n sub-rules`);
    return {
      ...rule,
      rules: r.rules.map((s: any) => checkRule(s, valid, where)),
    };
  }
  if (r.kind === "matching") {
    if (!r.fromProgram && !r.subjects?.length)
      fail(`"${name}": matching needs subjects or fromProgram`);
    const { fromProgram, subjects, upperDivision, units } = r;
    // Program-wide totals ("12 courses overall") look at courses other rules counted
    const shared = fromProgram === true || r.shared === true || undefined;
    return { ...rule, shared, fromProgram, subjects, upperDivision, units };
  }
  if (
    !Array.isArray(r.groups) ||
    !r.groups.length ||
    r.groups.some((g: any) => !g?.length)
  )
    fail(`"${name}": groups must be non-empty lists of course codes`);
  for (const code of r.groups.flat())
    if (!valid.has(code)) fail(`"${name}": unknown course code "${code}"`);
  return {
    ...rule,
    groups: r.groups.map(withEquivalents),
    shared: r.shared === true || undefined,
  };
}

function applyOverrides(
  rules: Rule[],
  ov: any,
  valid: Set<string>,
  label: string
) {
  const out = [...rules];
  (ov.changes ?? []).forEach((ch: any, i: number) => {
    const where = `${label} override change ${i + 1}`;
    if (
      !/^https:\/\//.test(ch.why?.url ?? "") ||
      !String(ch.why?.quote ?? "").trim()
    )
      throw new Error(
        `${where}: needs why.url (https) and a verbatim why.quote`
      );
    const at = (id: string) => {
      const k = out.findIndex((r) => r.id === id);
      if (k < 0) throw new Error(`${where}: unknown rule id "${id}"`);
      return k;
    };
    if (ch.op === "remove") out.splice(at(ch.ruleId), 1);
    else if (ch.op === "replace")
      out[at(ch.ruleId)] = {
        ...checkRule(ch.rule, valid, where),
        id: ch.ruleId,
      };
    else if (ch.op === "add")
      out.splice(ch.before ? at(ch.before) : out.length, 0, {
        ...checkRule(ch.rule, valid, where),
        id: ch.rule?.id ?? `added-${i + 1}`,
      });
    else throw new Error(`${where}: unknown op "${ch.op}"`);
  });
  return out;
}

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

// Nothing is met on an empty plan, every course rule can be met, and a course
// listed in two rules counts toward only one
function sanityCheck(code: string, rules: Rule[], label: string) {
  const picked = new Set<string>();
  const pick = (r: Rule): boolean | undefined => {
    if (r.kind === "chooseRules") r.rules?.forEach(pick);
    if (!["allOf", "atLeast", "minUnits"].includes(r.kind)) return undefined;
    let fresh = 0;
    for (const g of r.groups) {
      const c = g.find((x) => !picked.has(x));
      if (!c) continue;
      picked.add(c);
      if (r.kind === "minUnits" ? ++fresh * 10 >= r.n : ++fresh >= r.n) break;
    }
    return r.kind === "minUnits" ? fresh * 10 >= r.n : fresh >= r.n;
  };
  const expected = rules.map((r) =>
    r.kind === "placeholder" ? false : pick(r)
  );
  const empty = evaluate(code, []);
  const full = evaluate(code, [...picked]);
  const failed = rules
    .filter(
      (_, i) =>
        empty[i] || (expected[i] !== undefined && full[i] !== expected[i])
    )
    .map((r) => `"${r.name}" (${r.kind} ${r.n})`);

  // A course in two non-shared course rules may satisfy at most one of them
  const basic = rules
    .map((r, i) => ({ r, i }))
    .filter(({ r }) => ["allOf", "atLeast"].includes(r.kind) && !r.shared);
  const shared = allCodes(basic.map(({ r }) => r)).filter(
    (c) => basic.filter(({ r }) => r.groups.flat().includes(c)).length > 1
  );
  for (const c of shared.slice(0, 3)) {
    const met = evaluate(code, [c]);
    const counted = basic.filter(
      ({ r, i }) => met[i] && r.groups.flat().includes(c)
    );
    if (counted.length > 1) failed.push(`"${c}" counted twice`);
  }
  if (failed.length)
    throw new Error(`${label} failed the sanity check: ${failed.join(", ")}`);
}

async function catalogCourseCodes() {
  const codes = new Set<string>();
  for (let skip = 0; ; skip += 5000) {
    const { data, listLength } = await api(
      `/cm/${SCHOOL}/courses/search/%24filters?catalogId=${CATALOG_ID}&skip=${skip}&limit=5000&columns=subjectCode,courseNumber`,
      {}
    );
    for (const c of data) codes.add(`${c.subjectCode} ${c.courseNumber}`);
    if (!data.length || skip + data.length >= listLength) return codes;
  }
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
    selected.push({ id, name, kind, ...parseProgram(p) });
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

  // Name requirement-set placeholders after their sets, with the sets' narrative text
  const isSetPlaceholder = (r: Rule) =>
    r.kind === "placeholder" && !!r.text?.startsWith("set:");
  const reqSetIds = [
    ...new Set(
      selected.flatMap((p) =>
        p.rules
          .filter(isSetPlaceholder)
          .flatMap((r) => r.text!.split(" ").map((id) => id.slice(4)))
      )
    ),
  ];
  if (reqSetIds.length) {
    const res: any[] = await api(
      `/${SCHOOL}/requisite-sets/?list=${reqSetIds.join(",")}&effectiveDatesRange=`
    );
    const reqSets = new Map(res.map((s) => [s.requisiteSetGroupId, s]));
    for (const r of selected.flatMap((p) => p.rules.filter(isSetPlaceholder))) {
      const found = r
        .text!.split(" ")
        .map((id) => reqSets.get(id.slice(4)))
        .filter(Boolean);
      if (found.length) r.name = sanitize(found.map((s) => s.name).join(", "));
      r.text =
        found
          .map((s) => {
            const notes = (s.requisites ?? [])
              .filter((b: any) => b.type === "Narrative Text")
              .map((b: any) => stripHtml(b.notes))
              .join(" ");
            return notes ? `${s.name}: ${notes}` : s.name;
          })
          .join("\n") || undefined;
    }
  }

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

  // Only needed to validate overrides
  const overridePath = (id: string) =>
    new URL(`./catalog-overrides/${id}.json`, import.meta.url);
  const validCodes = selected.some((p) => existsSync(overridePath(p.id)))
    ? await catalogCourseCodes()
    : new Set<string>();

  const output: {
    name: string;
    major: string | null;
    minor: string | null;
    code: string;
  }[] = [];
  const catalogRules: object[] = [];
  for (const p of selected) {
    const label = `${p.name} (${p.kind})`;
    // Drop courses the catalog can't resolve; a rule left with nothing becomes a placeholder
    const unresolved = p.rules
      .flatMap((r) => r.groups.flat())
      .filter((id) => !codes[id]);
    if (unresolved.length)
      p.flags.push(`${unresolved.length} unresolved course IDs dropped`);
    let rules = p.rules.map((r) => {
      if (r.kind === "placeholder") return r;
      const groups = r.groups
        .map((g) =>
          withEquivalents(g.filter((id) => codes[id]).map((id) => codes[id]))
        )
        .filter((g) => g.length);
      if (!groups.length) {
        p.flags.push(`no resolvable courses in "${r.name}"`);
        return placeholder(r);
      }
      const n = r.kind === "allOf" ? groups.length : r.n;
      // A catalog rule asking for more courses than it lists can never be met
      if (r.kind === "atLeast" && n > groups.length) {
        p.flags.push(
          `unsatisfiable catalog rule "${r.name}" (${n} of ${groups.length})`
        );
        return placeholder(r);
      }
      return { ...r, n, groups };
    });
    catalogRules.push({
      programGroupId: p.id,
      name: p.name,
      kind: p.kind,
      flags: [...p.flags],
      rules,
    });

    if (existsSync(overridePath(p.id))) {
      const ov = JSON.parse(readFileSync(overridePath(p.id), "utf8"));
      rules = applyOverrides(rules, ov, validCodes, label);
      p.flags.push(`override applied (${ov.changes?.length ?? 0} changes)`);
    }
    const code = toBtLL(rules);
    sanityCheck(code, rules, label);

    output.push({
      name: `${p.name} ${p.kind === "major" ? "Major" : "Minor"} Requirements`,
      major: p.kind === "major" ? p.name : null,
      minor: p.kind === "minor" ? p.name : null,
      code,
    });
    const placeholders = rules.filter((r) => r.kind === "placeholder").length;
    console.log(
      `+ ${output.at(-1)!.name}: ${rules.length - placeholders} converted, ${placeholders} placeholders` +
        (p.flags.length ? ` [${p.flags.join("; ")}]` : "")
    );
  }

  writeFileSync(
    new URL("./catalog_rules.generated.json", import.meta.url),
    JSON.stringify(catalogRules, null, 2) + "\n"
  );
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
