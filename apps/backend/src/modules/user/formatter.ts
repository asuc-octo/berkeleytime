import { UserType } from "@repo/common/models";

import type { FormattedUser } from "../../types/user";

export const formatUser = (user: UserType): FormattedUser => {
  return {
    _id: String(user._id),
    email: user.email,
    staff: user.staff,
    name: user.name,
    student: user.email.endsWith("@berkeley.edu"),
    majors: user.majors ? user.majors : [],
    minors: user.minors ? user.minors : [],
  };
};
