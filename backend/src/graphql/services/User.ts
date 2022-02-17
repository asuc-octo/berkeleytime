import { Service, Inject } from "typedi";

import { User } from "#src/models/_index";

import { ReturnModelType } from "@typegoose/typegoose";

@Service()
export class UserService {
  constructor(
    @Inject(User.collection.collectionName)
    private readonly model: ReturnModelType<typeof User>
  ) {}

  async getAll() {
    return await this.model.find();
  }

  async get(fields) {
    return await this.model.findOne({
      $or: Object.keys(fields).map((key) => ({ [key]: fields[key] })),
    });
  }

  async friends(id) {
    return (
      await this.model
        .findOne({
          id: id,
        })
        .populate("friends")
    ).friends;
  }
}
