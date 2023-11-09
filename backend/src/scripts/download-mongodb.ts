import * as Minio from 'minio';
import { config } from "../config";
import * as Fs from "fs";

const getBucketExists = async (client : Minio.Client) => {
    return await client.bucketExists(config.S3_MONGO_BACKUP_BUCKET)
}

(async () => {

    const client = new Minio.Client({
        endPoint: config.S3_ENDPOINT,
        port: config.S3_PORT,
        useSSL: config.S3_ENDPOINT != "minio",
        accessKey: config.S3_ACCESS_KEY_ID,
        secretKey: config.S3_SECRET_ACCESS_KEY,
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

    const objectStream = client.listObjectsV2(config.S3_MONGO_BACKUP_BUCKET, timeStamp + "/dump/bt/")

    const objects:string[] = []

    objectStream.on("data", (chunk : any) => {
        objects.push(chunk.name)
    })

    objectStream.on("end", () => {
        Fs.mkdir(`/backend/dump/bt`, { recursive: true }, (err) => { console.error(err) })
        objects.forEach(async (objectName) => {
            const dataStream = await client.getObject(config.S3_MONGO_BACKUP_BUCKET, objectName)
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