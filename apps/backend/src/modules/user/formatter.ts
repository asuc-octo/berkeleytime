import { UserType } from "@repo/common";

import { UserModule } from "./generated-types/module-types";

interface UserRelationships {
  bookmarkedCourses: UserModule.BookmarkedCourseInput[];
  bookmarkedClasses: UserModule.BookmarkedClassInput[];
}

export type IntermediateUser = Omit<UserModule.User, keyof UserRelationships> &
  UserRelationships;

export const formatUser = (user: UserType) => {
  return {
    _id: user._id,
    email: user.email,
    student: user.email.endsWith("@berkeley.edu"),
    bookmarkedCourses: user.bookmarkedCourses,
    bookmarkedClasses: user.bookmarkedClasses,
  } as IntermediateUser;
};
