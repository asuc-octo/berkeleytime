import type { Semester } from "../../generated-types/graphql";
import {
    DiscussionModel,
} from "@repo/common";


export type classIdentifier = {
  subject: string;
  courseNumber: string;
  classNumber: string;
  year: number;
  semester: Semester;
};

export type commentCreator = classIdentifier & {
  value: string;
};


export const getAggregatedComments = async (
  _context: any,
  input: classIdentifier
) => {

    const comments = await DiscussionModel.find({
        subject: input.subject,
        courseNumber: input.courseNumber,
        year: input.year,
        semester: input.semester,
        classNumber: input.classNumber,
    });

  return {
    comments,
    total: comments.length,
  };
};

export const createComment = async (
  context: any,
  input: commentCreator
) => {

  await DiscussionModel.create({
    createdBy: context.user._id,
    subject: input.subject,
    courseNumber: input.courseNumber,
    classNumber: input.classNumber,
    year: input.year,
    semester: input.semester,
    value: input.value,
  });

  return true;
};
