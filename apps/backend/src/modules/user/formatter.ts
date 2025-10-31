import { UserType } from "@repo/common";

import { UserModule } from "./generated-types/module-types";

interface UserRelationships {
  bookmarkedCourses: UserModule.BookmarkedCourseInput[];
  bookmarkedClasses: UserModule.BookmarkedClassInput[];
  monitoredClasses: UserModule.MonitoredClassInput[];
}

export type IntermediateUser = Omit<UserModule.User, keyof UserRelationships> &
  UserRelationships;

export const formatUser = (user: UserType) => {
  return {
    _id: user._id,
    email: user.email,
    staff: user.staff,
    name: user.name,
    student: user.email.endsWith("@berkeley.edu"),
    bookmarkedCourses: user.bookmarkedCourses,
    bookmarkedClasses: user.bookmarkedClasses,
    monitoredClasses: user.monitoredClasses,
    notificationsOn: user.notificationsOn,
    majors: user.majors ? user.majors : [],
    minors: user.minors ? user.minors : [],
  } as IntermediateUser;
};
