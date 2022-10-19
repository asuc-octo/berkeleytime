import { UserType } from "./model";

export function formatUser(user: UserType) {
  return {
    id: user._id?.toString(),
    google_id: user.google_id,
    email: user.email,
  };
}
