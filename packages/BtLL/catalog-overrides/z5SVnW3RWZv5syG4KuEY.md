# Ecosystem Management and Forestry (major): z5SVnW3RWZv5syG4KuEY

## Pages visited
- https://nature.berkeley.edu/advising/majors/ecosystem-management-and-forestry: Rausser College advising page for the major. It gives only a summary and links to the "EMF Major Snapshot".
- https://nature.berkeley.edu/advising/majors/forestry-and-natural-resources: the same content under an older URL.
- https://docs.google.com/document/d/1aNxj2Uv7cz-tLQEhMsksQAt8quloODPyh86MWKL9XBA/edit: the **EMF Major Snapshot**, the department's requirement sheet linked from the advising page. Read via `/export?format=txt`. All quotes come from here.
- Coursedog catalog API (`https://app.coursedog.com/api/v1/cm/ucberkeley_peoplesoft/courses/search/$filters?catalogId=hMSTjlpIK6VX5nnJn7ZE`, POST with `Origin: https://undergraduate.catalog.berkeley.edu`): used to check that every code exists and to look up the titles of ambiguous codes (ESPM 10 vs C10, GEOG 1 vs N1, ESPM C130 vs 130A, ESPM 162A vs C162A, ENVSCI 188 = "Calif Ecology & Conservation", ESPM 188 = "Case Histories in Wildlife Management").

## Checklist
1. **Totals:** The snapshot gives only college-level totals (120 units, 36 upper-division units, 15 in Rausser College). Those belong to the college requirement and aren't encoded. The major has no overall course count.
2. **Double counting:** The snapshot says explicitly that ESPM 173, GEOG 180, GEOG 185, GEOG C188, ESPM C110A and ESPM 60 count toward only one requirement. That matches the default, except in the Forestry and NRM Choice A paths (see the workaround below).
3. **Electives:** These are fixed lists. Forestry: two from a list of about 20 courses. NRM: four category lists.
4. **Caps:** nothing found.
5. **Missing blocks:** The whole major was free text. It is now 10 structured lower-division/core rules plus a specialization rule.
6. **Either/or paths:** The catalog had two specialization placeholders that looked like both were required. They are now a choice of one (Forestry, or NRM with Choice A or B). Chemistry, calculus and statistics are options too.
7. **Placeholders:** All three were converted. None remain.
8. **Contradictions:** The department adds PBHLTH 142 (statistics), GEOG 180 (physical science), GEOG 185 and C188 (GIS), ESPM C110A, C130 and GEOG C183 (Forestry electives), and ESPM 115B, C130, 139A and C162A (NRM). It lists ESPM 10, GEOG N1 and C162A where the catalog lists C10, 1 and 162A; both versions are accepted. ESPM 162 moved from Management (catalog) to Value & Policy (department). ESPM 115B and 139A are only in the department's lists. The catalog's STAT 21, ESPM 130A and ESPM 190 are kept because they aren't excluded explicitly.

## Changes
- Replace the shared-requirements placeholder with **Chemistry** (1A+1AL or 3A+3AL).
- Add **Biology** (BIOLOGY 1B).
- Add **Calculus** (16A/B, 51/52 or 10A/B).
- Add **Statistics** (STAT 20/21, ESPM 173 or PBHLTH 142; or DATA C8 + C88S; or exempt via MATH 10A/B, which is re-read as shared).
- Add **Economics** (ENVECON C1, ECON 1, ECON 2).
- Add **Physical Science** (GEOG 40, EPS 50, GEOG 1/N1, GEOG 180).
- Add **GIS** (ESPM 72, GEOG 80, GEOG 185, GEOG C188).
- Add **ESPM Environmental Science Core** (2, 6, 10/C10, 15, C46).
- Add **ESPM Social Science Core** (C11, C22AC, 50AC, C52, 60).
- Add **Upper Division Core** (102C, 183, and 137 or C153).
- Replace the Forestry placeholder with a **Specialization** rule (choose one of two):
  - Forestry: 105A-D; 102B+102BL or C110A; 108A, 134, 182, 185; 102D or 60; two electives.
  - NRM, Choice A: one field experience (105A-D, C107 or ENVSCI 188) plus 3 electives from the NRM lists.
  - NRM, Choice B: one course from each of the 4 categories plus 2 more.
- Remove the NRM placeholder, which is merged into Specialization.

## Not encoded / open questions
- **Evaluator workaround:** GradTrak counts courses greedily and in order across all sub-rules, including options the student isn't pursuing. If both tracks consumed courses, Forestry's rules would take the 134/185/108A/102D etc. that an NRM student needs, and the reverse. To prevent that, the Forestry and NRM Choice A leaf rules are `shared`, and only NRM Choice B consumes courses. The consequence is that within Forestry and Choice A, the department's no-double-count notes aren't enforced. For example, ESPM 60 could count for both Social Science and Forestry policy, ESPM C110A for both sampling and an elective, and ESPM 173 or GEOG 180/185/C188 for both a lower-division requirement and an elective. A reviewer may prefer another structure if the evaluator gains per-option pools.
- Greedy order: a lower-division rule may use a course the student meant for an elective, e.g. ESPM 173 for statistics when they also took STAT 20. That depends on the order of the plan.
- NRM "with NRM faculty approval" and Choice A electives "approved by NRM affiliated Faculty": approval can't be checked.
- Grades and GPA can't be checked: no grade below C- in major requirements, a 2.0 GPA in upper-division major requirements, and a 2.0 cumulative GPA.
- The 120 / 36 upper-division / 15 Rausser upper-division unit totals are college requirements, handled elsewhere.
- Open: STAT 21, ESPM 130A and ESPM 190 are kept from the catalog but missing from the department sheet. Choice B's last two courses and Choice A's three electives are assumed to come from the category lists. ESPM 102B and 102BL each count as an elective in the "additional" lists. See `notStated`.
