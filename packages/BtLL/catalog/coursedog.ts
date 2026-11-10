import { readFileSync } from "node:fs";

import {
  CourseRule,
  Placeholder,
  Program,
  Rule,
  groupsOf,
  isCourseRule,
  sanitize,
  unique,
  withEquivalents,
} from "./rules";

const API = "https://app.coursedog.com/api/v1";
const SCHOOL = "ucberkeley_peoplesoft";
export const CATALOG_ID = "hMSTjlpIK6VX5nnJn7ZE"; // 2026-27 undergraduate catalog

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

const KIND_OF: Record<string, CourseRule["kind"]> = {
  completedAllOf: "allOf",
  completedAtLeastXOf: "atLeast",
  completedAnyOf: "atLeast",
  minimumCredits: "minUnits",
};

// Flagged for review, converted literally
const OPTION_NAME = /option|track|concentration|either/i;

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

const searchPath = (resource: string, columns: string, skip = 0, limit = 500) =>
  `/cm/${SCHOOL}/${resource}/search/%24filters?catalogId=${CATALOG_ID}` +
  `&skip=${skip}&limit=${limit}&columns=${columns}`;

const stripHtml = (html?: string) =>
  (html ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

const placeholder = (r: Omit<Placeholder, "kind">): Placeholder => ({
  id: r.id,
  name: r.name,
  kind: "placeholder",
  description: r.description,
  text: r.text,
  sets: r.sets,
});

function requiredCount(r: any, kind: CourseRule["kind"]) {
  if (kind === "minUnits") return r.credits;
  if (r.condition === "completedAtLeastXOf") return r.restriction ?? 1;
  return 1; // allOf counts are set once course sets are expanded
}

function parseProgram(p: any): { rules: Rule[]; flags: string[] } {
  const rules: Rule[] = [];
  const flags = new Set<string>();
  for (const block of p.requisites?.requisitesSimple ?? []) {
    if (block.type === "Narrative Text") continue;
    for (const r of block.rules ?? []) {
      const name =
        sanitize(r.name ?? "") || sanitize(block.name ?? "") || "Requirement";
      const description = stripHtml(r.description) || undefined;
      const valueKind = r.value?.condition;
      const ids: string[][] = r.value?.values?.map((g: any) => g.value) ?? [];
      if (description) flags.add("rule descriptions");
      if (OPTION_NAME.test(r.name ?? "")) flags.add("option-style rules");

      if (r.condition === "freeformText") {
        flags.add("free text");
        rules.push(placeholder({ id: r.id, name, text: description }));
        continue;
      }
      if (valueKind === "requisiteSets") {
        const sets = ids
          .flat()
          .filter((id) => !SKIPPABLE_REQUISITE_SETS.has(id));
        if (!sets.length) continue;
        flags.add("major-specific requirement set");
        rules.push(placeholder({ id: r.id, name, description, sets }));
        continue;
      }
      const kind = KIND_OF[r.condition];
      if (!kind || !["courses", "courseSets"].includes(valueKind)) {
        flags.add(`unsupported rule (${r.condition}/${valueKind})`);
        rules.push(placeholder({ id: r.id, name, description }));
        continue;
      }

      if (valueKind === "courseSets") flags.add("course sets");
      if (r.condition === "completedAtLeastXOf" && r.restriction == null)
        flags.add(`missing count on "${name}", assumed 1`);
      const groups =
        valueKind === "courseSets"
          ? ids.flat().map((id) => [`set:${id}`])
          : ids;
      const n = requiredCount(r, kind);
      rules.push({ id: r.id, name, kind, n, groups, description });
    }
  }
  return { rules, flags: [...flags] };
}

async function loadPrograms(programIds: string[]): Promise<Program[]> {
  const degreePrograms = new URL(
    "../../../apps/frontend/src/components/MajorSearch/degree-programs-types.json",
    import.meta.url
  );
  const gradtrak = JSON.parse(readFileSync(degreePrograms, "utf8"));
  const columns = "catalogDisplayName,programGroupId,type,requisites";
  const { data } = await api(searchPath("programs", columns), {
    programGroupIds: programIds,
  });

  return programIds.map((id) => {
    const p = data.find((x: any) => x.programGroupId === id);
    if (!p) throw new Error(`Program ${id} not found in the catalog`);
    const kind = p.type === "Minor" ? "minor" : "major";
    const name = (p.catalogDisplayName ?? "").trim();
    if (!gradtrak[`${kind}s`].includes(name))
      throw new Error(
        `"${name}" (${kind}) doesn't match a GradTrak ${kind} name`
      );
    return { id, name, kind, ...parseProgram(p) };
  });
}

// Replaces each course set with its courses, one group per course
async function expandCourseSets(programs: Program[]) {
  const rules = programs.flatMap((p) => p.rules).filter(isCourseRule);
  const setIds = unique(rules.flatMap((r) => r.groups.flat()))
    .filter((id) => id.startsWith("set:"))
    .map((id) => id.slice(4));
  if (!setIds.length) return;

  const res = await api(
    `/cm/${SCHOOL}/courseSets?courseSetGroupIds=${setIds.join(",")}`
  );
  const sets: Record<string, string[]> = {};
  for (const s of Object.values<any>(res))
    sets[s.courseSetGroupId] =
      s.type === "dynamic" ? s.dynamicCourseList : s.courseList;
  for (const r of rules)
    r.groups = r.groups.flatMap((g) => {
      if (!g[0].startsWith("set:")) return [g];
      return (sets[g[0].slice(4)] ?? []).map((id) => [id]);
    });
}

const describeSet = (s: any) => {
  const notes = (s.requisites ?? [])
    .filter((b: any) => b.type === "Narrative Text")
    .map((b: any) => stripHtml(b.notes))
    .join(" ");
  return notes ? `${s.name}: ${notes}` : s.name;
};

// Names requirement-set placeholders after their sets, with the sets' text
async function nameRequisiteSets(programs: Program[]) {
  const placeholders = programs
    .flatMap((p) => p.rules)
    .filter((r): r is Placeholder => r.kind === "placeholder" && !!r.sets);
  if (!placeholders.length) return;

  const ids = unique(placeholders.flatMap((r) => r.sets!));
  const res: any[] = await api(
    `/${SCHOOL}/requisite-sets/?list=${ids.join(",")}&effectiveDatesRange=`
  );
  const byId = new Map(res.map((s) => [s.requisiteSetGroupId, s]));
  for (const r of placeholders) {
    const found = r.sets!.map((id) => byId.get(id)).filter(Boolean);
    if (found.length) r.name = sanitize(found.map((s) => s.name).join(", "));
    r.text = found.map(describeSet).join("\n") || undefined;
    delete r.sets;
  }
}

// Maps catalog course IDs to "SUBJECT NUMBER"
async function resolveCourseCodes(programs: Program[]) {
  const ids = unique(
    programs.flatMap((p) => p.rules.flatMap((r) => groupsOf(r).flat()))
  );
  const columns =
    "subjectCode,courseNumber,courseGroupId,deprecatedCourseGroupId";
  const codes: Record<string, string> = {};
  for (let i = 0; i < ids.length; i += 200) {
    const { data } = await api(searchPath("courses", columns), {
      courseGroupIds: ids.slice(i, i + 200),
    });
    // Some rules still reference courses by their old (deprecated) ID
    for (const c of data)
      for (const id of [c.courseGroupId, c.deprecatedCourseGroupId])
        if (id) codes[id] = `${c.subjectCode} ${c.courseNumber}`;
  }
  return codes;
}

// Drops courses the catalog can't resolve. A rule left with nothing, or asking
// for more courses than it lists, becomes a placeholder
function resolveRules(p: Program, codes: Record<string, string>) {
  const unresolved = p.rules
    .flatMap((r) => groupsOf(r).flat())
    .filter((id) => !codes[id]);
  if (unresolved.length)
    p.flags.push(`${unresolved.length} unresolved course IDs dropped`);

  const toCodes = (group: string[]) =>
    withEquivalents(group.filter((id) => codes[id]).map((id) => codes[id]));

  return p.rules.map((r): Rule => {
    if (!isCourseRule(r)) return r;
    const groups = r.groups.map(toCodes).filter((g) => g.length);
    if (!groups.length) {
      p.flags.push(`no resolvable courses in "${r.name}"`);
      return placeholder(r);
    }
    const n = r.kind === "allOf" ? groups.length : r.n;
    if (r.kind === "atLeast" && n > groups.length) {
      p.flags.push(
        `unsatisfiable catalog rule "${r.name}" (${n} of ${groups.length})`
      );
      return placeholder(r);
    }
    return { ...r, n, groups };
  });
}

export async function fetchPrograms(programIds: string[]) {
  const programs = await loadPrograms(programIds);
  await expandCourseSets(programs);
  await nameRequisiteSets(programs);
  const codes = await resolveCourseCodes(programs);
  for (const p of programs) p.rules = resolveRules(p, codes);
  return programs;
}

export async function catalogCourseCodes() {
  const codes = new Set<string>();
  for (let skip = 0; ; skip += 5000) {
    const path = searchPath("courses", "subjectCode,courseNumber", skip, 5000);
    const { data, listLength } = await api(path, {});
    for (const c of data) codes.add(`${c.subjectCode} ${c.courseNumber}`);
    if (!data.length || skip + data.length >= listLength) return codes;
  }
}
