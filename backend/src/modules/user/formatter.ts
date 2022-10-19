import { UserModule } from "./generated-types/module-types";
import { UserType } from "./model";

export function formatUser(user: UserType): UserModule.User {
  return {
    id: user._id.toString(),
    google_id: user.google_id,
    email: user.email,
  };
}
