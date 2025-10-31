import {
  ClassModel,
  CourseModel,
  IClassItem,
  ICourseItem,
  UserModel,
} from "@repo/common";

import { UpdateUserInput } from "../../generated-types/graphql";
import { formatClass } from "../class/formatter";
import { formatCourse } from "../course/formatter";
import { formatUser } from "./formatter";
import { UserModule } from "./generated-types/module-types";

export const getUser = async (context: any) => {
  if (!context.user._id) throw new Error("Unauthorized");

  const user = await UserModel.findById(context.user._id);

  if (!user) throw new Error("Not found");

  return formatUser(user);
};

export const updateUser = async (context: any, user: UpdateUserInput) => {
  if (!context.user._id) throw new Error("Unauthorized");

  const updatedUser = await UserModel.findByIdAndUpdate(
    context.user._id,
    user,
    { new: true }
  );

  if (!updatedUser) throw new Error("Invalid");

  return formatUser(updatedUser);
};

export const getBookmarkedCourses = async (
  bookmarkedCourses: UserModule.BookmarkedCourseInput[]
) => {
  const courses = [];

  for (const bookmarkedCourse of bookmarkedCourses) {
    const course = await CourseModel.findOne({
      subject: bookmarkedCourse.subject,
      number: bookmarkedCourse.number,
    })
      .sort({ fromDate: -1 })
      .lean();

    if (!course) continue;

    courses.push(course as ICourseItem);
  }

  return courses.map(formatCourse);
};

export const getBookmarkedClasses = async (
  bookmarkedClasses: UserModule.BookmarkedClassInput[]
) => {
  const classes = [];

  for (const bookmarkedClass of bookmarkedClasses) {
    const _class = await ClassModel.findOne({
      year: bookmarkedClass.year,
      semester: bookmarkedClass.semester,
      sessionId: bookmarkedClass.sessionId ? bookmarkedClass.sessionId : "1",
      subject: bookmarkedClass.subject,
      courseNumber: bookmarkedClass.courseNumber,
      number: bookmarkedClass.number,
    }).lean();

    if (!_class) continue;

    classes.push(_class as IClassItem);
  }

  return classes.map(formatClass);
};

export const getMonitoredClasses = async (
  monitoredClasses: UserModule.MonitoredClassInput[] | UserModule.MonitoredClass[]
) => {
  const classes = [];

  for (const monitoredClass of monitoredClasses) {
    const classData = monitoredClass.class;

    const _class = await ClassModel.findOne({
      year: classData.year,
      semester: classData.semester,
      sessionId: classData.sessionId ? classData.sessionId : "1",
      subject: classData.subject,
      courseNumber: classData.courseNumber,
      number: classData.number,
    }).lean();

    if (!_class) continue;

    classes.push({
      class: formatClass(_class),
      thresholds: monitoredClass.thresholds,
    });
  }

  return classes;
}