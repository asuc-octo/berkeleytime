import { createHash } from "crypto"
import _ from "lodash"
import mongoose from "mongoose"

import { URL_MDB } from "#src/config"
import { redisClient } from "#src/services/redis"

const DEFAULT_TTL = 60
const originalExec = mongoose.Query.prototype.exec

export interface IMongooseCacheOptions {
  ttl?: number
  key?: string
  flag?: boolean | string
  ttlExtend?: boolean
}

/* useNewUrlParser to fix warning --> (node:57275)
 * DeprecationWarning: current URL string parser is deprecated,
 * and will be removed in a future version. To use the new parser,
 * pass option { useNewUrlParser: true } to MongoClient.connect. */
/* useUnifiedTopology to fix warning --> (node:57231)
 * DeprecationWarning: current Server Discovery and Monitoring
 * engine is deprecated, and will be removed in a future version.
 * To use the new Server Discover and Monitoring engine, pass option
 * { useUnifiedTopology: true } to the MongoClient constructor. */
mongoose.connect(URL_MDB)
mongoose.connection.on("open", () => {
  console.log("********** MongoDB Successfully Connected **********")
})
if (process.env.NODE_ENV != "prod") {
  await import("colors")

  // mongoose.set("debug", function (collectionName, method, query, doc) {
  //   console.log(
  //     "Mongoose: ".cyan +
  //       collectionName +
  //       "." +
  //       method +
  //       " (" +
  //       JSON.stringify(query, null, 2) +
  //       ")"
  //   )
  // })
}

// Mongoose + Redis caching
// https://github.com/evsar3/mongoose-ultimate-redis-cache/blob/8068a114b634d09c89e0c2b8f376e03b6b3801c0/src/index.ts

mongoose.Query.prototype["cache"] = function (
  options?: IMongooseCacheOptions | number
): mongoose.Query<any, any> {
  this._cacheEnabled = true
  this._key = null
  this._ttl = DEFAULT_TTL
  if (typeof options === "number") {
    this._ttl = options
  } else if (options !== undefined) {
    this._key = options.key
    this._ttl = options.ttl ?? DEFAULT_TTL
    this._ttlExtend = options.ttlExtend
    this._flag =
      typeof options.flag === "boolean"
        ? options.flag
          ? "cache"
          : undefined
        : options.flag
  }
  return this
}
mongoose.Query.prototype.exec = async function (): Promise<
  mongoose.QueryCursor<mongoose.Document>
> {
  if (this._cacheEnabled !== true) {
    return originalExec.apply(this, arguments)
  }
  const key =
    this._key ??
    createHash("md5")
      .update(
        JSON.stringify({
          ...{
            name: this._collection.collectionName,
            conditions: this._conditions,
            fields: this._fields,
            options: this._options,
          },
        })
      )
      .digest("hex")
  const cachedResult = await redisClient.get(key)
  if (cachedResult !== null) {
    const result: Object | Object[] = JSON.parse(cachedResult)
    if (this._ttlExtend === true) {
      redisClient.set(key, cachedResult, { EX: this._ttl })
    }
    let models: any = []
    if (Array.isArray(result)) {
      result.forEach((item) => {
        const model = new this.model(item)
        model[this._flag] = true
        models.push(model)
      })
    } else {
      const model = new this.model(result)
      model[this._flag] = true
      models = model
    }
    return models
  }
  const result = await originalExec.apply(this, arguments)
  if (result !== null) {
    redisClient.set(key, JSON.stringify(result), { EX: this._ttl })
  }
  return result
}
mongoose.Model["purgeCacheKey"] = (key: string) => redisClient.del(key)
