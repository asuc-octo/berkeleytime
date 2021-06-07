import "#src/env"

import express from "express"
import "express-async-errors"
import { Server as HttpServer } from "http"

import { EXPIRE_TIME_REDIS_KEY, PORT_EXPRESS } from "#src/config"
import { apolloServer } from "#src/graphql/index"
import Fruit from "#src/models/Fruit"
import courses from "#src/routes/courses"
import "#src/services/mongodb"
import { redisClient } from "#src/services/redis"

const app = express()
const http = new HttpServer(app)
await redisClient.setAsync("ASDF", "hello", "EX", EXPIRE_TIME_REDIS_KEY)

apolloServer.applyMiddleware({ app, path: "/graphql" })
console.log(await Fruit.findOne({ name: "Mango" }))

app.use("/api", courses)
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err)
    return res.status(500).json({ error: err.stack })
  }
)

http.listen(PORT_EXPRESS, () => {
  console.log(`Server now listening on port ${PORT_EXPRESS}`)
})
