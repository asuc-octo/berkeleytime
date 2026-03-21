import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { Logger } from "tslog";

import { Config } from "../shared/config";

const OUTPUT_PATH = resolve(
  __dirname,
  "../../../../packages/BtLL/grad-requirements-raw.json"
);

const CATALOG_URL = "https://undergraduate.catalog.berkeley.edu";

// Intercepted from CourseDog API calls in the Berkeley catalog site
// TODO: flesh out once you inspect actual API responses
interface CourseDogProgram {
  programGroupId: string;
  name: string;
  [key: string]: unknown;
}

/**
 * Uses Playwright to load the catalog and intercept CourseDog API responses.
 * Returns the full list of programs from ALL paginated API calls the page makes.
 */
const fetchAllPrograms = async (
  log: Config["log"]
): Promise<CourseDogProgram[]> => {
  log.trace("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const programs: CourseDogProgram[] = [];

  // Collect promises for all matching response body reads so we can await them
  // after networkidle. This handles virtual-scrolling / pagination: the page may
  // fire many sequential requests to /programs/search/ and we want every one.
  const pendingBodyReads: Promise<void>[] = [];

  page.on("response", (r) => {
    if (
      r.url().includes("coursedog.com") &&
      r.url().includes("/programs/search/")
    ) {
      const bodyPromise = r
        .json()
        .then((json: { data?: CourseDogProgram[] } | CourseDogProgram[]) => {
          const data: CourseDogProgram[] = Array.isArray(json)
            ? json
            : ((json as { data?: CourseDogProgram[] }).data ?? []);
          programs.push(...data);
          log.trace(`Intercepted ${data.length} programs from ${r.url()}`);
        })
        .catch((e: unknown) => {
          log.error("Failed to parse programs API response body:", e);
        });
      pendingBodyReads.push(bodyPromise);
    }
  });

  log.trace(`Navigating to ${CATALOG_URL}/programs...`);
  await page.goto(`${CATALOG_URL}/programs`, { waitUntil: "networkidle" });

  // Flush all in-flight body reads before closing the browser.
  await Promise.all(pendingBodyReads);

  await browser.close();
  log.info(`Fetched ${programs.length} programs`);

  if (programs.length > 0) {
    log.trace(
      "First program full structure:",
      JSON.stringify(programs[0], null, 2)
    );
  }

  return programs;
};

/**
 * Fetches the raw API response for a single program by loading its catalog page
 * and intercepting the CourseDog API response.
 *
 * A *fresh browser context* is created for every call so that the SPA's Vuex
 * store / in-memory cache is empty. Without this the SPA reuses the cached
 * program list data from a previous page load and never fires a new API
 * request, causing waitForResponse to time out.
 */
const fetchProgramDetails = async (
  programGroupId: string,
  log: Config["log"]
): Promise<unknown> => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  let details: unknown = null;

  await page.goto(`${CATALOG_URL}/programs/${programGroupId}`, {
    waitUntil: "networkidle",
  });

  try {
    // Nuxt embeds SSR data into the page as window.__NUXT__ for client hydration.
    // Extract it directly instead of intercepting network calls (which happen server-side).
    details = await page.evaluate(() => (window as any).__NUXT__);
    log.trace(
      "Raw __NUXT__ data:",
      JSON.stringify(details, null, 2).slice(0, 500)
    );
  } catch (e) {
    log.error(`Failed to extract __NUXT__ data for ${programGroupId}:`, e);
  }

  await context.close();
  await browser.close();
  return details;
};

/**
 * Main entry point. Scrapes all programs and dumps raw API responses to a JSON file.
 * TODO: pipe the raw data into an LLM to generate BtLL code.
 */
const scrapeGradRequirements = async (config: Config): Promise<void> => {
  const { log } = config;

  const programs = await fetchAllPrograms(log);

  const output: Record<string, unknown> = {};

  // Slice for testing
  for (const program of programs.slice(0, 2)) {
    log.trace(`Processing: ${program.name} (${program.programGroupId})`);
    const details = await fetchProgramDetails(program.programGroupId, log);

    output[program.programGroupId] = { name: program.name, details };
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  log.info(
    `Wrote raw data for ${Object.keys(output).length} programs to ${OUTPUT_PATH}`
  );
};

// Run directly: npx tsx src/pullers/grad-requirements.ts
if (process.argv[1]?.includes("grad-requirements")) {
  const log = new Logger({ type: "pretty" });
  scrapeGradRequirements({ log } as Config).catch(console.error);
}

export default { scrapeGradRequirements };
