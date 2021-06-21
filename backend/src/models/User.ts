import { IsEmail, Length } from "class-validator"
import { Field, ObjectType } from "type-graphql"

import { CourseSchema } from "#src/models/Course"

import { prop, getModelForClass, Ref } from "@typegoose/typegoose"

@ObjectType()
export class UserSchema {
  @Field()
  readonly _id: string

  @Field()
  @prop()
  access_token_expiration: Date

  @Field()
  @prop()
  access_token: string

  @Field()
  @prop()
  activated: boolean

  @Field()
  @prop()
  activation_token: string

  @Field()
  @prop({ default: null })
  @Length(1, 255)
  bio: string

  @Field(() => [CourseSchema])
  @prop({ ref: CourseSchema })
  @Length(1, 30)
  classes_saved: Ref<CourseSchema>[]

  @Field(() => [CourseSchema])
  @prop({ ref: CourseSchema })
  @Length(1, 30)
  classes_watching: Ref<CourseSchema>[]

  @Field()
  @prop({ default: false })
  notify_update_classes: boolean

  @Field()
  @prop({ default: false })
  notify_update_grades: boolean

  @Field()
  @prop({ default: false })
  notify_update_berkeleytime: boolean

  @Field()
  @prop()
  @IsEmail()
  email: string

  @Field()
  @prop()
  google_id: string

  @Field()
  @prop()
  jwt: string

  @Field()
  @prop()
  name: string

  @Field()
  @prop()
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
