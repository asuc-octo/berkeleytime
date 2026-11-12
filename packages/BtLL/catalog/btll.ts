import { init } from "../src/index";
import {
  CourseRule,
  MatchingRule,
  Rule,
  allCodes,
  groupsOf,
  isCourseRule,
} from "./rules";

const courseLiteral = (code: string) => {
  const [subject, ...number] = code.split(" ");
  return `{"${subject}", "${number.join(" ")}"}`;
};

const codeList = (codes: string[]) => codes.map(courseLiteral).join(", ");

const filterWhere = (from: string, condition: string) =>
  `filter(${from}, (c) { boolean return ${condition} })`;

const filterIn = (from: string, codes: string) =>
  filterWhere(from, `one_common_course([c], [${codes}])`);

// Each rule only sees courses earlier rules didn't use (p0, p1, ...), so a
// course counts toward at most one rule
export function toBtLL(rules: Rule[]) {
  const lines = [
    "Function<List<Requirement>>() main (){",
    '  List<Course> courses get_attr(this, "allCourses")',
    "  List<Course> p0 courses",
  ];
  const line = (s: string) => lines.push(`  ${s}`);
  const programCodes = codeList(allCodes(rules));
  let programListed = false;
  let pool = 0;

  // Defines `${v}_m`, the courses the rule matches. Returns the count
  // expression when it isn't just the number of matches
  const emitMatches = (
    rule: CourseRule | MatchingRule,
    v: string,
    from: string
  ) => {
    if (rule.kind === "minUnits") {
      line(`List<Course> ${v}_m ${filterIn(from, codeList(allCodes([rule])))}`);
      return undefined;
    }
    if (rule.kind === "matching") {
      if (rule.fromProgram && !programListed) {
        line(`List<Course> program [${programCodes}]`);
        programListed = true;
      }
      const subjects = rule.subjects?.map((s) => `"${s}"`).join(", ");
      const conditions = [
        rule.fromProgram && "one_common_course([c], program)",
        subjects && `contains([${subjects}], get_attr(c, "subject"))`,
        rule.upperDivision &&
          `regex_match(get_attr(c, "number"), "^[A-Z]*1[0-9][0-9]")`,
      ].filter(Boolean);
      const matchesAll = `and([${conditions.join(", ")}])`;
      line(`List<Course> ${v}_m ${filterWhere(from, matchesAll)}`);
      return undefined;
    }

    // A group with alternatives (MATH 104 / H104) fills one slot. Single-course
    // groups are matched together, since a variable per group is slow
    const parts: string[] = [];
    const singles = rule.groups.filter((g) => g.length === 1).flat();
    if (singles.length) {
      line(`List<Course> ${v}_s ${filterIn(from, codeList(singles))}`);
      parts.push(`${v}_s`);
    }
    const multi = rule.groups.filter((g) => g.length > 1);
    multi.forEach((group, j) => {
      const firstMatch = `slice(${filterIn(from, codeList(group))}, 0, 1)`;
      line(`List<Course> ${v}_f${j} ${firstMatch}`);
      parts.push(`${v}_f${j}`);
    });
    if (parts.length === 1) {
      line(`List<Course> ${v}_m ${parts[0]}`);
    } else {
      const inAnyPart = parts.map((x) => `one_common_course([c], ${x})`);
      const matchesAny = `or([${inAnyPart.join(", ")}])`;
      line(`List<Course> ${v}_m ${filterWhere(from, matchesAny)}`);
    }
    const lengths = parts.map((x) => `length(${x})`);
    return `add([${lengths.join(", ")}])`;
  };

  const emit = (rule: Rule, v: string) => {
    const name = rule.name;
    if (rule.kind === "placeholder") {
      line(
        `BooleanRequirement ${v} {false, "${name} - manual check, see catalog"}`
      );
      return;
    }
    if (rule.kind === "chooseRules") {
      const subs = rule.rules.map((sub, k) => {
        emit(sub, `${v}_s${k}`);
        return `${v}_s${k}`;
      });
      const list = `[${subs.join(", ")}]`;
      if (rule.n === 1) {
        line(`OrRequirement ${v} {${list}, "${name}"}`);
      } else if (rule.n >= subs.length) {
        line(`AndRequirement ${v} {${list}, "${name}"}`);
      } else {
        line(`OrRequirement ${v} {${list}, ${rule.n}, "${name}"}`);
      }
      return;
    }

    const byUnits =
      rule.kind === "minUnits" || (rule.kind === "matching" && rule.units);
    const count = emitMatches(rule, v, rule.shared ? "courses" : `p${pool}`);
    // Only the courses a rule uses are shown, so extras show up under later rules
    let shown = `${v}_m`;
    if (!rule.shared) {
      shown = `${v}_used`;
      const take = byUnits
        ? `take_until_units(${v}_m, ${rule.n})`
        : `slice(${v}_m, 0, ${rule.n})`;
      line(`List<Course> ${shown} ${take}`);
    }
    if (byUnits) {
      line(
        `NumberRequirement ${v} {${shown}, sum_units(${shown}), ${rule.n}, "${name}"}`
      );
    } else {
      const counted = count ?? `length(${shown})`;
      line(
        `NCoursesRequirement ${v} {${shown}, ${counted}, ${rule.n}, "${name}"}`
      );
    }
    if (rule.shared) return;
    const unused = `not(one_common_course([c], ${shown}))`;
    line(`List<Course> p${pool + 1} ${filterWhere(`p${pool}`, unused)}`);
    pool++;
  };

  const names = rules.map((_, i) => `r${i}`);
  rules.forEach((rule, i) => emit(rule, names[i]));
  line(`List<Requirement> return [${names.join(", ")}]`);
  lines.push("}");
  return lines.join("\n");
}

const describe = (r: Rule) => ("n" in r ? `${r.kind} ${r.n}` : r.kind);

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
export function sanityCheck(code: string, rules: Rule[], label: string) {
  const picked = new Set<string>();
  const pick = (r: Rule): boolean | undefined => {
    if (r.kind === "chooseRules") r.rules.forEach(pick);
    if (!isCourseRule(r)) return undefined;
    const enough = (count: number) =>
      r.kind === "minUnits" ? count * 10 >= r.n : count >= r.n;
    let fresh = 0;
    for (const g of r.groups) {
      const c = g.find((x) => !picked.has(x));
      if (!c) continue;
      picked.add(c);
      if (enough(++fresh)) break;
    }
    return enough(fresh);
  };
  const expected = rules.map((r) =>
    r.kind === "placeholder" ? false : pick(r)
  );
  const empty = evaluate(code, []);
  const full = evaluate(code, [...picked]);
  const wrong = (i: number) =>
    empty[i] || (expected[i] !== undefined && full[i] !== expected[i]);
  const failed = rules
    .filter((_, i) => wrong(i))
    .map((r) => `"${r.name}" (${describe(r)})`);

  const courseRules = rules
    .map((r, i) => ({ r, i }))
    .filter(
      ({ r }) => (r.kind === "allOf" || r.kind === "atLeast") && !r.shared
    );
  const lists = (r: Rule, c: string) => groupsOf(r).flat().includes(c);
  const inTwoRules = allCodes(courseRules.map(({ r }) => r)).filter(
    (c) => courseRules.filter(({ r }) => lists(r, c)).length > 1
  );
  for (const c of inTwoRules.slice(0, 3)) {
    const met = evaluate(code, [c]);
    const counted = courseRules.filter(({ r, i }) => met[i] && lists(r, c));
    if (counted.length > 1) failed.push(`"${c}" counted twice`);
  }
  if (failed.length)
    throw new Error(`${label} failed the sanity check: ${failed.join(", ")}`);
}
