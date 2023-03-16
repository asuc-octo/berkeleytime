import { User } from "../../generated-types/graphql";
import { formatUser } from "./formatter";
import { UserModel, UserType } from "./model";

export async function getByEmail(email: string): Promise<User> {
    const user = await UserModel.findOne({ email });

    if (!user) {
        throw new Error("User not found");
    }

    return formatUser(user as UserType);
}

// for testing
export async function changeFirstName(email: string, first_name: string) {
    await UserModel.findOneAndUpdate({ email }, { first_name }, { new: true });
}
