import { RedisClientType, createClient } from "redis"
import { config } from "../../config";

export default async (): Promise<RedisClientType> => {
    return await createClient({ url: config.redisUri }).connect() as RedisClientType;
}