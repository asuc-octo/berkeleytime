# Refining a catalog-generated degree program

You are refining one degree program that `packages/BtLL/import-catalog.ts` generated from the Berkeley catalog (Coursedog). The catalog data is often incomplete or wrong. Your job: compare the program with the department's own requirements page and **write an override** that corrects it, justifying every change with the page's URL and a verbatim quote. A human reviews your output afterward.

The prompt gives you a `programGroupId`. Work from the repository root.

## Inputs
- `packages/BtLL/catalog_rules.generated.json`: find the entry whose `programGroupId` matches. It has the program's `name`, `kind` (major/minor), `flags` (known catalog problems) and `rules`. Each rule has a stable `id`, a `name`, a `kind`, a count `n`, and `groups` of course codes. A group is a list of alternatives, any one of which satisfies it. Placeholders carry the catalog's free text in `text`; other rules may have a catalog `description`.
- `packages/BtLL/catalog-overrides/<programGroupId>.json` and `.md`, if they exist: a previous refinement. Revise it rather than starting over.

How rules are evaluated: rules are checked in order, and **each course counts toward at most one rule** (the first rule that uses it), unless a rule is `shared`. Requirement sets that every student has (university, campus and college requirements) are handled elsewhere; ignore them.

## 1. Find the department's requirements page
- Use WebSearch, e.g. `"<program name> <major|minor> requirements" UC Berkeley`.
- Prefer the department's own site (a `*.berkeley.edu` department domain) over the catalog, third-party sites or old PDFs.
- Follow links within that site (requirements, FAQ, "declaring", course lists) with WebFetch. Answers are often a level or two deep. Visit at most about 10 pages.
- If you can't find a department page, write only the `.md` log saying so, and make no override.

## 2. Check, in this order
1. **Totals:** an overall number of courses or units, and upper-division minimums (e.g. "12 courses, 7 upper division").
2. **Double counting:** can one course satisfy two requirements? The default (each course counts once) is usually right.
3. **Electives:** how broad they really are (e.g. "any upper-division course in the department" vs. the catalog's fixed list).
4. **Caps:** limits on courses from outside the department, transfer courses, etc. Only encode them if a rule kind below can express them; otherwise note them in the log.
5. **Missing blocks:** requirements the department lists that the catalog rules lack entirely (e.g. lower division).
6. **Either/or paths:** options, tracks, "choose N areas". The catalog often lists every option as a separate required rule.
7. **Placeholders:** read their `text` and convert them into real rules when the meaning is clear.
8. **Contradictions:** any count or course list that differs from the department page.

**Check claims with code, not by eye.** Use small `node -e` scripts that read the JSON file, e.g. to find courses that appear in two rules, or to count lower- vs upper-division courses in a list (upper division means numbered 100–199, ignoring letter prefixes like `C`, `W`, `H`). Don't use them to write files.

## 3. Rules for changes
- **Every change needs `why.url` (https) and `why.quote`: verbatim text from that page that supports it.** The generator rejects changes without both. The quote must be one contiguous passage copied exactly; don't stitch passages together with "...". If a change rests on several passages, quote the most important one and mention the others in `reasoning`.
- **No changes from inference alone.** If the page doesn't answer a question, don't guess: list it under `notStated`.
- Keep the catalog's course lists unless the department page explicitly says otherwise. Use current course numbers (`MATH 51`, not `MATH 1A`); old numbers are added automatically.
- Course codes are `"SUBJECT NUMBER"` using catalog subject codes (`MATH 104`, `COMPSCI 61A`, `ENGLISH C177`). The generator rejects codes that aren't in the catalog.
- Grades, GPA, letter-grade and residency rules can't be checked by GradTrak. Mention them in the log only.
- When the department page and the catalog disagree, decide which is right and explain why in `reasoning`.
- Only edit `packages/BtLL/catalog-overrides/<programGroupId>.json` and `.md`. Never edit code or generated files.

## Rule kinds you can write
- `{ "kind": "allOf", "name", "groups": [[...], ...] }`: every group (its count is implied).
- `{ "kind": "atLeast", "name", "n", "groups" }`: at least n groups.
- `{ "kind": "minUnits", "name", "n", "groups" }`: at least n units from courses in the groups.
- `{ "kind": "chooseRules", "name", "n", "rules": [Rule, ...] }`: at least n of the sub-rules (options, tracks, "choose 2 areas").
- `{ "kind": "matching", "name", "n", "subjects"?: ["MATH"], "upperDivision"?: true, "fromProgram"?: true, "units"?: true }`: at least n courses (or n units, with `units`) whose subject is in `subjects` and/or that are upper division. With `fromProgram`, it counts only courses listed anywhere in this program. That's how to express totals such as "12 courses in the major, 7 upper division". `fromProgram` rules look at all courses (shared); other `matching` rules only use courses no earlier rule counted (e.g. "one additional upper-division MATH course").
- `{ "kind": "placeholder", "name" }`: an unmet manual checkbox, for anything you can't express.
- Any rule may set `"shared": true` if the department says its courses may also count elsewhere.

## Output
**`packages/BtLL/catalog-overrides/<programGroupId>.json`**:
```json
{
  "programGroupId": "25I071U",
  "changes": [
    { "op": "add", "before": "<rule id or null to append>", "rule": { ... }, "why": { "url": "https://...", "quote": "...", "reasoning": "..." } },
    { "op": "replace", "ruleId": "<rule id>", "rule": { ... }, "why": { ... } },
    { "op": "remove", "ruleId": "<rule id>", "why": { ... } }
  ],
  "notStated": ["questions the department pages don't answer"]
}
```
Changes apply in order; `ruleId`/`before` refer to ids in `catalog_rules.generated.json` (a replaced rule keeps its id). Rules are checked in list order, so put specific rules before broad ones such as electives and totals.

**`packages/BtLL/catalog-overrides/<programGroupId>.md`**, a short human log:
- **Pages visited:** each URL, one line each, **including any catalog or API queries** used to build course lists (e.g. how you found "every 4-unit ENGLISH course"), so a reviewer can reproduce them.
- **Checklist:** the result for each of the 8 items (a sentence each, or "nothing found").
- **Changes:** a one-line summary per change.
- **Not encoded / open questions:** anything GradTrak can't check, and anything unanswered.

## Finish
Run `npm run import:catalog -w @repo/BtLL`. If it reports an error about your override, fix the override and run it again until it succeeds. Then stop, and reply with a one-paragraph summary.
