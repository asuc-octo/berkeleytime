import { RedisClientType, createClient } from "redis";
import { config } from "../config";
import { performance } from "perf_hooks";

const REDIS_FIELD_DELIMITER = "@@"

type RedisStoreFormat = {
    isArray: boolean,
    fields: string[],
    jsonFields: number[],
    data: any[],
}

class RedisConnection {
    client: RedisClientType|null = null

    async load() {
        this.client = createClient({ url: config.REDIS_URI })
        await this.client.connect()
        this.client.on('error', (err) => console.log('Redis Client Error', err))
    };
    isActive() : boolean {
        return this.client != null
    }
    quit() {
        this.client?.quit()
    }

    async get(controller:string, parameters:string[]) : Promise<any> {
        if(!this.client) return null

        const res = await this.client.get(`${controller}/${parameters.join("/")}`)

        if(res){
            // cache hit
            const schema:RedisStoreFormat = JSON.parse(res)
            const lastUpdatedInd = schema.fields.indexOf("lastUpdated")
            const parsedData = schema.data.map((d:any) => {
                // generate GraphQL object map from array of values
                const valuesParsed:any[] = d!.split(REDIS_FIELD_DELIMITER)
                if(lastUpdatedInd > -1) valuesParsed[lastUpdatedInd] = new Date(valuesParsed[lastUpdatedInd])
                schema.jsonFields.forEach((i:number) => valuesParsed[i] = JSON.parse(valuesParsed[i], (k, v) => {
                    if(k == "lastUpdated") return new Date(v) // TO DO: other date-like fields?
                    return v
                }))
                return schema.fields.reduce((map, val:string, index:number) => {
                        return {
                            ...map,
                            [val]: valuesParsed[index],
                        }
                    }, {})
            })
            if (!schema.isArray) return parsedData[0]
            return parsedData
        }
        return null
    }

    set(controller:string, parameters:string[], data:any) {
        if(!this.client) return

        // convert non-arrays to array for data field and remember for .get
        const isArray = Array.isArray(data)
        if (!isArray) data = [data] 

        // Object fields need to be JSON.stringified
        const jsonFields:any[] = [] // saved for .get, [index, name]
        Object.keys(data[0]).forEach((k:string, index:number) => {
            if (data[0][k] instanceof Object && !(data[0][k] instanceof Date)) {
                jsonFields.push([index, k])
            }
        })

        const schemaData =  data.map((val:any) => {
            const valuesList = Object.values(val)
            // store each item in array as a object with only values
            jsonFields.forEach((t:any[]) => {
                // stringify each Object fields
                valuesList[t[0]] = JSON.stringify(val[t[1]])
            })
            return valuesList.join(REDIS_FIELD_DELIMITER)
        })


        const schema : RedisStoreFormat = {
            isArray: isArray,
            fields: Object.keys(data[0]),
            jsonFields: jsonFields.map((t:any[]) => t[0]),
            data: schemaData,
        }

        this.client.set(`${controller}/${parameters.join("/")}`, JSON.stringify(schema))
    }
}

const redis = new RedisConnection()

async function cache(controller : Function, ...args: any[]) {

    const cacheData = await redis.get("getCatalog", args.map((v) => JSON.stringify(v)))
    if(cacheData){
        // cache hit
        return cacheData
    }

    const resp = await controller(...args)
    redis.set("getCatalog", args.map((v) => JSON.stringify(v)), resp)
    return resp

}

export { redis, cache }

