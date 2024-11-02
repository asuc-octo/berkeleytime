import { UserType } from "@repo/common";

import { UserModule } from "./generated-types/module-types";

interface Relationships {
  bookmarkedCourses: UserModule.BookmarkedCourseInput[];
  bookmarkedClasses: UserModule.BookmarkedClassInput[];
}

export type IntermediateUser = Omit<UserModule.User, keyof Relationships> &
  Relationships;

export const formatUser = (user: UserType) => {
  return {
    email: user.email,
    student: user.email.endsWith("@berkeley.edu"),
    bookmarkedCourses: user.bookmarkedCourses,
    bookmarkedClasses: user.bookmarkedClasses,
  } as IntermediateUser;
};
