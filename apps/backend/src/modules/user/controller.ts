import { UserModel } from "@repo/common";

import { formatUser } from "./formatter";

export const getUser = async (context: any) => {
  if (!context.user._id) throw new Error("Unauthorized");

  const user = await UserModel.findById(context.user._id);

  if (!user) throw new Error("Not found");

  return formatUser(user);
};
