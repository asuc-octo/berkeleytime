import { User } from "../../generated-types/graphql";
import { formatUser } from "./formatter";
import { UserModel, UserType } from "./model";

export async function getById(google_id: String): Promise<User> {
    const user = await UserModel.findOne({ google_id: google_id });
    return formatUser(user as UserType);
}
