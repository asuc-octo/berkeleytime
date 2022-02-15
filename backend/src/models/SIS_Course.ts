import mongoose from "mongoose";
import timeMachine from "mongoose-time-machine";

const SIS_CourseSchema = new mongoose.Schema(
  {},
  {
    collection: "sis_course",
    id: false,
    minimize: false,
    strict: false,
    timestamps: { createdAt: "_created", updatedAt: "_updated" },
    toJSON: {
      getters: true,
      transform: (doc, ret, options) => {
        delete ret._created;
        delete ret._id;
        delete ret._updated;
        delete ret._version;
        delete ret.id;
        return ret;
      },
    },
    versionKey: "_version",
  }
);

SIS_CourseSchema.plugin(timeMachine.plugin, {
  name: "sis_course_history",
  omit: ["_updated"],
});

export const SIS_Course = mongoose.model("sis_course", SIS_CourseSchema);
