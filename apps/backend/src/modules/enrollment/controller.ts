import { SectionModel, SectionType, TermModel } from "@repo/common";
import { ClassesAPI } from "@repo/sis-api/classes";

import { config } from "../../config";
import { Semester } from "../../generated-types/graphql";
import { formatSection } from "../class/formatter";

export const getEnrollment = async (
  year: number,
  semester: Semester,
  subject: string,
  courseNumber: string,
  number: string
) => {
  const term = await TermModel.findOne({
    name: `${year} ${semester}`,
  });

  if (!term) throw new Error("Term not found");

  const section = await SectionModel.findOne({
    "class.session.term.id": term.id,
    "class.course.subjectArea.code": subject,
    "class.course.catalogNumber.formatted": courseNumber,
    number: number,
  });

  if (!section) throw new Error("Section not found");

  const client = new ClassesAPI();

  const response = await client.v1.getClassSectionByTermAndSectionIdUsingGet(
    section.id,
    { "term-id": term.id },
    {
      headers: {
        app_key: config.sis.CLASS_APP_KEY,
        app_id: config.sis.CLASS_APP_ID,
      },
    }
  );

  const raw = response.data.apiResponse?.response.classSections?.[0];

  if (!raw) throw new Error("Something went error");

  return formatSection(raw as unknown as SectionType);
};
