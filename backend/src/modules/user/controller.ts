import { MutationUpdateUserInfoArgs, User } from "../../generated-types/graphql";
import { formatUser } from "./formatter";
import { UserModel, UserType } from "./model";

export async function getUserByEmail(email: string): Promise<User> {
    const user = await UserModel.findOne({ email });

    if (!user) {
        throw new Error("User not found");
    }

    return formatUser(user as UserType);
}

export async function updateUserInfo(email: string, input: MutationUpdateUserInfoArgs ) {
    await UserModel.updateOne({ email }, input);
}

export async function deleteUser(email: string) {
    await UserModel.deleteOne({ email });
}
