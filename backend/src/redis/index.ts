import { RedisClientType, createClient } from "redis";
import { config } from "../config";
import { Repository } from "redis-om";

let redis: RedisClientType|null = null;

export async function load() {
    redis = createClient({ url: config.REDIS_URI });
    redis.on('error', (err) => console.log('Redis Client Error', err));
    console.log(await redis.connect());
};

export {redis};

