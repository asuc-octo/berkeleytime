import { UserModule } from "./generated-types/module-types";
import { UserType } from "./model";

export function formatUser(user: UserType): UserModule.User {
    return Object.assign({
        name: user.name as string,
        google_id: user.google_id as string,
        email: user.email as string
    },
        user.majors === null ? null : { majors: user.majors },
        user.classes_saved === null ? null : { classes_saved: user.classes_saved },
        user.schedules === null ? null : { schedules: user.schedules });
}
