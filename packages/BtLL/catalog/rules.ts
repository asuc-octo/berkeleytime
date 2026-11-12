interface RuleBase {
  id?: string;
  name: string;
  description?: string;
}

// n groups (or units, for minUnits); each group is a set of alternatives
export interface CourseRule extends RuleBase {
  kind: "allOf" | "atLeast" | "minUnits";
  n: number;
  groups: string[][];
  shared?: boolean; // may reuse courses other rules counted
}

export interface ChooseRule extends RuleBase {
  kind: "chooseRules";
  n: number;
  rules: Rule[];
}

export interface MatchingRule extends RuleBase {
  kind: "matching";
  n: number;
  subjects?: string[];
  upperDivision?: boolean;
  fromProgram?: boolean; // only courses listed in this program
  units?: boolean; // n is units, not courses
  shared?: boolean;
}

export interface Placeholder extends RuleBase {
  kind: "placeholder";
  text?: string;
  sets?: string[]; // requisite sets it refers to, until they're named
}

export type Rule = CourseRule | ChooseRule | MatchingRule | Placeholder;

export interface Program {
  id: string;
  name: string;
  kind: "major" | "minor";
  rules: Rule[];
  flags: string[];
}

export const KINDS: Rule["kind"][] = [
  "allOf",
  "atLeast",
  "minUnits",
  "placeholder",
  "chooseRules",
  "matching",
];

// Renumbered courses: plans from before the change still use the old number
const EQUIVALENT_COURSES: Record<string, string[]> = {
  "MATH 51": ["MATH 1A"],
  "MATH 52": ["MATH 1B"],
};

export const unique = <T>(items: T[]) => [...new Set(items)];

export const isCourseRule = (r: Rule): r is CourseRule => "groups" in r;

export const groupsOf = (r: Rule) => (isCourseRule(r) ? r.groups : []);

export const allCodes = (rules: Rule[]): string[] =>
  unique(
    rules.flatMap((r) =>
      r.kind === "chooseRules" ? allCodes(r.rules) : groupsOf(r).flat()
    )
  );

export const withEquivalents = (group: string[]) =>
  unique(group.flatMap((c) => [c, ...(EQUIVALENT_COURSES[c] ?? [])]));

// Drop characters that confuse the BtLL line parser (brackets, quotes)
export const sanitize = (s: string) =>
  s
    .replace(/[()[\]{}<>"'`\\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
