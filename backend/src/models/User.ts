import { IsEmail, Length } from "class-validator"
import { Field, ObjectType } from "type-graphql"

import { CourseSchema } from "#src/models/Course"

import { getModelForClass, Ref } from "@typegoose/typegoose"
import Typegoose from "@typegoose/typegoose"

// cannot just import @prop, @plugin because https://github.com/typegoose/typegoose/issues/214

@ObjectType()
export class UserSchema {
  @Field()
  readonly _id: string

  @Field()
  readonly _created: Date

  @Field()
  readonly _updated: Date

  @Field()
  @Typegoose.prop()
  access_token_expiration: Date

  @Field()
  @Typegoose.prop()
  access_token: string

  @Field()
  @Typegoose.prop()
  activated: boolean

  @Field()
  @Typegoose.prop()
  activation_token: string

  @Field()
  @Typegoose.prop({ default: null })
  @Length(1, 255)
  bio: string

  @Field(() => [CourseSchema])
  @Typegoose.prop({ ref: CourseSchema })
  @Length(1, 30)
  classes_saved: Ref<CourseSchema>[]

  @Field(() => [CourseSchema])
  @Typegoose.prop({ ref: CourseSchema })
  @Length(1, 30)
  classes_watching: Ref<CourseSchema>[]

  @Field()
  @Typegoose.prop({ default: false })
  notify_update_classes: boolean

  @Field()
  @Typegoose.prop({ default: false })
  notify_update_grades: boolean

  @Field()
  @Typegoose.prop({ default: false })
  notify_update_berkeleytime: boolean

  @Field()
  @Typegoose.prop()
  @IsEmail()
  email: string

  @Field()
  @Typegoose.prop()
  google_id: string

  @Field()
  @Typegoose.prop()
  jwt: string

  @Field()
  @Typegoose.prop()
  name: string

  @Field()
  @Typegoose.prop()
  password: string

  get name_given() {
    if (this.name) {
      return this.name.split(" ")[0]
    }
  }
  get name_family() {
    if (this.name) {
      return this.name.split(" ").slice(-1)[0]
    }
  }
}

export const User = getModelForClass(UserSchema, {
  schemaOptions: {
    collection: "user",
    optimisticConcurrency: true,
    timestamps: { createdAt: "_created", updatedAt: "_updated" },
    toObject: { virtuals: true },
    toJSON: {
      /* Can use toJSON() as the method for public-facing responses */
      getters: true,
      virtuals: true,
      transform: (doc, ret, options) => {
        delete ret.activation_token
        delete ret.activated
        delete ret.password
        return ret
      },
    },
    versionKey: "_version",
  },
})
