import { UserModel } from "@repo/common";

import { UpdateUserInput } from "../../generated-types/graphql";
import { formatUser } from "./formatter";

export const getUser = async (context: any) => {
  if (!context.user._id) throw new Error("Unauthorized");

  const user = await UserModel.findById(context.user._id);

  if (!user) throw new Error("Not found");

  return formatUser(user);
};

export const updateUser = async (context: any, user: UpdateUserInput) => {
  if (!context.user._id) throw new Error("Unauthorized");

  const updatedUser = await UserModel.findByIdAndUpdate(
    context.user._id,
    user,
    { new: true }
  );

  if (!updatedUser) throw new Error("Invalid");

  return formatUser(updatedUser);
};
