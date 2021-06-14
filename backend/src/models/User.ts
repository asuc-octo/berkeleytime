import { IsEmail, Length } from "class-validator"
import { Field, ObjectType } from "type-graphql"

import { CourseClass } from "#src/models/Course"

import { prop, getModelForClass } from "@typegoose/typegoose"

@ObjectType()
export class UserClass {
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

  @Field(() => [CourseClass])
  @prop({ ref: CourseClass })
  @Length(1, 30)
  classes_saved: CourseClass[]

  @Field(() => [CourseClass])
  @prop({ ref: CourseClass })
  @Length(1, 30)
  classes_watching: CourseClass[]

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

export const User = getModelForClass(UserClass, {
  schemaOptions: {
    toObject: { virtuals: true },
    collection: "users",
    timestamps: true,
    optimisticConcurrency: true,
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
  },
})
