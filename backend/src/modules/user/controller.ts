import { ObjectId } from "mongodb";
import { UserInput } from "../../generated-types/graphql";
import { formatUser } from "./formatter";
import { UserModel, UserType } from "./model";

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
    for (const key in newUserInfo) {
        if (newUserInfo[key as  keyof UserInput] === null) {
            delete newUserInfo[key as keyof UserInput];
        }
    }

    const user = await UserModel.findByIdAndUpdate(id, newUserInfo, { new: true, lean: true });

    return resolveAndFormat(user);
}

export async function deleteUser(id: ObjectId) {
    const user = await UserModel.findByIdAndDelete(id, { lean: true });

    return resolveAndFormat(user);
}
