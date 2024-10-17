import { UserType } from "@repo/common";

import { UserModule } from "./generated-types/module-types";

export type IntermediateUser = Omit<
  UserModule.User,
  "bookmarkedClasses" | "bookmarkedCourses"
> & {
  bookmarkedCourses: UserModule.BookmarkedCourseInput[];
  bookmarkedClasses: UserModule.BookmarkedClassInput[];
};

export const formatUser = (user: UserType) => {
  return {
    email: user.email,
    student: user.email.endsWith("@berkeley.edu"),
    bookmarkedCourses: user.bookmarkedCourses,
    bookmarkedClasses: user.bookmarkedClasses,
  } as IntermediateUser;
};
