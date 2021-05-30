import "./dotenv.config.mjs"

import axios from "axios"
import bodyParser from "body-parser"
import express from "express"
import "express-async-errors"
import { createServer } from "http"
import { Server } from "socket.io"

import { PORT_EXPRESS } from "#node/config"

axios.defaults.headers["Content-Type"] = "application/json"
const app = express()
const server = createServer(app)
const io = new Server(server) // Time to play with WebSockets for real-time streaming instead of HTTP polling
const sockets = {}
io.on("connection", async (socket) => {
  sockets[id] = socket.id

  socket.on("disconnect", (reason) => {
    delete sockets[socket.id]
  })
})
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Generic error handler for uncaught exceptions, from express-async-errors
app.use(async (err, req, res, next) => {
  console.error(err)
  return res.status(500).json({ error: err.stack })
})

server.listen(PORT_EXPRESS)
console.log(`Server now listening on port ${PORT_EXPRESS}`)
