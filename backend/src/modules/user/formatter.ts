import { UserModule } from "./generated-types/module-types";
import { UserType } from "./model";

export function formatUser(user: UserType): UserModule.User {
    return {
        email: user.email as string,
        username: user.username as string,
        first_name: user.first_name as string,
        last_name: user.last_name as string,
        major: user.major as string[],
        last_login: user.last_login.toString() as string,
        date_joined: user.createdAt.toString() as string,
        is_staff: user.is_staff as boolean,
        is_active: user.is_active as boolean,
        email_class_update: user.email_class_update as boolean,
        email_grade_update: user.email_grade_update as boolean,
        email_enrollment_opening: user.email_enrollment_opening as boolean,
        email_berkeleytime_update: user.email_berkeleytime_update as boolean,
    };
}
