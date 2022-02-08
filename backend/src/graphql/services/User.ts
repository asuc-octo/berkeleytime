import { Service, Inject } from "typedi"

@Service()
export class UserService {
  constructor(@Inject("userModel") private readonly UserModel) {}

  async getAll() {
    return this.UserModel.find()
  }
}
