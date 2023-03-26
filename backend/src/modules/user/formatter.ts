import { UserModule } from "./generated-types/module-types";
import { UserType } from "./model";

export function formatUser(user: UserType): UserModule.User {
    return {
        ...user,
        last_login: user.last_login.toString(),
        date_joined: user.createdAt.toString(),
    };
}
