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
  page: number,
  params?: Record<string, string>
) => {
  let retries = 3;

  // console.log("Querying SIS API page...");
  // console.log(`URL: ${url}`);
  // if (params) console.log(`Params: ${params.toString()}`);

  while (retries > 0) {
    try {
      const _params = new URLSearchParams({
        ...params,
        "page-number": page.toString(),
        "page-size": "100",
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
      // console.log(`Unexpected error querying SIS API. Error: "${error}"`);

      if (retries === 0) {
        // console.log(`Too many errors querying SIS API. Terminating update...`);

        break;
      }

      retries--;

      // console.log(`Retrying...`);

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
  const values: V[] = [];

  // Query courses in batches of 50
  const queryBatchSize = 50;
  let page = 1;

  while (values.length % 100 === 0) {
    console.log(`Querying ${queryBatchSize} pages from page ${page}...`);

    const promises = [];

    for (let i = 0; i < queryBatchSize; i++) {
      promises.push(queryPage<V>(id, key, url, field, page + i, params));
    }

    const results = await Promise.all(promises);
    const flattenedResults = results.flat();

    if (flattenedResults.length === 0) break;

    values.push(...flattenedResults);

    page += queryBatchSize;
  }

  return values;
};

const updateCourses = async () => {
  console.log("Updating database with new course data...");

  const courses = await queryPages<CourseType>(
    config.sis.COURSE_APP_ID,
    config.sis.COURSE_APP_KEY,
    SIS_COURSE_URL,
    "courses"
  );

  console.log(`Received ${courses.length} courses from SIS API.`);

  // Remove all courses
  await CourseModel.deleteMany({});

  // Insert courses in batches of 5000
  const insertBatchSize = 5000;

  for (let i = 0; i < courses.length; i += insertBatchSize) {
    const batch = courses.slice(i, i + insertBatchSize);

    console.log(`Inserting batch ${i / insertBatchSize + 1}...`);

    await CourseModel.insertMany(batch, { ordered: false });
  }

  console.log(`Completed updating database with new course data.`);
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

  console.log(`Received ${classes.length} classes from SIS API.`);

  // Remove all classes
  await ClassModel.deleteMany({
    "session.term.name": {
      $in: currentTerms.map((term) => term.name),
    },
  });

  // Split classes into batches of 5000
  const batchSize = 5000;

  for (let i = 0; i < classes.length; i += batchSize) {
    const batch = classes.slice(i, i + batchSize);

    console.log(`Inserting batch ${i / batchSize + 1}...`);

    await ClassModel.insertMany(batch, { ordered: false });
  }

  console.log(`Completed updating database with new class data.`);
};

const updateSections = async (currentTerms: TermType[]) => {
  const sections: SectionType[] = [];

  for (const term of currentTerms) {
    console.log(`Updating sections for ${term.name}...`);

    const termSections = await queryPages<SectionType>(
      config.sis.CLASS_APP_ID,
      config.sis.CLASS_APP_KEY,
      SIS_SECTION_URL,
      "classSections",
      { "term-id": term.id }
    );

    sections.push(...termSections);
  }

  console.log(`Received ${sections.length} sections from SIS API.`);

  // Remove all sections
  await SectionModel.deleteMany({
    "class.session.term.name": {
      $in: currentTerms.map((term) => term.name),
    },
  });

  // Split sections into batches of 5000
  const batchSize = 5000;

  for (let i = 0; i < sections.length; i += batchSize) {
    const batch = sections.slice(i, i + batchSize);

    console.log(`Inserting batch ${i / batchSize + 1}...`);

    await SectionModel.insertMany(batch, { ordered: false });
  }

  console.log(`Completed updating database with new section data.`);
};

const updateTerms = async () => {
  console.log("Updating database with new term data...");

  // Get the next term
  const terms = await queryPage<TermType>(
    config.sis.TERM_APP_ID,
    config.sis.TERM_APP_KEY,
    SIS_TERM_URL,
    "terms",
    1,
    {
      "temporal-position": "Next",
    }
  );

  // Get all previous terms
  let currentTerm: TermType | undefined = terms[0];

  let i = 10;

  while (i > 0) {
    console.log(currentTerm.name);

    [currentTerm] = await queryPage<TermType>(
      config.sis.TERM_APP_ID,
      config.sis.TERM_APP_KEY,
      SIS_TERM_URL,
      "terms",
      1,
      {
        "temporal-position": "Previous",
        "as-of-date": currentTerm.beginDate as unknown as string,
      }
    );

    if (currentTerm) terms.push(currentTerm);

    i--;
  }

  console.log(`Received ${terms.length} terms from SIS API.`);

  // Remove all terms
  await TermModel.deleteMany({});

  // Split terms into batches of 5000
  const batchSize = 5000;

  for (let i = 0; i < terms.length; i += batchSize) {
    const batch = terms.slice(i, i + batchSize);

    batch.forEach((doc, index) => {
      const instance = new TermModel(doc);
      const error = instance.validateSync();
      if (error) {
        console.error(`Validation error for document ${index}:`, error);
      } else {
        console.log(`Document ${index} is valid.`);
      }
    });

    console.log(`Inserting batch ${i / batchSize + 1}...`);

    await TermModel.insertMany(batch, { ordered: false });
  }

  console.log(`Completed updating database with new term data.`);
};

const initialize = async () => {
  try {
    await mongooseLoader();

    console.log("\n=== UPDATE TERMS ===");
    await updateTerms();

    console.log("\n=== UPDATE COURSES ===");
    await updateCourses();

    const terms = await TermModel.find({
      "academicCareer.code": "UGRD",
      academicYear: { $in: ["2024", "2025"] },
    }).lean();

    console.log("\n=== UPDATE CLASSES ===");
    await updateClasses(terms as TermType[]);

    console.log("\n=== UPDATE SECTIONS ===");
    await updateSections(terms as TermType[]);
  } catch (error) {
    console.error(error);

    process.exit(1);
  }

  process.exit(0);
};

initialize();
