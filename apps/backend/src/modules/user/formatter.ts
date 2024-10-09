import { UserType } from "@repo/common";

import { UserModule } from "./generated-types/module-types";

export const formatUser = (user: UserType) => {
  return {
    email: user.email,
    student: user.email.endsWith("@berkeley.edu"),
  } as UserModule.User;
};
