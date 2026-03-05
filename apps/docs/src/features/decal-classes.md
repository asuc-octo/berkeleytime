## DeCal Classes

Berkeleytime has first‑class support for DeCal classes. This feature enriches the standard SIS data with details from the DeCal board so students can see accurate DeCal titles, descriptions, application links, deadlines, and contact information directly in the class catalog and class view.

### High‑level flow

1. The `decals` datapuller scrapes the DeCal board API and normalizes each listing into a structured `DeCalCourse`.
2. For each DeCal course, we try to match it to an existing `ClassModel` in Mongo using a set of heuristics (title similarity, meeting times, room, and faculty sponsor).
3. When we find a confident match, we write a `decal` sub‑object onto that `ClassModel`.
4. Backend GraphQL resolvers expose this data via the `Class.decal` field.
5. The frontend reads `Class.decal` and:
   - shows a “DeCal” badge in the catalog,
   - uses the DeCal title on catalog cards and the class overview header,
   - and surfaces application, syllabus, deadline, and contact information in the overview tab.

### Scraping and normalization

The DeCal puller lives in `apps/datapuller/src/pullers/decals.ts`. It talks directly to the DeCal board’s JSON APIs (for example, the approved‑courses endpoint) instead of scraping HTML, then normalizes responses into an internal `DeCalCourse` shape:

- core metadata: `title`, `semester`, `department`, `category`, `units`
- sections: day/time, room, capacity, and section type
- descriptive content: `description`, `enrollmentInformation`, `websiteUrl`, `syllabusUrl`
- application metadata: `applicationUrl`, `applicationDueDate`
- facilitators: `{ name, email }`

For development and debugging, the puller can persist the raw DeCal payloads into `apps/datapuller/data/decals.json`. When the `DEBUG` flag in the puller is enabled, subsequent runs will re‑use this local file instead of repeatedly calling the remote APIs. This makes it much easier to refine matching heuristics offline.

### Matching DeCals to SIS classes

The DeCal board does not expose Berkeleytime class identifiers, so we have to infer the correct `ClassModel` for each DeCal. The puller uses a multi‑step scoring heuristic:

- **Term bucketing**  
  DeCals are grouped by semester key (for example, `"Spring 2026"`). For each group we only consider classes from the matching Berkeleytime term, which keeps the candidate set small and avoids cross‑term matches.

- **Department narrowing**  
  If the DeCal has a department, we first search only within classes from that department. If no reasonable candidate appears, we fall back to searching across all departments for that term.

- **Title similarity (fuzzy search)**  
  We build a `FuzzySearch` index of candidate classes using course and class titles. For each DeCal title we:
  - compute a fuzzy similarity score against each candidate,
  - discard clearly unrelated classes below a minimum score,
  - and keep only the top‑scoring subset for more expensive checks.

- **Meeting‑time and room heuristics**  
  From the DeCal sections we derive normalized “day + time” strings and room identifiers, handling different display formats. For each candidate class:
  - we normalize its primary‑section meetings into the same representation,
  - award positive score if any meeting time appears in the DeCal’s time set,
  - and add extra score if the room or location text matches (for example, same building and room number).

- **Faculty / sponsor similarity**  
  When a DeCal lists a faculty sponsor, we normalize the sponsor name and compare it to instructor names on each candidate class. If the sponsor appears to teach the candidate, we increase that candidate’s score.

- **Composite score and decision**  
  Each candidate gets a composite score that combines:
  - title similarity,
  - meeting‑time overlap,
  - room overlap,
  - and faculty‑name similarity.

  The puller selects the single best candidate whose score exceeds a threshold. If there is a tie or no strong candidate, we log the DeCal and skip it rather than guessing.

### Persisting DeCal metadata

Once a DeCal is matched to a `ClassModel`, we populate the `decal` field on that document:

- `title`: DeCal‑specific course title
- `description`: extended DeCal description
- `syllabusUrl`: URL to the DeCal syllabus
- `applicationUrl`: URL for the application form or course site
- `applicationDueDate`: application deadline as a string
- `instructors`: array of `{ name, email }` derived from facilitators

This data flows through the stack as follows:

- Backend formatters expose `Class.decal` via the GraphQL schema (`packages/gql-typedefs/class.ts`).
- The canonical catalog query (`packages/shared/queries.ts`) includes `decal { title }` so catalog cards can show a “DeCal” badge and DeCal title.
- The class details queries (`apps/frontend/src/lib/api/classes.ts`) fetch `decal` so the class overview can:
  - show a dedicated “DeCal Application” section (application link, syllabus link, and formatted deadline),
  - prefer the DeCal description over SIS description when present,
  - hide SIS “Class Notes” for DeCal classes,
  - and render contact information as `Name: email` pairs.

Overall, the DeCal feature lets Berkeleytime present rich, up‑to‑date information for student‑run courses without requiring any manual data entry in our database.

