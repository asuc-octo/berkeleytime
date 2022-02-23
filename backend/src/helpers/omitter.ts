/***********************************************************************************************************************
 * the purpose is to remove all extra keys inserted by Mongoose
 * during the deep object comparison (_.isEqual) between SIS API's returned data and
 * what currently exists in the database
 ***********************************************************************************************************************/

const OMIT_KEYS = ["_created", "_id", "_updated", "_version"];

export default function omitter(state) {
  if (state) {
    for (const key of Object.keys(state)) {
      if (OMIT_KEYS.includes(key) || state[key] === undefined) {
        delete state[key];
      }
      if (typeof state[key] == "object") {
        omitter(state[key]);
      }
    }
  }
}
