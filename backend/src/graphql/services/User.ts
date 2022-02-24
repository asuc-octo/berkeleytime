import { Container, Service, Inject } from "typedi";

import { User_Model } from "#src/models/_index";

import { ReturnModelType } from "@typegoose/typegoose";

@Service()
export class service {
  constructor(
    @Inject(User_Model.collection.collectionName)
    private readonly model: ReturnModelType<typeof User_Model>
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

Container.set(User_Model.collection.collectionName, User_Model);
export const UserService = Container.get(service);
