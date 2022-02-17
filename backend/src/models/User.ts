import { IsEmail, Length } from "class-validator";
import * as GQL from "type-graphql";

import { SIS_CourseSchema } from "#src/models/SIS_Course";

import Typegoose from "@typegoose/typegoose";

// cannot just import @prop, @plugin because https://github.com/typegoose/typegoose/issues/214

@GQL.ObjectType()
export class UserSchema {
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
  access_token_expiration: Date;

  @GQL.Field()
  @Typegoose.prop()
  access_token: string;

  @GQL.Field()
  @Typegoose.prop()
  activated: boolean;

  @GQL.Field()
  @Typegoose.prop()
  activation_token: string;

  @GQL.Field()
  @Typegoose.prop({ default: null })
  @Length(1, 255)
  bio: string;

  @GQL.Field(() => [SIS_CourseSchema])
  @Typegoose.prop({ ref: SIS_CourseSchema })
  @Length(1, 30)
  classes_saved: Typegoose.Ref<SIS_CourseSchema>[];

  @GQL.Field(() => [SIS_CourseSchema])
  @Typegoose.prop({ ref: SIS_CourseSchema })
  @Length(1, 30)
  classes_watching: Typegoose.Ref<SIS_CourseSchema>[];

  @GQL.Field(() => [UserSchema])
  @Typegoose.prop({ autopopulate: true, ref: UserSchema })
  @Length(1, 30)
  friends: Typegoose.Ref<UserSchema>[];

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
  jwt: string;

  @GQL.Field()
  @Typegoose.prop()
  name: string;

  @GQL.Field()
  @Typegoose.prop({ select: false })
  password: string;

  @GQL.Field(() => String)
  public name_given(): String {
    return this?.name?.split(" ")[0];
  }

  @GQL.Field(() => String)
  public name_family(): String {
    return this?.name?.split(" ").slice(-1)[0];
  }
}

export const User = Typegoose.getModelForClass(UserSchema, {
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
