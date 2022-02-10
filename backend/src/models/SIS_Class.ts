import mongoose from "mongoose"
import timeMachine from "mongoose-time-machine"

const SIS_ClassSchema = new mongoose.Schema(
  {},
  {
    collection: "sis_class",
    minimize: false,
    strict: false,
    timestamps: { createdAt: "_created", updatedAt: "_updated" },
    toJSON: {
      /* Can use toJSON() as the method for public-facing responses */
      getters: true,
      transform: (doc, ret, options) => {
        delete ret._id
        delete ret._version
        delete ret.id
        delete ret._updated
        delete ret._created
        return ret
      },
    },
    versionKey: "_version",
  }
)

SIS_ClassSchema.plugin(timeMachine.plugin, { name: "sis_class_history" })

export const SIS_Class = mongoose.model("sis_class", SIS_ClassSchema)
