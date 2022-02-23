import { Arg, Resolver, Query } from "type-graphql";

import { UserService } from "#src/graphql/services/User";
import { UserSchema } from "#src/models/_index";

@Resolver(() => UserSchema)
export class UserResolver {
  constructor(private readonly service: typeof UserService) {
    this.service = UserService;
  }

  @Query(() => [UserSchema])
  async users() {
    return this.service.getAll();
  }

  @Query(() => UserSchema)
  user(@Arg("id") id: string, @Arg("email") email: string) {
    return this.service.get({ id });
  }

  // @Mutation(() => User)
  // async register(
  //   @Arg("input") { firstName, lastName, email, password }: RegisterInput
  // ): Promise<User> {
  //   password = await bcrypt.hashSync(password, 12);
  //   const user = await new UserModel({
  //     firstName,
  //     lastName,
  //     email,
  //     password,
  //   }).save();
  //   const obj = _.pick(user, ["_id", "firstName", "lastName", "email"]);
  //   return Object.setPrototypeOf(obj, new User());
  // }
}
