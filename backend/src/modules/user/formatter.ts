import { UserModule } from "./generated-types/module-types";
import { UserType } from "./model";

export function formatUser(user: UserType): UserModule.User {
    return Object.assign({
        id: user._id as string,
        password: user.password as string,
        is_superuser: user.is_superuser as boolean,
        username: user.username as string,
        first_name: user.first_name as string,
        last_name: user.last_name as string,
        email: user.email as string,
        is_staff: user.is_staff as boolean,
        is_active: user.is_active as boolean,
        date_joined: user.date_joined as string,
    },
        user.last_login === null ? null : { last_login: user.last_login },
        user.major === null ? [null] : { major: user.major },
        user.email_class_update === null ? null : { last_login: user.email_class_update },
        user.email_grade_update === null ? null : { last_login: user.email_grade_update },
        user.email_enrollment_opening === null ? null : { last_login: user.email_enrollment_opening },
        user.email_berkeleytime_update === null ? null : { last_login: user.email_berkeleytime_update }
    );
}
