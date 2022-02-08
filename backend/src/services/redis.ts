import redis from "redis"

import { URL_REDIS } from "#src/config"

export const redisClient = redis.createClient({
  url: `rediss://default:E56dMwqNSQwppVGx@rpi.berkeleytime.com:6379`,
})
await redisClient.connect()
await redisClient.sendCommand(["CONFIG", "SET", "notify-keyspace-events", "Ex"])

const subscriber = redisClient.duplicate()
await subscriber.connect()

await subscriber.subscribe(`__keyevent@0__:expired`, (message, channel) => {
  console.log(`${channel}: ${message}`)
})
