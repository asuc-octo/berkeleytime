import { User } from "../../generated-types/graphql";
import { formatUser } from "./formatter";
import { UserModel, UserType } from "./model";

async function getUserModel(email: string): Promise<UserType> {
    const user = await UserModel.findOne({ email });

    if (!user) {
        throw new Error("User not found");
    }

    return user;
}

export async function getUserByEmail(email: string): Promise<User> {
    const user = await getUserModel(email);

    return formatUser(user as UserType);
}

export async function updateUserInfo(
    email: string,
    username: string,
    first_name: string,
    last_name: string
) {
    const user = await getUserModel(email);

    user.username = username === null ? user.username : username;
    user.first_name = first_name === null ? user.first_name : first_name;
    user.last_name = last_name === null ? user.last_name : last_name;

    await user.save();
}

export async function updateUserMajor(email: string, major: string[]) {
    const user = await getUserModel(email);

    user.major = major === null ? user.major : major;

    await user.save();
}

export async function updateUserEmailPreferences(
    email: string,
    email_class_update: boolean,
    email_grade_update: boolean,
    email_enrollment_opening: boolean,
    email_berkeleytime_update: boolean
) {
    const user = await getUserModel(email);

    user.email_class_update = email_class_update == null ? user.email_class_update : email_class_update;
    user.email_grade_update = email_grade_update == null ? user.email_grade_update : email_grade_update;
    user.email_enrollment_opening = email_enrollment_opening == null ? user.email_enrollment_opening : email_enrollment_opening;
    user.email_berkeleytime_update = email_berkeleytime_update == null ? user.email_berkeleytime_update : email_berkeleytime_update;

    await user.save();
}
