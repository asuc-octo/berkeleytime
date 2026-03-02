import * as cheerio from "cheerio";
import * as fs from "node:fs";
import * as path from "node:path";
import type { Logger } from "tslog";

const BASE_URL = "https://berkeleydecal.com";
const LIST_URL = `${BASE_URL}/`;

export interface DecalSection {
  type?: string;
  dayTime?: string;
  room?: string;
  enrollment?: string;
  time?: string;
  location?: string;
}

export interface DecalFacilitator {
  name: string;
  email: string;
}

export interface DecalCourse {
  category?: string;
  title: string;
  department?: string;
  units?: number;
  sections: DecalSection[];
  detailsUrl?: string;
  applicationUrl?: string;
  applicationDueDate?: string;
  syllabusUrl?: string;
  facilitators: DecalFacilitator[];
}

function resolveUrl(base: string, href: string): string {
  if (href.startsWith("http")) return href;
  const baseUrl = base.endsWith("/") ? base : base + "/";
  return new URL(href, baseUrl).href;
}

async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Berkeleytime-Datapuller/1.0 (https://berkeleytime.berkeley.edu)",
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} fetching ${url}`);
  }
  return response.text();
}

function extractCoursesFromListing(
  html: string,
  baseUrl: string
): Array<{
  url: string;
  category?: string;
  title: string;
  department?: string;
  units?: number;
  sections: DecalSection[];
}> {
  const $ = cheerio.load(html);

  // Try embedded JSON first (e.g. Next.js __NEXT_DATA__, or similar)
  const scriptText = $("script#__NEXT_DATA__").html();
  if (scriptText) {
    try {
      const data = JSON.parse(scriptText) as {
        props?: { pageProps?: { courses?: unknown[] } };
        __NEXT_DATA__?: {
          props?: {
            pageProps?: {
              courses?: Array<{
                slug?: string;
                title?: string;
                category?: string;
                department?: string;
                units?: number;
                sections?: DecalSection[];
              }>;
            };
          };
        };
      };
      const nextData = data as {
        props?: {
          pageProps?: {
            courses?: Array<{
              slug?: string;
              id?: string;
              title?: string;
              category?: string;
              department?: string;
              units?: number;
              sections?: DecalSection[];
            }>;
          };
        };
      };
      const courses = nextData?.props?.pageProps?.courses;
      if (Array.isArray(courses) && courses.length > 0) {
        return courses
          .map((c) => ({
            url: c.slug
              ? `${baseUrl}/course/${c.slug}`
              : c.id
                ? `${baseUrl}/course/${c.id}`
                : "",
            category: c.category,
            title: c.title ?? "",
            department: c.department,
            units: c.units,
            sections: c.sections ?? [],
          }))
          .filter((c) => c.url);
      }
    } catch {
      // ignore JSON parse errors
    }
  }

  // Fallback: parse HTML cards / links
  const results: Array<{
    url: string;
    category?: string;
    title: string;
    department?: string;
    units?: number;
    sections: DecalSection[];
  }> = [];
  const linkSelector = 'a[href*="/course/"]';
  $(linkSelector).each((_, el) => {
    const $el = $(el);
    const href = $el.attr("href");
    if (!href) return;
    const fullUrl = resolveUrl(baseUrl, href);
    const card = $el.closest(
      "[class*='card'], [class*='Card'], article, .course"
    );
    const category =
      card
        .find("[class*='category'], [class*='tag'], .tag")
        .first()
        .text()
        .trim() || undefined;
    const titleEl = card.find("h2, h3, [class*='title']").first();
    const title = titleEl.length ? titleEl.text().trim() : $el.text().trim();
    if (!title) return;
    const deptUnits = card
      .find("[class*='department'], [class*='units'], .meta")
      .first()
      .text()
      .trim();
    let department: string | undefined;
    let units: number | undefined;
    const unitsMatch = deptUnits.match(/(\d+)\s*unit/i);
    if (unitsMatch) units = parseInt(unitsMatch[1], 10);
    const deptMatch = deptUnits.match(/^([^•·\-]+)/);
    if (deptMatch) department = deptMatch[1].trim() || undefined;
    const sections: DecalSection[] = [];
    card
      .find("[class*='section'], [class*='time'], [class*='location']")
      .each((__, sectionEl) => {
        const text = $(sectionEl).text().trim();
        if (
          text.includes("PM") ||
          text.includes("AM") ||
          text.match(/\d+:\d+/)
        ) {
          sections.push({ time: text, location: "" });
        }
      });
    results.push({
      url: fullUrl,
      category,
      title,
      department,
      units,
      sections,
    });
  });

  // Dedupe by URL
  const seen = new Set<string>();
  return results.filter((r) => {
    if (seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });
}

function parseDetailPage(
  html: string
): Partial<
  Pick<
    DecalCourse,
    | "applicationUrl"
    | "applicationDueDate"
    | "syllabusUrl"
    | "sections"
    | "facilitators"
  >
> {
  const $ = cheerio.load(html);
  const out: Partial<
    Pick<
      DecalCourse,
      | "applicationUrl"
      | "applicationDueDate"
      | "syllabusUrl"
      | "sections"
      | "facilitators"
    >
  > = {
    sections: [],
    facilitators: [],
  };

  // Enrollment: Application URL and Due Date (find section by heading text)
  const allEls = $("h2, h3, h4, strong, *");
  const enrollmentHeading = allEls
    .filter((_, el) => $(el).text().trim() === "Enrollment Information")
    .first();
  const enrollmentSection = enrollmentHeading.closest("section, div").length
    ? enrollmentHeading.closest("section, div")
    : enrollmentHeading.parent();
  const sectionText = enrollmentSection.text();
  const appUrlMatch = sectionText.match(/Application URL:\s*(\S+)/);
  if (appUrlMatch) out.applicationUrl = appUrlMatch[1].trim();
  const appDueMatch = sectionText.match(
    /Application Due Date:\s*([^\n]+?)(?:\n|$)/
  );
  if (appDueMatch) out.applicationDueDate = appDueMatch[1].trim();

  const appLink = enrollmentSection
    .find('a[href*="forms.gle"], a[href*="docs.google"]')
    .attr("href");
  if (appLink && !out.applicationUrl) out.applicationUrl = appLink;

  // Course Sections table: Type, Day & Time, Room, Enrollment
  const sectionsHeading = allEls
    .filter((_, el) => $(el).text().trim() === "Course Sections")
    .first();
  const sectionsParent = sectionsHeading.closest("section, div").length
    ? sectionsHeading.closest("section, div")
    : sectionsHeading.parent();
  sectionsParent
    .find("table tr, [class*='section'] tr, .section-row")
    .each((_, row) => {
      const cells = $(row).find("td, [class*='cell']");
      if (cells.length >= 3) {
        const texts = cells.map((__, c) => $(c).text().trim()).get();
        out.sections!.push({
          type: texts[0],
          dayTime: texts[1],
          room: texts[2],
          enrollment: texts[3],
        });
      }
    });

  // Syllabus link
  const syllabusAnchor = $("a")
    .filter((_, el) => $(el).text().includes("View Syllabus Document"))
    .first();
  const syllabusLink =
    syllabusAnchor.attr("href") ??
    $('a[href*="syllabus"]').first().attr("href");
  if (syllabusLink) out.syllabusUrl = resolveUrl(BASE_URL, syllabusLink);

  // Facilitators: name and email
  const facilitatorsHeading = allEls
    .filter((_, el) => $(el).text().trim() === "Facilitators")
    .first();
  const facilitatorsSection = facilitatorsHeading.closest("section, div").length
    ? facilitatorsHeading.closest("section, div")
    : facilitatorsHeading.parent();
  facilitatorsSection
    .find("a[href^='mailto:'], [class*='facilitator']")
    .each((_, el) => {
      const $el = $(el);
      const email = $el
        .attr("href")
        ?.replace(/^mailto:/i, "")
        .trim();
      const name = $el.text().trim();
      if (email && name) out.facilitators!.push({ name, email });
    });

  return out;
}

async function scrapeDecals(config: { log: Logger<unknown> }): Promise<void> {
  const { log } = config;
  const outputPath = path.join(process.cwd(), "data", "decals.json");

  log.info("Fetching course list from berkeleydecal.com...");
  const listHtml = await fetchHtml(LIST_URL);
  const listingCourses = extractCoursesFromListing(listHtml, BASE_URL);

  if (listingCourses.length === 0) {
    log.warn(
      "No courses found on listing page (site may be client-rendered). Writing empty list."
    );
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify([], null, 2), "utf-8");
    log.info(`Wrote ${outputPath}`);
    return;
  }

  log.info(`Found ${listingCourses.length} courses. Fetching detail pages...`);
  const courses: DecalCourse[] = [];

  for (let i = 0; i < listingCourses.length; i++) {
    const c = listingCourses[i];
    log.trace(`Fetching ${i + 1}/${listingCourses.length}: ${c.title}`);
    try {
      const detailHtml = await fetchHtml(c.url);
      const detail = parseDetailPage(detailHtml);
      courses.push({
        category: c.category,
        title: c.title,
        department: c.department,
        units: c.units,
        sections: (detail.sections?.length
          ? detail.sections
          : c.sections) as DecalSection[],
        detailsUrl: c.url,
        applicationUrl: detail.applicationUrl,
        applicationDueDate: detail.applicationDueDate,
        syllabusUrl: detail.syllabusUrl,
        facilitators: detail.facilitators ?? [],
      });
    } catch (err) {
      log.warn(`Failed to fetch ${c.url}: ${(err as Error).message}`);
      courses.push({
        category: c.category,
        title: c.title,
        department: c.department,
        units: c.units,
        sections: c.sections,
        detailsUrl: c.url,
        facilitators: [],
      });
    }
  }

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(courses, null, 2), "utf-8");
  log.info(`Wrote ${courses.length} courses to ${outputPath}`);
}

export default {
  scrapeDecals,
};
