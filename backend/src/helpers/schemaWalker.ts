import parseSchema from "mongodb-schema";
import mongoose from "mongoose";

import {
  SIS_Class_Model,
  SIS_Class_Section_Model,
  SIS_Course_Model,
} from "#src/models/_index";

const SAMPLING_SIZE = 1;

const schemaWalker = async (model) => {
  return (
    await mongoose.connection.db
      .collection(model.collection.collectionName)
      .aggregate([
        { $sample: { size: SAMPLING_SIZE } },
        { $project: { keyValue: { $objectToArray: "$$ROOT" } } },
        { $unwind: "$keyValue" },
        {
          $group: {
            _id: null,
            keys: {
              $accumulator: {
                init: function () {
                  return new Set();
                }.toString(),

                accumulate: function traverse(state, key, value, route) {
                  if (!route) {
                    if (typeof value == "object") {
                      traverse(state, key, value, key);
                    } else {
                      state[key] =
                        typeof value !== "undefined"
                          ? typeof value
                          : "undefined";
                    }
                    return state;
                  } else {
                    for (const key of Object.keys(value)) {
                      if (!isNaN(parseInt(key)) && parseInt(key) > 0) {
                        continue;
                      }
                      if (typeof value[key] == "object") {
                        traverse(state, key, value[key], `${route}.${key}`);
                      } else {
                        state[`${route}.${key}`] =
                          typeof value[key] !== "undefined"
                            ? typeof value[key]
                            : "undefined";
                      }
                    }
                  }
                }.toString(),

                accumulateArgs: ["$keyValue.k", "$keyValue.v"],

                merge: function (state1, state2) {
                  for (let key in state2) {
                    state1[key] = state2[key];
                  }
                  return state1;
                }.toString(),

                finalize: function (state) {
                  return state;
                }.toString(),
                lang: "js",
              },
            },
          },
        },
      ])
      .next()
  )?.keys;
};

for (const model of [
  SIS_Class_Model,
  SIS_Class_Section_Model,
  SIS_Course_Model,
]) {
  const s = await schemaWalker(model);
  console.info(model.collection.collectionName.red);
  console.dir(s, { depth: null });

  console.info(
    await parseSchema(
      mongoose.connection.db
        .collection(model.collection.collectionName)
        .aggregate([{ $sample: { size: SAMPLING_SIZE } }]),
      { storeValues: false }
    )
  );
  console.info("\n\n\n\n");
}
