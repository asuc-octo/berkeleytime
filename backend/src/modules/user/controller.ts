import { User } from "../../generated-types/graphql";
import { formatUser } from "./formatter";
import { UserModel, UserType } from "./model";

export async function getById(id: String): Promise<User> {
    const user = await UserModel.findById(id);

    if (!user) {
        throw new Error("User not found");
    }

    return formatUser(user as UserType);
}
