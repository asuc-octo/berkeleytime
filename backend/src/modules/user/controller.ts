import { formatUser } from "./formatter";
import { UserModel } from "./model";

export async function users() {
  const users = await UserModel.find();

  return users.map(formatUser);
}
