import { UserModule } from "./generated-types/module-types";
import { UserType } from "../../models/user";

export function formatUser(user: UserType): UserModule.User {
    return {
        ...user,
        last_login: user.last_login.toISOString(),
        date_joined: user.createdAt.toISOString(),
    };
}