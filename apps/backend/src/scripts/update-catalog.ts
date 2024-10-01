import { URLSearchParams } from "url";

import {
  ClassModel,
  ClassType,
  CourseModel,
  CourseType,
  SectionModel,
  SectionType,
  TermModel,
  TermType,
} from "@repo/common";

import mongooseLoader from "../bootstrap/loaders/mongoose";
import { config } from "../config";
import { DeprecatedSISResponse, SISResponse } from "../utils/sis";

const SIS_COURSE_URL = "https://gateway.api.berkeley.edu/sis/v4/courses";

const SIS_CLASS_URL = "https://gateway.api.berkeley.edu/sis/v1/classes";

const SIS_TERM_URL = "https://gateway.api.berkeley.edu/sis/v2/terms";

const SIS_SECTION_URL =
  "https://gateway.api.berkeley.edu/sis/v1/classes/sections";

const queryPage = async <V>(
  id: string,
  key: string,
  url: string,
  field: string,
  params?: Record<string, string>
) => {
  let retries = 3;

  console.log("Querying SIS API page...");
  console.log(`URL: ${url}`);
  if (params) console.log(`Params: ${params.toString()}`);

  while (retries > 0) {
    try {
      const _params = new URLSearchParams({
        "page-number": "1",
        "page-size": "100",
        ...params,
      });

      const response = await fetch(`${url}?${_params}`, {
        headers: {
          app_id: id,
          app_key: key,
        },
      });

      if (response.status !== 200) throw new Error(response.statusText);

      const data = (await response.json()) as
        | DeprecatedSISResponse<V>
        | SISResponse<V>;

      return data.apiResponse
        ? data.apiResponse.response[field]
        : data.response[field];
    } catch (error) {
      console.log(`Unexpected error querying SIS API. Error: "${error}"`);

      if (retries === 0) {
        console.log(`Too many errors querying SIS API. Terminating update...`);

        break;
      }

      retries--;

      console.log(`Retrying...`);

      continue;
    }
  }

  return [];
};

const queryPages = async <V>(
  id: string,
  key: string,
  url: string,
  field: string,
  params?: Record<string, string>
) => {
  let page = 1;
  let retries = 3;

  const values: V[] = [];

  console.log("Querying SIS API pages...");
  console.log(`URL: ${url}`);
  if (params) console.log(`Params: ${params}`);

  while (retries > 0) {
    try {
      const _params = new URLSearchParams({
        "page-number": page.toString(),
        "page-size": "100",
        ...params,
      });

      const response = await fetch(`${url}?${_params}`, {
        headers: {
          app_id: id,
          app_key: key,
        },
      });

      if (response.status !== 200) throw new Error(response.statusText);

      const data = (await response.json()) as
        | DeprecatedSISResponse<V>
        | SISResponse<V>;

      const _values = data.apiResponse
        ? data.apiResponse.response[field]
        : data.response[field];

      values.push(..._values);

      if (_values.length < 100) {
        console.log(
          `No more data found on page ${page}. Terminating update...`
        );

        break;
      }
    } catch (error) {
      console.log(`Unexpected error querying SIS API. Error: "${error}"`);

      if (retries === 0) {
        console.log(`Too many errors querying SIS API. Terminating update...`);

        break;
      }

      retries--;

      console.log(`Retrying...`);

      continue;
    }

    page++;
  }

  console.log(
    `Finished querying SIS API. Received ${values.length} objects in ${
      page
    } pages.`
  );

  return values;
};

const updateCourses = async () => {
  console.log("Updating database with new course data...");

  const courses = await queryPages<CourseType>(
    config.sis.COURSE_APP_ID,
    config.sis.COURSE_APP_KEY,
    SIS_COURSE_URL,
    "courses",
    {
      "status-code": "ACTIVE",
    }
  );

  const operations = courses.map((course) => ({
    replaceOne: {
      filter: { classDisplayName: course.classDisplayName },
      replacement: course,
      upsert: true,
    },
  }));

  const { upsertedCount, modifiedCount } =
    await CourseModel.bulkWrite(operations);

  console.log(
    `Completed updating database with new course data. Created ${upsertedCount} and updated ${modifiedCount} course objects.`
  );
};

const updateClasses = async (currentTerms: TermType[]) => {
  const classes: ClassType[] = [];

  for (const term of currentTerms) {
    console.log(`Updating classses for ${term.name}...`);

    const termClasses = await queryPages<ClassType>(
      config.sis.CLASS_APP_ID,
      config.sis.CLASS_APP_KEY,
      SIS_CLASS_URL,
      "classes",
      {
        "term-id": term.id,
      }
    );

    classes.push(...termClasses);
  }

  console.log("Updating database with new class data...");

  const operations = classes.map((_class) => ({
    replaceOne: {
      filter: { displayName: _class.displayName },
      replacement: _class,
      upsert: true,
    },
  }));

  const { upsertedCount, modifiedCount } =
    await ClassModel.bulkWrite(operations);

  console.log(
    `Completed updating database with new class data. Created ${upsertedCount} and updated ${modifiedCount} class objects.`
  );
};

const updateSections = async (currentTerms: TermType[]) => {
  const sections: SectionType[] = [];

  for (const term of currentTerms) {
    console.log(`Updating sections for ${term.name}...`);

    const termClasses = await queryPages<SectionType>(
      config.sis.CLASS_APP_ID,
      config.sis.CLASS_APP_KEY,
      SIS_SECTION_URL,
      "classSections",
      { "term-id": term.id }
    );

    sections.push(...termClasses);
  }

  console.log("Updating database with new section data...");

  const operations = sections.map((section) => ({
    replaceOne: {
      filter: { displayName: section.displayName },
      replacement: section,
      upsert: true,
    },
  }));

  const { upsertedCount, modifiedCount } =
    await SectionModel.bulkWrite(operations);

  console.log(
    `Completed updating database with new section data. Created ${upsertedCount} and updated ${modifiedCount} section objects.`
  );
};

const updateTerms = async () => {
  console.log("Updating database with new term data...");

  // Get the next term
  const terms = await queryPage<TermType>(
    config.sis.TERM_APP_ID,
    config.sis.TERM_APP_KEY,
    SIS_TERM_URL,
    "terms",
    {
      "temporal-position": "Next",
    }
  );

  // Get all previous terms
  let currentTerm: TermType | undefined = terms[0];

  while (currentTerm) {
    console.log(currentTerm.name);

    [currentTerm] = await queryPage<TermType>(
      config.sis.TERM_APP_ID,
      config.sis.TERM_APP_KEY,
      SIS_TERM_URL,
      "terms",
      {
        "temporal-position": "Previous",
        "as-of-date": currentTerm.beginDate as unknown as string,
      }
    );

    if (currentTerm) terms.push(currentTerm);
  }

  console.log("Updating database with new term data...");

  const operations = terms.map((term) => ({
    replaceOne: {
      filter: { name: term.name },
      replacement: term,
      upsert: true,
    },
  }));

  const { upsertedCount, modifiedCount } =
    await TermModel.bulkWrite(operations);

  console.log(
    `Completed updating database with new term data. Created ${upsertedCount} and updated ${modifiedCount} term objects.`
  );
};

const initialize = async () => {
  try {
    await mongooseLoader();

    // console.log("\n=== UPDATE TERMS ===");
    // await updateTerms();

    // console.log("\n=== UPDATE COURSES ===");
    // await updateCourses();

    // const currentTerms = await TermModel.find({
    //   temporalPosition: "Current",
    // }).lean();

    // Find the 8 most recent semesters
    const recentTerms = await TermModel.find({
      temporalPosition: "Previous",
    })
      .sort({ beginDate: -1 })
      .limit(8)
      .lean();

    console.log("\n=== UPDATE CLASSES ===");
    await updateClasses(recentTerms);

    console.log("\n=== UPDATE SECTIONS ===");
    await updateSections(recentTerms);
  } catch (error) {
    console.error(error);

    process.exit(1);
  }

  process.exit(0);
};

initialize();
