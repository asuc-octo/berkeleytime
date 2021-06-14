import "#src/env"

import bodyParser from "body-parser"
import express from "express"
import "express-async-errors"
import { Server as HttpServer } from "http"

import { EXPIRE_TIME_REDIS_KEY, PORT_EXPRESS } from "#src/config"
import { apolloServer } from "#src/graphql/index"
import { Fruit } from "#src/models/_index"
import { users } from "#src/routes/_index"
import courses from "#src/routes/courses"
import "#src/services/mongodb"
import { redisClient } from "#src/services/redis"

const app = express()
app.use(bodyParser.urlencoded({ extended: true })) // converts application/x-www-form-urlencoded to applicaton/json

const http = new HttpServer(app)
await redisClient.setAsync("ASDF", "hello", "EX", EXPIRE_TIME_REDIS_KEY)

apolloServer.applyMiddleware({ app, path: "/graphql" })
console.log(await Fruit.find({ name: "Mango" }))

const apiRouter = express.Router()
app.use("/api", apiRouter)
apiRouter.use("/courses", courses) // eg: http://localhost:5000/api/users/register
apiRouter.use("/users", users) // eg: http://localhost:5000/api/courses/xxx
apiRouter.use(
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
