import { IsEmail, Length } from "class-validator";
import * as GQL from "type-graphql";

import { SIS_Course_Schema } from "#src/models/SIS_Course";

import Typegoose from "@typegoose/typegoose";

// cannot just import @prop, @plugin because https://github.com/typegoose/typegoose/issues/214

@GQL.ObjectType()
export class User_Schema {
  @GQL.Field(() => GQL.ID)
  readonly _id: Typegoose.mongoose.Types.ObjectId;

  @GQL.Field()
  @Typegoose.prop()
  readonly _created: Date;

  @GQL.Field()
  @Typegoose.prop()
  readonly _updated: Date;

  @GQL.Field()
  @Typegoose.prop()
  access_token: string;

  @GQL.Field()
  @Typegoose.prop({ default: null })
  @Length(1, 255)
  bio: string;

  @GQL.Field(() => [SIS_Course_Schema])
  @Typegoose.prop({ ref: SIS_Course_Schema })
  @Length(1, 30)
  classes_saved: Typegoose.Ref<SIS_Course_Schema>[];

  @GQL.Field(() => [SIS_Course_Schema])
  @Typegoose.prop({ ref: SIS_Course_Schema })
  @Length(1, 30)
  classes_watching: Typegoose.Ref<SIS_Course_Schema>[];

  @GQL.Field(() => [User_Schema])
  @Typegoose.prop({ autopopulate: true, ref: User_Schema })
  @Length(1, 30)
  friends: Typegoose.Ref<User_Schema>[];

  @GQL.Field()
  @Typegoose.prop({ default: false })
  notify_update_classes: boolean;

  @GQL.Field()
  @Typegoose.prop({ default: false })
  notify_update_grades: boolean;

  @GQL.Field()
  @Typegoose.prop({ default: false })
  notify_update_berkeleytime: boolean;

  @GQL.Field()
  @Typegoose.prop()
  @IsEmail()
  email: string;

  @GQL.Field()
  @Typegoose.prop()
  google_id: string;

  @GQL.Field()
  @Typegoose.prop()
  name: string;

  @GQL.Field()
  @Typegoose.prop()
  refresh_token: string;

  @GQL.Field(() => String)
  public name_given(): String {
    return this?.name?.split(" ")[0];
  }

  @GQL.Field(() => String)
  public name_family(): String {
    return this?.name?.split(" ").slice(-1)[0];
  }
}

export const User_Model = Typegoose.getModelForClass(User_Schema, {
  schemaOptions: {
    collection: "user",
    optimisticConcurrency: true,
    timestamps: { createdAt: "_created", updatedAt: "_updated" },
    toObject: { virtuals: true },
    toJSON: {
      getters: true,
      virtuals: true,
      transform: (doc, ret, options) => {
        delete ret.activation_token;
        delete ret.activated;
        delete ret.password;
        return ret;
      },
    },
    versionKey: "_version",
  },
});
