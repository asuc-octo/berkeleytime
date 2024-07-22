import mongooseLoader from "../bootstrap/loaders/mongoose";
import { CourseModel, CourseType } from "../models/course";
import { SemesterModel, SemesterType } from "../models/semester";
import { config } from "../config";

import axios, { AxiosResponse } from "axios";
import { SISResponse } from "../utils/sis";
import { MongooseBulkWriteOptions } from "mongoose";
import { ClassModel, ClassType } from "../models/class";
import { SectionModel, SectionType } from "../models/section";

const SIS_COURSE_URL = "https://gateway.api.berkeley.edu/sis/v4/courses";
const SIS_CLASS_URL = "https://gateway.api.berkeley.edu/sis/v1/classes";
const SIS_SECTION_URL = "https://gateway.api.berkeley.edu/sis/v1/classes/sections";

type StrictOption = boolean | "throw";

const bulkWriteOptions: { strict?: StrictOption } = { strict: "throw" };

const semToTermId = (s: SemesterType) => {
  // term-id is computed by dropping the century digit of the year, then adding the term code
  const termMap: { [key: string]: number } = {
    Fall: 8,
    Spring: 2,
    Summer: 5,
    Winter: 11,
  };
  return `${Math.floor(s.year / 1000)}${s.year % 100}${termMap[s.term]}`;
};

const queryPages = async <T>(
    url: string,
    params: any,
    headers: any,
    field: string,
    retries = 3,
) => {
    let page = 1;
    const values: T[] = [];

    console.log("Querying SIS API pages...");
    console.log(`URL: ${url}`);
    console.log(`Params: ${JSON.stringify(params)}`);
    console.log(`Headers: ${JSON.stringify(headers)}`);
    while (true) {
        let resp: AxiosResponse<SISResponse<T>>;

        try {
            resp = await axios.get(url, {
                params: { "page-number": page, ...params },
                headers,
            });
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 404) {
                break;
            } else {
                console.log(`Unexpected err querying SIS API. Error: ${err}.`);

                if (retries > 0) {
                    retries--;
                    console.log(`Retrying...`);
                    continue;
                } else {
                    console.log(
                        `Too many errors querying SIS API for courses. Terminating update...`,
                    );
                    throw err;
                }
            }
        }

        values.push(...resp.data.apiResponse.response[field]);
        page++;
    }

    console.log(
        `Completed querying SIS API. Received ${values.length} objects in ${page - 1} pages.`,
    );

    return values;
};

const updateCourses = async () => {
    const headers = {
        app_id: config.sis.COURSE_APP_ID,
        app_key: config.sis.COURSE_APP_KEY,
    };
    const params = {
        "status-code": "ACTIVE",
        "page-size": 100,
    };

    const courses = await queryPages<CourseType>(
        SIS_COURSE_URL,
        params,
        headers,
        "courses",
    );

    console.log("Updating database with new course data...");

    const bulkOps = courses.map((c) => ({
        replaceOne: {
            filter: { classDisplayName: c.classDisplayName },
            replacement: c,
            upsert: true,
        },
    }));

    const options = bulkWriteOptions as MongooseBulkWriteOptions;

    const res = await CourseModel.bulkWrite(bulkOps, options);

    console.log(
        `Completed updating database with new course data. Created ${res.upsertedCount} and updated ${res.modifiedCount} course objects.`,
    );
};

const updateClasses = async () => {
    const headers = {
        app_id: config.sis.CLASS_APP_ID,
        app_key: config.sis.CLASS_APP_KEY,
    };

    const activeSemesters = await SemesterModel.find({ active: true }).lean();
    const classes: ClassType[] = [];

    for (const s of activeSemesters) {
        console.log(`Updating classses for ${s.term} ${s.year}...`);

        const params = {
            "term-id": semToTermId(s),
            "page-size": 100,
        };

        const semesterClasses = await queryPages<ClassType>(
            SIS_CLASS_URL,
            params,
            headers,
            "classes",
        );
        classes.push(...semesterClasses);
    }

    console.log("Updating database with new class data...");
    const bulkOps = classes.map((c) => ({
        replaceOne: {
            filter: { displayName: c.displayName },
            replacement: c,
            upsert: true,
        },
    }));

    const options = bulkWriteOptions as MongooseBulkWriteOptions;

    const res = await ClassModel.bulkWrite(bulkOps, options);

    console.log(
        `Completed updating database with new class data. Created ${res.upsertedCount} and updated ${res.modifiedCount} class objects.`,
    );
};

const updateSections = async () => {
    const headers = {
        app_id: config.sis.CLASS_APP_ID,
        app_key: config.sis.CLASS_APP_KEY,
    };

    const activeSemesters = await SemesterModel.find({ active: true }).lean();
    const sections: SectionType[] = [];

    for (const s of activeSemesters) {
        console.log(`Updating sections for ${s.term} ${s.year}...`);

        const params = {
            "term-id": semToTermId(s),
            "page-size": 100,
        };

        const semesterClasses = await queryPages<SectionType>(
            SIS_SECTION_URL,
            params,
            headers,
            "classSections",
        );
        sections.push(...semesterClasses);
    }

    console.log("Updating database with new section data...");
    const bulkOps = sections.map((s) => ({
        replaceOne: {
            filter: { displayName: s.displayName },
            replacement: s,
            upsert: true,
        },
    }));

    const options = bulkWriteOptions as MongooseBulkWriteOptions;

    const res = await SectionModel.bulkWrite(bulkOps, options);

    console.log(
        `Completed updating database with new section data. Created ${res.upsertedCount} and updated ${res.modifiedCount} section objects.`,
    );
};

(async () => {
  try {
    await mongooseLoader();

    console.log("\n=== UPDATE COURSES ===");
    await updateCourses();

    console.log("\n=== UPDATE CLASSES ===");
    await updateClasses();

    console.log("\n=== UPDATE SECTIONS ===");
    await updateSections();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }

  process.exit(0);
})();
