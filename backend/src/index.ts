import "#src/env"

import axios from "axios"
import events from "events"
import express from "express"
import "express-async-errors"
import { Server as HttpServer } from "http"
import passport from "passport"
import "reflect-metadata"

import apollo from "#src/apollo"
import { PORT_EXPRESS } from "#src/config"
import { sis_classes, sis_courses, users } from "#src/routes/_index"
import "#src/services/gcloud"
import "#src/services/mongodb"
import "#src/services/passport"

events.defaultMaxListeners = 200

axios.defaults.headers["Accept"] = "application/json"
const app = express()
app.use(express.urlencoded({ extended: true }) as express.RequestHandler)
app.use(passport.initialize())

const http = new HttpServer(app)

const apiRouter = express.Router()
app.use("/api", apiRouter)
apiRouter.use("/sis_classes", sis_classes)
apiRouter.use("/sis_courses", sis_courses)
apiRouter.use("/users", users)
apiRouter.use((err: any, {}, res: express.Response, {}) => {
  console.error(err)
  return res.status(500).json({ error: err.stack })
})
http.listen(PORT_EXPRESS, () => {
  console.log(`Server now listening on port ${PORT_EXPRESS}`)
})

await apollo(app)
