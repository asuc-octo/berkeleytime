import * as Minio from 'minio';
import * as child from 'child_process';
import * as Fs from "fs";
import { config } from "../config";

const ensureBucketExists = async (client : Minio.Client) => {
    const exists = await client.bucketExists(config.s3.mongo_backup_bucket)
    if (!exists) {
        const res = await client.makeBucket(config.s3.mongo_backup_bucket)
        console.log(`Bucket ${config.s3.mongo_backup_bucket} created`)
    } 
    const lifecycleConfig = {
        Rule: [
          {
            ID: 'Transition and Expiration Rule',
            Status: 'Enabled',
            Filter: {
              Prefix: '',
            },
            Expiration: {
              Days: '7',
            },
          },
        ],
      }
      
    const err = await client.setBucketLifecycle(config.s3.mongo_backup_bucket, lifecycleConfig)
    if (err != null) {
        console.error("Could not set bucket lifecycle")
    }
}

const error = async (client : Minio.Client, toDelete : string[]) => {
    client.removeObjects(config.s3.mongo_backup_bucket, toDelete, (e) => {
        if (e) {
            console.error("Unable to delete incorrect objects. Please do so manually.")
        }
    });
}

(async () => {

    const client = new Minio.Client({
        endPoint: config.s3.endpoint,
        port: config.s3.port,
        useSSL: config.s3.endpoint != "minio",
        accessKey: config.s3.access_key_id,
        secretKey: config.s3.secret_access_key,
    })

    await ensureBucketExists(client)

    const dump = child.spawn("mongodump", ["--uri", config.mongoDB.uri])

    console.log("RUNNING MONGODUMP\n---------------------\n")

    const dumpedFiles:string[] = [];
    
    const fileFinder = new RegExp(/(?:writing )(.*)(?: to )(.*)\n/)
    dump.stderr.on('data', (data) => {
        // mongodump output goes by default to stderr
        const matches = data.toString().match(fileFinder)
        if (matches != null) {
            dumpedFiles.push(matches[2])
            dumpedFiles.push(matches[2].substring(0, matches[2].length - 5) + ".metadata.json")
        }
        console.log(data.toString())
    });
    
    dump.on('close', (code) => {
        if (code != 0) {
            console.error('mongodump failed')
            process.exit(1);
        }
        const complete:string[] = []
        let puts = 0
        const folderName = (new Date()).getTime().toString()
        console.log(`--------------------------\nSAVING BACKUP TO: ${folderName} \n\n`)
        let errored = false
        dumpedFiles.forEach((file:string) => {
            const fileStream = Fs.createReadStream(file)
            Fs.stat(file, (err, stats) => {
                if (err) {
                    errored = true
                    return
                }
                const name = `${folderName}/${file}`
                client.putObject(config.s3.mongo_backup_bucket, name, fileStream, stats.size, (err:any, objInfo:any) => {
                    puts++
                    if (err) {
                        console.error(err) // err should be null
                        errored = true
                    } else {
                        console.log('Object Created:', objInfo)
                        complete.push(name)
                    }
                    if (puts == dumpedFiles.length) {
                        if (errored) {
                            error(client, complete)
                            console.log("\n--------------------\nBACKUP FAILED")
                        } else {
                            console.log("\n--------------------\nBACKUP SUCCESSFUL")
                        }
                    }
                })
            })
        })
        
    }); 

})();