import express from "express"
import { ApolloServer } from "apollo-server-express"
import { Server as IoServer } from "socket.io"
import { Server as HttpServer } from "http"
import "express-async-errors"

import "./env.js"

const app = express()
const apollo = new ApolloServer({})
const http = new HttpServer(app)

apollo.applyMiddleware({ app: app, path: "/graphql" })

// Uncomment when you are ready to play with websockets.
// const io = new IoServer(http)
// const sockets = {}
// io.on("connection", (socket) => {
//     sockets[socket.id] = socket
//     socket.on("disconnect", (reason) => {
//         delete sockets[socket.id]
//     })
// })

// Generic error handler for uncaught exceptions, from express-async-errors
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err)
    return res.status(500).json({ error: err.stack })
})

http.listen(process.env.PORT_EXPRESS, () => {
    console.log(`Server now listening on port ${process.env.PORT_EXPRESS}`)
})