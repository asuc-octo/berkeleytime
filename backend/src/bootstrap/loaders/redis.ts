import { Redis } from "ioredis";
import { config } from "../../config";

export let redisInstance: Redis;

async function init() {
if (!redisInstance) {
    redisInstance = new Redis(config.redis.uri);
}
}

export default init;