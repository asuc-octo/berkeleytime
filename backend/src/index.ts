import "#src/env"

import express from "express"
import "express-async-errors"
import { Server as HttpServer } from "http"
import passport from "passport"
import "reflect-metadata"

import apollo from "#src/apollo"
import { EXPIRE_TIME_REDIS_KEY, PORT_EXPRESS } from "#src/config"
import { User } from "#src/models/_index"
import { users } from "#src/routes/_index"
import courses from "#src/routes/courses"
import "#src/services/mongodb"
import "#src/services/passport"
import { redisClient } from "#src/services/redis"

const app = express()
app.use(express.json() as express.RequestHandler)
app.use(passport.initialize())

const http = new HttpServer(app)
await redisClient.setAsync("ASDF", "hello", "EX", EXPIRE_TIME_REDIS_KEY)

console.log(await User.find({}))

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

await apollo(app)
