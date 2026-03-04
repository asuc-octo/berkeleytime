import * as fs from "node:fs";
import * as path from "node:path";

import { FuzzySearch } from "@repo/common";
import {
  ClassModel,
  CourseModel,
  SectionModel,
  TermModel,
} from "@repo/common/models";

import { Config } from "../shared/config";

const BASE_URL = "https://berkeleydecal.com";
const LIST_URL = `${BASE_URL}/`;
const APPROVED_COURSES_API = `${BASE_URL}/api/approvedCourses`;

// When true, skip remote fetches and just read existing decals.json
const DEBUG = false;

export interface DeCalSection {
  type?: string;
  dayTime?: string;
  room?: string;
  enrollment?: string;
  time?: string;
  location?: string;
}

export interface DeCalFacilitator {
  name: string;
  email: string;
}

export interface DeCalCourse {
  category?: string;
  title: string;
  semester?: string;
  department?: string;
  units?: number;
  sections: DeCalSection[];
  detailsUrl?: string;
  applicationUrl?: string;
  applicationDueDate?: string;
  syllabusUrl?: string;
  facilitators: DeCalFacilitator[];
  description?: string;
  contactEmail?: string;
  facultySponsorName?: string;
  enrollmentInformation?: string;
  websiteUrl?: string;
}

interface ApprovedCoursesApiResponse {
  success: boolean;
  courses: Array<{
    id: string;
    semester?: string;
    title: string;
    department?: string;
    category?: string;
    units?: number;
    description?: string | null;
    contact_email?: string | null;
    faculty_sponsor_name?: string | null;
    website?: string | null;
    enrollment_information?: string | null;
    application_url?: string | null;
    application_due_date?: string | null;
    syllabus_url?: string | null;
    detailsUrl?: string | null;
    sections?: Array<{
      id: string;
      enrollment_status?: string | null;
      day?: string | null;
      time?: string | null;
      room?: string | null;
      notes?: string | null;
      section_type?: string | null;
      capacity?: number | null;
    }>;
    facilitators?: Array<{
      id: string;
      name: string;
      email: string;
    }>;
  }>;
}

interface CourseDetailApiResponse {
  success: boolean;
  course: {
    id: string;
    semester?: string;
    title: string;
    department?: string;
    category?: string;
    units?: number;
    description?: string | null;
    contact_email?: string | null;
    faculty_sponsor_name?: string | null;
    website?: string | null;
    enrollment_information?: string | null;
    application_url?: string | null;
    application_due_date?: string | null;
    syllabus_url?: string | null;
    sections?: Array<{
      id: string;
      enrollment_status?: string | null;
      day?: string | null;
      time?: string | null;
      room?: string | null;
      notes?: string | null;
      section_type?: string | null;
      capacity?: number | null;
    }>;
    facilitators?: Array<{
      id: string;
      name: string;
      email: string;
    }>;
  };
}

async function fetchApprovedCourses(): Promise<ApprovedCoursesApiResponse> {
  const response = await fetch(APPROVED_COURSES_API, {
    headers: {
      "User-Agent":
        "Berkeleytime-Datapuller/1.0 (https://berkeleytime.berkeley.edu)",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} fetching ${APPROVED_COURSES_API}`);
  }

  const data = (await response.json()) as ApprovedCoursesApiResponse;
  if (!data.success || !Array.isArray(data.courses)) {
    throw new Error("Unexpected approvedCourses API response shape");
  }

  return data;
}

function extractCourseIdFromDetailsUrl(
  detailsUrl?: string
): string | undefined {
  if (!detailsUrl) return undefined;
  try {
    const url = new URL(detailsUrl, BASE_URL);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1];
  } catch {
    return undefined;
  }
}

async function fetchCourseDetail(
  id: string
): Promise<CourseDetailApiResponse["course"]> {
  const detailUrl = `${BASE_URL}/api/courses/${id}`;
  const response = await fetch(detailUrl, {
    headers: {
      "User-Agent":
        "Berkeleytime-Datapuller/1.0 (https://berkeleytime.berkeley.edu)",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} fetching ${detailUrl}`);
  }

  const data = (await response.json()) as CourseDetailApiResponse;
  if (!data.success || !data.course) {
    throw new Error("Unexpected course detail API response shape");
  }

  return data.course;
}

const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const normalizeString = (value: string | undefined | null): string =>
  (value ?? "").toLowerCase().replace(/\s+/g, "").trim();

/** Levenshtein (edit) distance between two strings. */
const levenshteinDistance = (a: string, b: string): number => {
  const lenA = a.length;
  const lenB = b.length;
  const dp: number[][] = Array.from({ length: lenA + 1 }, () =>
    new Array<number>(lenB + 1).fill(0)
  );
  for (let i = 0; i <= lenA; i++) dp[i][0] = i;
  for (let j = 0; j <= lenB; j++) dp[0][j] = j;
  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[lenA][lenB];
};

const departmentsMatch = (
  subjectName?: string | null,
  department?: string | null
): boolean => {
  if (!subjectName || !department) return true;
  const a = normalizeString(subjectName);
  const b = normalizeString(department);
  const c = normalizeString(department.replace("and", "&"));
  if (!a || (!b && !c)) return true;
  return (
    a === b ||
    a.includes(b) ||
    b.includes(a) ||
    a === c ||
    a.includes(c) ||
    c.includes(a)
  );
};

const formatMeetingDayTime = (meeting: {
  days?: boolean[];
  startTime?: string;
  endTime?: string;
}): string | undefined => {
  if (!meeting.days || !meeting.days.length) return undefined;
  const dayIndex = meeting.days.findIndex((d) => d);
  if (dayIndex === -1) return undefined;
  if (!meeting.startTime || !meeting.endTime) return undefined;
  const dayName = DAY_NAMES[dayIndex] ?? "";
  if (!dayName) return undefined;

  const addOneMinute = (time: string): string => {
    const [hStr, mStr] = time.split(":");
    let hour = Number(hStr);
    let minutes = Number(mStr ?? "0");
    if (Number.isNaN(hour) || Number.isNaN(minutes)) return time;

    minutes += 1;
    if (minutes >= 60) {
      minutes -= 60;
      hour = (hour + 1) % 24;
    }

    const h = String(hour).padStart(2, "0");
    const m = String(minutes).padStart(2, "0");
    return `${h}:${m}`;
  };

  const formatTime = (time: string): string => {
    const [hStr, mStr] = time.split(":");
    const hour24 = Number(hStr);
    const minutes = (mStr ?? "00").padStart(2, "0");
    if (Number.isNaN(hour24)) return time;

    const period = hour24 >= 12 ? "PM" : "AM";
    const hour12 = ((hour24 + 11) % 12) + 1;

    return `${hour12}:${minutes}${period}`;
  };

  const start = formatTime(meeting.startTime);
  const end = formatTime(addOneMinute(meeting.endTime));

  return `${dayName}${start}-${end}`.toLowerCase();
};

const normalizeDayTime = (value: string | undefined): string => {
  if (!value) return "";
  let v = value.toLowerCase();

  // Normalize plural day names like "tuesdays" -> "tuesday"
  for (const dayName of DAY_NAMES) {
    const lower = dayName.toLowerCase();
    v = v.replace(new RegExp(`${lower}s\\b`, "g"), lower);
  }

  // Normalize spacing
  v = v.replace(/\s+/g, " ").trim();

  // Normalize time ranges like "7:00-8:00pm", "3pm-5pm", or "3-5pm"
  const timeRegex =
    /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*-\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i;
  const timeMatch = v.match(timeRegex);
  if (timeMatch) {
    const [, h1, m1, ampm1, h2, m2, ampm2] = timeMatch;
    const period = (ampm1 || ampm2 || "pm").toLowerCase();
    const startMinutes = m1 ?? "00";
    const endMinutes = m2 ?? "00";
    const t1 = `${h1}:${startMinutes}`;
    const t2 = `${h2}:${endMinutes}`;
    const replacement = `${t1}${period} - ${t2}${period}`;
    v = v.replace(timeRegex, replacement);
  }

  // Final normalization: remove spaces
  return v.replace(/\s+/g, "").trim();
};

const buildDeCalTimes = (sections: DeCalSection[]): Set<string> => {
  const decalTimes = new Set<string>();

  for (const s of sections) {
    const base = normalizeDayTime(s.dayTime);
    if (!base) continue;
    decalTimes.add(base);

    // Allow 1-minute offsets on the end time for cases like 6:29 vs 6:30
    const match = base.match(/(\d{1,2}):(\d{2})(am|pm)$/);
    if (!match) continue;

    const [, hStr, mStr, period] = match;
    let hour = Number(hStr);
    let minutes = Number(mStr);
    if (Number.isNaN(hour) || Number.isNaN(minutes)) continue;

    if (minutes === 29 || minutes === 59) {
      minutes += 1;
      if (minutes >= 60) {
        minutes -= 60;
        hour = hour + 1;
        if (hour > 12) hour -= 12;
        if (hour === 0) hour = 12;
      }

      const hourStr = String(hour);
      const minuteStr = String(minutes).padStart(2, "0");

      const adjusted = base.replace(
        /(\d{1,2}:\d{2})(am|pm)$/,
        `${hourStr}:${minuteStr}${period}`
      );
      decalTimes.add(adjusted);
    }
  }

  return decalTimes;
};

const computeMeetingScore = (
  decal: DeCalCourse,
  meetings?: {
    days?: boolean[];
    startTime?: string;
    endTime?: string;
    location?: string;
  }[]
): number => {
  if (!decal.sections?.length || !meetings?.length) return 0;

  const decalTimes = buildDeCalTimes(decal.sections);

  const decalRooms = new Set(
    decal.sections
      .map((s) => (s.room ?? "").toLowerCase().replace(/\s+/g, " ").trim())
      .filter((s) => s.length > 0)
  );

  if (!decalTimes.size) return 0;

  let timeMatched = false;
  let roomMatched = false;

  for (const meeting of meetings) {
    const formatted = formatMeetingDayTime(meeting);
    if (formatted && decalTimes.has(normalizeDayTime(formatted))) {
      timeMatched = true;
    }

    if (!roomMatched && decalRooms.size && meeting.location) {
      const roomNorm = meeting.location
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
      if (decalRooms.has(roomNorm)) {
        roomMatched = true;
      }
    }
  }

  if (!timeMatched) return 0;

  // Base score 1 for time match; double it if room also matches
  return roomMatched ? 2 : 1;
};

async function scrapeDeCals(config: Config): Promise<void> {
  const { log } = config;
  const outputPath = path.join(process.cwd(), "data", "decals.json");

  try {
    let courses: DeCalCourse[];

    if (DEBUG && fs.existsSync(outputPath)) {
      log.info("DEBUG=true: loading DeCal data from existing decals.json...");
      const raw = fs.readFileSync(outputPath, "utf-8");
      courses = JSON.parse(raw) as DeCalCourse[];
    } else {
      log.info("Fetching approved DeCal courses from berkeleydecal.com API...");
      const approved = await fetchApprovedCourses();

      if (!approved.courses.length) {
        log.warn(
          "No courses returned from approvedCourses API. Writing empty list."
        );
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(outputPath, JSON.stringify([], null, 2), "utf-8");
        log.info(`Wrote ${outputPath}`);
        return;
      }

      log.info(
        `Fetched ${approved.courses.length} courses from approvedCourses API. Fetching per-course details...`
      );

      courses = [];

      for (const c of approved.courses) {
        const base: DeCalCourse = {
          category: c.category ?? undefined,
          title: c.title,
          semester: c.semester ?? undefined,
          department: c.department ?? undefined,
          units: c.units,
          sections:
            c.sections?.map<DeCalSection>((s) => ({
              type: s.section_type ?? undefined,
              dayTime:
                s.day && s.time ? `${s.day} ${s.time}` : (s.time ?? undefined),
              room: s.room ?? undefined,
              enrollment: s.enrollment_status ?? undefined,
            })) ?? [],
          detailsUrl: c.detailsUrl ?? `${LIST_URL}courses/${c.id}`,
          applicationUrl: c.application_url ?? undefined,
          applicationDueDate: c.application_due_date ?? undefined,
          syllabusUrl: c.syllabus_url ?? undefined,
          facilitators:
            c.facilitators?.map<DeCalFacilitator>((f) => ({
              name: f.name,
              email: f.email,
            })) ?? [],
          description: c.description ?? undefined,
          contactEmail: c.contact_email ?? undefined,
          facultySponsorName: c.faculty_sponsor_name ?? undefined,
          enrollmentInformation: c.enrollment_information ?? undefined,
          websiteUrl: c.website ?? undefined,
        };

        const detailId = extractCourseIdFromDetailsUrl(base.detailsUrl) ?? c.id;

        try {
          const detail = await fetchCourseDetail(detailId);

          base.description = detail.description ?? base.description;
          base.contactEmail = detail.contact_email ?? base.contactEmail;
          base.facultySponsorName =
            detail.faculty_sponsor_name ?? base.facultySponsorName;
          base.enrollmentInformation =
            detail.enrollment_information ?? base.enrollmentInformation;
          base.applicationUrl = detail.application_url ?? base.applicationUrl;
          base.applicationDueDate =
            detail.application_due_date ?? base.applicationDueDate;
          base.syllabusUrl = detail.syllabus_url ?? base.syllabusUrl;
          base.websiteUrl = detail.website ?? base.websiteUrl;

          if (detail.sections && detail.sections.length > 0) {
            base.sections = detail.sections.map<DeCalSection>((s) => ({
              type: s.section_type ?? undefined,
              dayTime:
                s.day && s.time ? `${s.day} ${s.time}` : (s.time ?? undefined),
              room: s.room ?? undefined,
              enrollment: s.enrollment_status ?? undefined,
            }));
          }

          if (detail.facilitators && detail.facilitators.length > 0) {
            base.facilitators = detail.facilitators.map<DeCalFacilitator>(
              (f) => ({
                name: f.name,
                email: f.email,
              })
            );
          }
        } catch (err) {
          log.warn(
            `Failed to fetch detail for course ${c.id}: ${(err as Error).message}`
          );
        }

        courses.push(base);
      }

      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(outputPath, JSON.stringify(courses, null, 2), "utf-8");
      log.info(`Wrote ${courses.length} courses to ${outputPath}`);
    }

    // ----- DeCal → Class / Section augmentation -----
    // 1. Active + future undergraduate terms
    const terms = await TermModel.find({
      temporalPosition: { $in: ["Current", "Future"] },
      academicCareerCode: "UGRD",
    })
      .lean()
      .exec();

    if (!terms.length) {
      log.info(
        "No active or future undergraduate terms found; skipping DeCal-class matching."
      );
      return;
    }

    // 2. Group DeCals by semester string like "Spring 2026"
    const decalsBySemester = new Map<string, DeCalCourse[]>();
    for (const decal of courses) {
      if (!decal.semester) continue;
      const key = decal.semester;
      const arr = decalsBySemester.get(key) ?? [];
      arr.push(decal);
      decalsBySemester.set(key, arr);
    }

    if (!decalsBySemester.size) {
      log.info(
        "No DeCal semesters found in decals data; skipping DeCal-class matching."
      );
      return;
    }

    // 3. For each term, intersect with DeCal semesters and perform matching
    for (const term of terms) {
      const [yearStr, semesterName] = term.name.split(" ");
      const year = parseInt(yearStr, 10);
      if (!year || !semesterName) continue;

      const semesterKey = `${semesterName} ${year}`;
      const termDeCals = decalsBySemester.get(semesterKey);
      if (!termDeCals || !termDeCals.length) continue;

      log.info(
        `Matching ${termDeCals.length.toLocaleString()} DeCal(s) against classes in ${semesterKey}...`
      );

      const termClasses = await ClassModel.find({
        year,
        semester: semesterName,
        courseNumber: { $in: ["198", "98"] },
      }).exec();

      if (!termClasses.length) {
        log.warn(`No classes found for ${semesterKey}; skipping.`);
        continue;
      }

      // Build courseId -> subjectName map for this term
      const courseIds = Array.from(new Set(termClasses.map((c) => c.courseId)));
      const coursesForTerm = await CourseModel.find({
        courseId: { $in: courseIds },
      })
        .select({ courseId: 1, subjectName: 1 })
        .lean()
        .exec();
      const subjectNameByCourseId = new Map<string, string | undefined>();
      for (const course of coursesForTerm) {
        subjectNameByCourseId.set(course.courseId, course.subjectName);
      }

      // Preload primary sections for all classes in this term
      const primarySections = await SectionModel.find({
        year,
        semester: semesterName,
        primary: true,
        courseId: { $in: courseIds },
      }).exec();
      const primarySectionsByClassKey = new Map<
        string,
        (typeof primarySections)[number][]
      >();
      for (const section of primarySections) {
        const key = `${section.courseId}:${section.classNumber}`;
        const arr = primarySectionsByClassKey.get(key) ?? [];
        arr.push(section);
        primarySectionsByClassKey.set(key, arr);
      }

      type Candidate = {
        cls: (typeof termClasses)[number];
        subjectName?: string;
        meetings?: {
          days?: boolean[];
          startTime?: string;
          endTime?: string;
          location?: string;
          instructors?: { givenName?: string; familyName?: string }[];
        }[];
      };

      const candidates: Candidate[] = termClasses.map((cls) => {
        const sections =
          primarySectionsByClassKey.get(`${cls.courseId}:${cls.number}`) ?? [];
        const meetings =
          sections.length > 0 ? (sections[0].meetings ?? []) : undefined;

        return {
          cls,
          subjectName: subjectNameByCourseId.get(cls.courseId),
          meetings,
        };
      });

      for (const decal of termDeCals) {
        if (!decal.title) continue;

        const faculty = decal.facultySponsorName ?? "unknown faculty";
        const meetingSummaries =
          decal.sections
            ?.map((s) => {
              const time = s.dayTime ?? "unknown time";
              const room = s.room ?? "unknown room";
              return `${time} @ ${room}`;
            })
            .join("; ") ?? "no sections";

        log.info(
          `Matching DeCal "${decal.title}" (dept: "${decal.department}", faculty: "${faculty}", meetings: ${meetingSummaries}) to classes in ${semesterKey}...`
        );

        // Constrain candidates by department/subjectName when possible
        const dept = decal.department ?? null;
        let filteredCandidates = candidates.filter((c) =>
          departmentsMatch(c.subjectName, dept)
        );
        log.info(
          `Filtered candidates by department: ${filteredCandidates.length}`
        );
        if (!filteredCandidates.length) {
          log.info(
            `No candidates found for department "${decal.department}"; searching across all departments.`
          );
          filteredCandidates = candidates;
        }

        let candidatesToSearch = filteredCandidates;
        let bestCandidate: Candidate | null = null;
        let bestTotalScore = 0;
        let tiedCandidates: Candidate[] = [];
        const SCORE_EPSILON = 1e-6;

        while (true) {
          // Fuzzy title match using FuzzySearch
          const fuzzyIndex = new FuzzySearch<Candidate>(candidatesToSearch, {
            keys: ["cls.title"],
            includeScore: true,
            threshold: 1,
          });
          const fuzzyResults = fuzzyIndex.search(decal.title);

          const fuzzyScoreByCandidate = new Map<Candidate, number>();
          if (fuzzyResults.length > 0) {
            const scores = fuzzyResults
              .map((r) => (typeof r.score === "number" ? r.score : 1))
              .filter((s) => s > 0);
            const bestScore = scores.length ? Math.min(...scores) : 0;

            if (bestScore > 0) {
              for (const r of fuzzyResults) {
                const s =
                  typeof r.score === "number" && r.score > 0 ? r.score : null;
                if (!s) continue;
                // Normalize so best match has score 1, others scaled relative to it
                const normalized = bestScore / s;
                fuzzyScoreByCandidate.set(r.item, normalized);
              }
            }
          }

          bestCandidate = null;
          bestTotalScore = 0;
          tiedCandidates = [];

          for (const cand of candidatesToSearch) {
            const meetingScore = computeMeetingScore(decal, cand.meetings);

            // Separate instructor-name metric (0.5 max) based on fuzzy match
            let instructorScore = 0;
            if (decal.facultySponsorName && cand.meetings) {
              const sponsorName = normalizeString(decal.facultySponsorName);
              if (sponsorName) {
                const instructorNames: string[] = [];
                for (const meeting of cand.meetings) {
                  for (const inst of meeting.instructors ?? []) {
                    const full =
                      `${inst.givenName ?? ""} ${inst.familyName ?? ""}`
                        .trim()
                        .toLowerCase();
                    if (full) instructorNames.push(full);
                  }
                }

                if (instructorNames.length) {
                  const nameItems = instructorNames.map((name) => ({ name }));
                  const nameSearch = new FuzzySearch<{ name: string }>(
                    nameItems,
                    {
                      keys: ["name"],
                      includeScore: true,
                      threshold: 1,
                    }
                  );
                  const nameResults = nameSearch.search(sponsorName);
                  if (nameResults.length > 0) {
                    instructorScore = 0.5;
                  }
                }
              }
            }

            let fuzzyComponent = fuzzyScoreByCandidate.get(cand) ?? 0;
            if (fuzzyComponent === 0 && cand.cls.title) {
              const editDist = levenshteinDistance(
                (decal.title ?? "").toLowerCase(),
                (cand.cls.title ?? "").toLowerCase()
              );
              if (editDist < 10) {
                fuzzyComponent = 0.5;
              } else {
                fuzzyComponent = -1;
              }
            }
            const totalScore = meetingScore + instructorScore + fuzzyComponent;

            const classMeetingSummaries =
              cand.meetings
                ?.map((m) => {
                  const time = formatMeetingDayTime(m) ?? "unknown time";
                  const room =
                    m.location?.toLowerCase().replace(/\s+/g, " ").trim() ??
                    "unknown room";
                  return `${time} @ ${room}`;
                })
                .join("; ") ?? "no meetings";

            const classInstructorNames =
              cand.meetings
                ?.flatMap((m) =>
                  (m.instructors ?? []).map((i) =>
                    `${i.givenName ?? ""} ${i.familyName ?? ""}`.trim()
                  )
                )
                .filter((n) => n.length > 0)
                .join(", ") ?? "no instructors";

            log.info(
              `Scores for candidate ${cand.cls.subject}:${cand.cls.courseNumber} #${cand.cls.number} - ${cand.cls.title} -> ` +
                `meetingScore: ${meetingScore.toFixed(3)}, ` +
                `instructorScore: ${instructorScore.toFixed(3)}, ` +
                `titleScore: ${fuzzyComponent.toFixed(3)}, ` +
                `total: ${totalScore.toFixed(3)}, ` +
                `meetings: [${classMeetingSummaries}], ` +
                `instructors: [${classInstructorNames}]`
            );

            if (totalScore > bestTotalScore + SCORE_EPSILON) {
              bestTotalScore = totalScore;
              bestCandidate = cand;
              tiedCandidates = [cand];
            } else if (Math.abs(totalScore - bestTotalScore) <= SCORE_EPSILON) {
              tiedCandidates.push(cand);
            }
          }

          if (bestCandidate && bestTotalScore > 0) break;
          if (candidatesToSearch === candidates) break;
          log.info(
            `No best candidate found for DeCal "${decal.title}" within department; searching across all departments.`
          );
          candidatesToSearch = candidates;
        }

        if (tiedCandidates.length > 1 && bestTotalScore > 0) {
          const tieDescriptions = tiedCandidates
            .map(
              (c) =>
                `${c.cls.subject}:${c.cls.courseNumber} #${c.cls.number} - ${c.cls.title}`
            )
            .join("; ");
          log.info(
            `Tie detected for DeCal "${decal.title}" at score ${bestTotalScore.toFixed(
              3
            )} between candidates: ${tieDescriptions}`
          );
        }

        if (!bestCandidate || bestTotalScore <= 0) {
          log.info(`No best candidate found for DeCal "${decal.title}"`);
          continue;
        }

        const bestClass = bestCandidate.cls;

        // Update class document with DeCal metadata (decal sub-object)
        (bestClass as any).decal = {
          title: decal.title,
          syllabus: decal.syllabusUrl,
          description: decal.description,
          instructors:
            decal.facilitators?.map((f) => ({
              name: f.name,
              email: f.email,
            })) ?? [],
          applicationUrl: decal.applicationUrl,
          applicationDueDate: decal.applicationDueDate,
          syllabusUrl: decal.syllabusUrl,
        };

        await bestClass.save();

        log.trace(
          `Matched DeCal "${decal.title}" to class "${bestClass.subject} ${bestClass.courseNumber} ${bestClass.number} - ${bestClass.title}" in ${semesterKey} (score ${bestTotalScore.toFixed(3)}).`
        );
      }
    }
  } catch (err) {
    log.error(
      `Failed to fetch decals from approvedCourses API: ${(err as Error).message}`
    );
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify([], null, 2), "utf-8");
    log.info(`Wrote empty decals list to ${outputPath} due to error.`);
  }
}

export default {
  scrapeDeCals,
};
