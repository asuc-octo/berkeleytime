import { Resolver, Query } from "type-graphql"

import { UserService } from "#src/graphql/services/User"
import { UserSchema } from "#src/models/_index"

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [UserSchema])
  async users() {
    return this.userService.getAll()
  }
}
