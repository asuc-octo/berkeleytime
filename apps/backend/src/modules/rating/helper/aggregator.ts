import { FilterQuery } from "mongoose";

import {
  AggregatedMetricsModel,
  RatingModel,
  SectionModel,
} from "@repo/common";

import { Semester } from "../../../generated-types/graphql";

export const ratingAggregator = async (filter: FilterQuery<any>) => {
  return await AggregatedMetricsModel.aggregate([
    {
      $match: filter,
    },
    {
      $group: {
        _id: {
          subject: "$subject",
          courseNumber: "$courseNumber",
          classNumber: "$classNumber",
          semester: "$semester",
          year: "$year",
          metricName: "$metricName",
        },
        totalCount: { $sum: "$categoryCount" },
        sumValues: {
          $sum: { $multiply: ["$categoryValue", "$categoryCount"] },
        },
        categories: {
          $push: { value: "$categoryValue", count: "$categoryCount" },
        },
      },
    },
    {
      $group: {
        _id: {
          subject: "$_id.subject",
          courseNumber: "$_id.courseNumber",
          classNumber: "$_id.classNumber",
          semester: "$_id.semester",
          year: "$_id.year",
        },
        metrics: {
          $push: {
            metricName: "$_id.metricName",
            count: "$totalCount",
            weightedAverage: {
              $cond: [
                { $eq: ["$totalCount", 0] },
                0,
                { $divide: ["$sumValues", "$totalCount"] },
              ],
            },
            categories: "$categories",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        subject: "$_id.subject",
        courseNumber: "$_id.courseNumber",
        classNumber: "$_id.classNumber",
        semester: "$_id.semester",
        year: "$_id.year",
        metrics: 1,
      },
    },
  ]);
};

export const userRatingsAggregator = async (context: any) => {
  return await RatingModel.aggregate([
    { $match: { createdBy: context.user._id } },
    {
      $group: {
        _id: {
          createdBy: "$createdBy",
          subject: "$subject",
          courseNumber: "$courseNumber",
          semester: "$semester",
          year: "$year",
          classNumber: "$classNumber",
        },
        metrics: {
          $push: {
            metricName: "$metricName",
            value: "$value",
            // updatedAt: "$updatedAt" - not sure how to do the typedef
          },
        },
        updatedAt: { $max: "$updatedAt" },
      },
    },
    {
      $group: {
        _id: {
          createdBy: "$_id.createdBy",
        },
        classes: {
          $push: {
            subject: "$_id.subject",
            courseNumber: "$_id.courseNumber",
            semester: "$_id.semester",
            year: "$_id.year",
            classNumber: "$_id.classNumber",
            metrics: "$metrics",
            lastUpdated: { $max: "$updatedAt" },
          },
        },
        totalCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        createdBy: "$_id.createdBy",
        count: "$totalCount",
        classes: 1,
      },
    },
  ]);
};

export const userClassRatingsAggregator = async (
  context: any,
  subject: string,
  courseNumber: string,
  semester: Semester,
  year: number,
  classNumber: string
) => {
  if (!context.user._id) throw new Error("Unauthorized");
  return await RatingModel.aggregate([
    {
      $match: {
        createdBy: context.user._id,
        subject: subject,
        courseNumber: courseNumber,
        semester: semester,
        year: year,
        classNumber: classNumber,
      },
    },
    {
      $group: {
        _id: {
          subject: "$subject",
          courseNumber: "$courseNumber",
          semester: "$semester",
          year: "$year",
          classNumber: "$classNumber",
        },
        metrics: {
          $push: {
            metricName: "$metricName",
            value: "$value",
          },
        },
        updatedAt: { $max: "$updatedAt" },
      },
    },
    {
      $project: {
        _id: 0,
        subject: "$_id.subject",
        courseNumber: "$_id.courseNumber",
        semester: "$_id.semester",
        year: "$_id.year",
        classNumber: "$_id.classNumber",
        metrics: 1,
        lastUpdated: "$updatedAt",
      },
    },
  ]);
};

export const semestersByInstructorAggregator = async (
  professorName: string,
  subject: string,
  courseNumber: string
) => {
  const displayName = subject + " " + courseNumber;
  return await SectionModel.aggregate([
    {
      $match: {
        "class.course.displayName": displayName,
        "component.code": "LEC",
        "meetings.assignedInstructors.instructor.names.formattedName":
          professorName,
      },
    },
    {
      $group: {
        _id: "$class.session.term.name",
      },
    },
    {
      $match: {
        _id: { $ne: null },
      },
    },
  ]);
};

export const courseRatingAggregator = async (
  subject: string,
  courseNumber: string
) => {
  return await AggregatedMetricsModel.aggregate([
    {
      $match: {
        subject,
        courseNumber,
        categoryCount: { $gt: 0 },
      },
    },
    {
      $group: {
        _id: {
          subject: "$subject",
          courseNumber: "$courseNumber",
          metricName: "$metricName",
          categoryValue: "$categoryValue",
        },
        categoryCount: { $sum: "$categoryCount" },
      },
    },
    {
      $group: {
        _id: {
          subject: "$_id.subject",
          courseNumber: "$_id.courseNumber",
          metricName: "$_id.metricName",
        },
        totalCount: { $sum: "$categoryCount" },
        sumValues: {
          $sum: { $multiply: ["$_id.categoryValue", "$categoryCount"] },
        },
        categories: {
          $push: {
            value: "$_id.categoryValue",
            count: "$categoryCount",
          },
        },
      },
    },
    {
      $group: {
        _id: {
          subject: "$_id.subject",
          courseNumber: "$_id.courseNumber",
        },
        metrics: {
          $push: {
            metricName: "$_id.metricName",
            count: "$totalCount",
            weightedAverage: {
              $cond: [
                { $eq: ["$totalCount", 0] },
                0,
                { $divide: ["$sumValues", "$totalCount"] },
              ],
            },
            categories: "$categories",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        subject: "$_id.subject",
        courseNumber: "$_id.courseNumber",
        semester: null,
        year: null,
        classNumber: null,
        metrics: 1,
      },
    },
  ]);
};
