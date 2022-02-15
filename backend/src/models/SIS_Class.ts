import mongoose from "mongoose";
import timeMachine from "mongoose-time-machine";

const SIS_ClassSchema = new mongoose.Schema(
  {},
  {
    collection: "sis_class",
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
        return ret;
      },
    },
    versionKey: "_version",
  }
);

const SIS_Class_SectionSchema = new mongoose.Schema(
  {},
  {
    collection: "sis_class_section",
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
        return ret;
      },
    },
    versionKey: "_version",
  }
);

SIS_ClassSchema.plugin(timeMachine.plugin, {
  name: "sis_class_history",
  omit: ["_updated"],
});
SIS_Class_SectionSchema.plugin(timeMachine.plugin, {
  name: "sis_class_section_history",
  omit: ["_updated"],
});

export const SIS_Class = mongoose.model("sis_class", SIS_ClassSchema);
export const SIS_Class_Section = mongoose.model(
  "sis_class_section",
  SIS_Class_SectionSchema
);
