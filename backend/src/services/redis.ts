// @ts-nocheck
import bluebird from "bluebird"
import redis from "redis"

import { URL_REDIS } from "#src/config"

// example use
// import { redisClient } from "#src/services/redis"
// await redisClient.setAsync("ASDF", "hello", "EX", EXPIRE_TIME_REDIS_KEY)

bluebird.promisifyAll(redis)
export const redisClient = redis.createClient(URL_REDIS)
await redisClient.configAsync("SET", "notify-keyspace-events", "Ex")

// console.log when a key expires
class PubSub {
  publisher = redis.createClient(URL_REDIS)
  subscriber = redis.createClient(URL_REDIS)
  publish = (channel, message) => {
    this.publisher.publish(channel, message)
  }
  subscribe = (channel) => {
    this.subscriber.subscribe(channel)
  }
  on = (event, callback) => {
    this.subscriber.on(event, (channel, message) => {
      callback(channel, message)
    })
  }
}
const pubsub = new PubSub()
export const redisExpireEvent = (cb) => {
  pubsub.subscribe(`__keyevent@0__:expired`)
  pubsub.on("message", async (channel, message) => {
    cb({ channel, message })
  })
}

redisExpireEvent(({ channel, message }) => {
  console.log(`${channel}: ${message}`)
})
