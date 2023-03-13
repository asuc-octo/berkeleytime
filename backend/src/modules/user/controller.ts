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
    username: string,
    first_name: string,
    last_name: string
) {
    await UserModel.findOneAndUpdate({ email }, {
        username,
        first_name,
        last_name,
    }, { lean: true });
}

export async function updateUserMajor(email: string, major: string[]) {
    await UserModel.findOneAndUpdate({ email }, {
        major,
    }, { lean: true });
}

export async function updateUserEmailPreferences(
    email: string,
    email_class_update: boolean,
    email_grade_update: boolean,
    email_enrollment_opening: boolean,
    email_berkeleytime_update: boolean
) {
    await UserModel.findOneAndUpdate({ email }, {
        email_class_update,
        email_grade_update,
        email_enrollment_opening,
        email_berkeleytime_update,
    }, { lean: true });
}

export async function deleteUser(email: string) {
    await UserModel.deleteOne({ email });
}
