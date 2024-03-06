import * as Minio from 'minio';
import { config } from "../config";
import * as Fs from "fs";

const getBucketExists = async (client : Minio.Client) => {
    return await client.bucketExists(config.s3.mongo_backup_bucket)
}

(async () => {

    const client = new Minio.Client({
        endPoint: config.s3.endpoint,
        port: config.s3.port,
        useSSL: config.s3.endpoint != "minio",
        accessKey: config.s3.access_key_id,
        secretKey: config.s3.secret_access_key,
    })

    const exists = await getBucketExists(client)

    if (!exists) {
        console.error("Bucket does not exist")
        return
    }

    if (process.argv.length < 3) {
        console.error("Please give timestamp argument")
        return
    }

    const timeStamp = parseInt(process.argv[2])

    const objectStream = client.listObjectsV2(config.s3.mongo_backup_bucket, timeStamp + "/dump/bt/")

    const objects:string[] = []

    objectStream.on("data", (chunk : any) => {
        objects.push(chunk.name)
    })

    objectStream.on("end", () => {
        Fs.mkdir(`/backend/dump/bt`, { recursive: true }, (err) => { console.error(err) })
        objects.forEach(async (objectName) => {
            const dataStream = await client.getObject(config.s3.mongo_backup_bucket, objectName)
            const fileStream = Fs.createWriteStream("/backend/" + objectName.substring(timeStamp.toString().length + 1))
            fileStream.on("open", () => {
                dataStream.on("data", (chunk : any) => {
                    fileStream.write(chunk)
                })
                dataStream.on("end", () => {
                    fileStream.close()
                    console.log(`${"/backend/" + objectName.substring(timeStamp.toString().length + 1)} done writing`)
                })
            })
        })
    })

})();