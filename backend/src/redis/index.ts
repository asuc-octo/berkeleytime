import { RedisClientType, createClient } from "redis";
import { config } from "../config";

class RedisConnection {
    client: RedisClientType|null = null;

    async load() {
        this.client = createClient({ url: config.REDIS_URI });
        await this.client.connect();
        this.client.on('error', (err) => console.log('Redis Client Error', err));
    };
    isActive() : boolean {
        return this.client != null;
    }
    quit() {
        this.client?.quit();
    }

    async get(controller:string, parameters:string[]) : Promise<any> {
        if(!this.client) return null;
        const res = await this.client.get(`${controller}/${parameters.join("/")}`);
        if(res){
            const parsed = JSON.parse(res, function(k, v) { 
                // make sure dates are actually a date so ApolloGQL is happy
                if (k == "lastUpdated") return new Date(v);
                return v;
            } );
            return parsed;
        }
        return null;
    }

    set(controller:string, parameters:string[], data:any) {
        if(this.client) this.client.set(`${controller}/${parameters.join("/")}`, JSON.stringify(data));
    }
}

const redis = new RedisConnection();

async function cache(controller : Function, ...args: any[]) {
    
    const cacheData = await redis.get("getCatalog", args.map((v) => JSON.stringify(v)));
    if(cacheData){
        return cacheData;
    }

    const resp = await controller(...args);

    redis.set("getCatalog", args.map((v) => JSON.stringify(v)), resp);

    return resp;

}

export { redis, cache };

