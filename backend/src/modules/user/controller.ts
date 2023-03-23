import { User } from "../../generated-types/graphql";
import { formatUser } from "./formatter";
import { UserModel, UserType } from "./model";

export async function getUserByEmail(email: string): Promise<User> {
    const user = await UserModel.findOne({ email });

    if (!user) {
        throw new Error("User not found");
    }

    return formatUser(user as UserType);
}

export async function updateUserInfo(
    email: string,
    username: string | undefined,
    first_name: string | undefined,
    last_name: string | undefined
) {
    await UserModel.updateOne({ email }, {
        username,
        first_name,
        last_name,
    });
}

export async function updateUserMajor(email: string, major: string[] | undefined) {
    await UserModel.updateOne({ email }, {
        major,
    });
}

export async function updateUserEmailPreferences(
    email: string,
    email_class_update: boolean | undefined,
    email_grade_update: boolean | undefined,
    email_enrollment_opening: boolean | undefined,
    email_berkeleytime_update: boolean | undefined
) {
    await UserModel.updateOne({ email }, {
        email_class_update,
        email_grade_update,
        email_enrollment_opening,
        email_berkeleytime_update,
    });
}

export async function deleteUser(email: string) {
    await UserModel.deleteOne({ email });
}
