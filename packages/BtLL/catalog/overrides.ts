import { existsSync, readFileSync } from "node:fs";

import { KINDS, Rule, sanitize, withEquivalents } from "./rules";

export function readOverride(programId: string) {
  const path = new URL(`./overrides/${programId}.json`, import.meta.url);
  if (!existsSync(path)) return undefined;
  return JSON.parse(readFileSync(path, "utf8"));
}

function checkRule(r: any, valid: Set<string>, where: string): Rule {
  const fail = (msg: string): never => {
    throw new Error(`${where}: ${msg}`);
  };
  if (!KINDS.includes(r?.kind)) fail(`unknown rule kind ${r?.kind}`);
  const name = sanitize(String(r.name ?? ""));
  if (!name) fail("rule needs a name");
  const base = { id: r.id, name };
  if (r.kind === "placeholder") return { ...base, kind: "placeholder" };
  const n = r.kind === "allOf" ? r.groups?.length : r.n;
  if (!Number.isInteger(n) || n < 1)
    fail(`"${name}": n must be a positive integer`);
  const shared = r.shared === true || undefined;

  if (r.kind === "chooseRules") {
    if (!Array.isArray(r.rules) || n > r.rules.length)
      fail(`"${name}": needs at least n sub-rules`);
    const rules = r.rules.map((s: any) => checkRule(s, valid, where));
    return { ...base, kind: "chooseRules", n, rules };
  }
  if (r.kind === "matching") {
    if (!r.fromProgram && !r.subjects?.length)
      fail(`"${name}": matching needs subjects or fromProgram`);
    const { fromProgram, subjects, upperDivision, units } = r;
    return {
      ...base,
      kind: "matching",
      n,
      subjects,
      upperDivision,
      fromProgram,
      units,
      // Program-wide totals ("12 courses overall") count courses other rules used
      shared: fromProgram === true || shared,
    };
  }

  const groupsOk =
    Array.isArray(r.groups) &&
    r.groups.length > 0 &&
    r.groups.every((g: any) => g?.length);
  if (!groupsOk)
    fail(`"${name}": groups must be non-empty lists of course codes`);
  for (const code of r.groups.flat())
    if (!valid.has(code)) fail(`"${name}": unknown course code "${code}"`);
  const groups = r.groups.map(withEquivalents);
  return { ...base, kind: r.kind, n, groups, shared };
}

export function applyOverrides(
  rules: Rule[],
  ov: any,
  valid: Set<string>,
  label: string
) {
  const out = [...rules];
  (ov.changes ?? []).forEach((ch: any, i: number) => {
    const where = `${label} override change ${i + 1}`;
    const hasUrl = /^https:\/\//.test(ch.why?.url ?? "");
    const hasQuote = String(ch.why?.quote ?? "").trim() !== "";
    if (!hasUrl || !hasQuote)
      throw new Error(`${where}: needs why.url (https) and a why.quote`);
    const at = (id: string) => {
      const k = out.findIndex((r) => r.id === id);
      if (k < 0) throw new Error(`${where}: unknown rule id "${id}"`);
      return k;
    };

    switch (ch.op) {
      case "remove":
        out.splice(at(ch.ruleId), 1);
        break;
      case "replace":
        out[at(ch.ruleId)] = {
          ...checkRule(ch.rule, valid, where),
          id: ch.ruleId,
        };
        break;
      case "add": {
        const rule = {
          ...checkRule(ch.rule, valid, where),
          id: ch.rule?.id ?? `added-${i + 1}`,
        };
        out.splice(ch.before ? at(ch.before) : out.length, 0, rule);
        break;
      }
      default:
        throw new Error(`${where}: unknown op "${ch.op}"`);
    }
  });
  return out;
}
