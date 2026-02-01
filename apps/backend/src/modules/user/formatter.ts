import { UserType } from "@repo/common/models";

import { UserModule } from "./generated-types/module-types";

export const formatUser = (user: UserType): UserModule.User => {
  return {
    _id: user._id as unknown as string,
    email: user.email,
    staff: user.staff,
    name: user.name,
    student: user.email.endsWith("@berkeley.edu"),
    majors: user.majors ? user.majors : [],
    minors: user.minors ? user.minors : [],
  };
};
