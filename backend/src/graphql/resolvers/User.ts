import { Arg, FieldResolver, Resolver, Query, Root } from "type-graphql";

import { UserService } from "#src/graphql/services/User";
import { UserSchema } from "#src/models/_index";

@Resolver(() => UserSchema)
export class UserResolver {
  constructor(private readonly service: UserService) {}

  @Query(() => [UserSchema])
  async users() {
    return this.service.getAll();
  }

  @Query(() => UserSchema)
  user(@Arg("id") id: string, @Arg("email") email: string) {
    return this.service.get({ id });
  }

  @FieldResolver()
  _id(@Root() root: UserSchema) {
    return root._id;
  }

  @FieldResolver()
  access_token_expiration(@Root() root: UserSchema) {
    return root.access_token_expiration;
  }

  @FieldResolver()
  access_token(@Root() root: UserSchema) {
    return root.access_token;
  }

  @FieldResolver()
  activated(@Root() root: UserSchema) {
    return root.activated;
  }

  @FieldResolver()
  activation_token(@Root() root: UserSchema) {
    return root.activation_token;
  }

  @FieldResolver()
  bio(@Root() root: UserSchema) {
    return root.bio;
  }

  @FieldResolver()
  classes_saved(@Root() root: UserSchema) {
    return root.classes_saved;
  }

  @FieldResolver()
  classes_watching(@Root() root: UserSchema) {
    return root.classes_watching;
  }

  @FieldResolver()
  friends(@Root() root: UserSchema) {
    const { _id } = root;
    return this.service.friends(_id);
  }

  @FieldResolver()
  notify_update_classes(@Root() root: UserSchema) {
    return root.notify_update_classes;
  }

  @FieldResolver()
  notify_update_grades(@Root() root: UserSchema) {
    return root.notify_update_grades;
  }

  @FieldResolver()
  notify_update_berkeleytime(@Root() root: UserSchema) {
    return root.notify_update_berkeleytime;
  }

  @FieldResolver()
  email(@Root() root: UserSchema) {
    return root.email;
  }

  @FieldResolver()
  google_id(@Root() root: UserSchema) {
    return root.google_id;
  }

  @FieldResolver()
  jwt(@Root() root: UserSchema) {
    return root.jwt;
  }

  @FieldResolver()
  name(@Root() root: UserSchema) {
    return root.name;
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
