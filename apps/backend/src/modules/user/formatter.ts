import { UserType } from "@repo/common";

import { UserModule } from "./generated-types/module-types";

export function formatUser(user: UserType): UserModule.User {
  return {
    ...user,
    last_login: user.last_login.toISOString(),
    date_joined: user.createdAt.toISOString(),
  };
}
