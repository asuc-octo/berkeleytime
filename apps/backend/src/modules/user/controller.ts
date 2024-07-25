import { omitBy } from "lodash";
import { ObjectId } from "mongodb";

import { UserModel, UserType } from "@repo/common";

import { UserInput } from "../../generated-types/graphql";
import { formatUser } from "./formatter";

function resolveAndFormat(user: UserType | null) {
  if (!user) {
    throw new Error("User not found");
  }

  return formatUser(user);
}

export async function getUserById(id: ObjectId) {
  const user = await UserModel.findById(id).lean();

  return resolveAndFormat(user as UserType);
}

export async function updateUserInfo(id: ObjectId, newUserInfo: UserInput) {
  // remove explicitly set null values
  newUserInfo = omitBy(newUserInfo, (value) => value == null);

  const user = await UserModel.findByIdAndUpdate(id, newUserInfo, {
    new: true,
    lean: true,
  });

  return resolveAndFormat(user as UserType);
}

export async function deleteUser(id: ObjectId) {
  const user = await UserModel.findByIdAndDelete(id, { lean: true });

  return resolveAndFormat(user as UserType);
}
