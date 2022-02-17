import {
  GCLOUD_BUCKET,
  GCLOUD_REGION,
  GCLOUD_SERVICE_ACCOUNT_EMAIL,
  GCLOUD_SERVICE_ACCOUNT_PRIVATE_KEY,
} from "#src/config";

import * as gcs from "@google-cloud/storage";

/**
 * Helpful links:
 * https://cloud.google.com/storage/docs/creating-buckets#storage-create-bucket-nodejs
 * https://github.com/googleapis/nodejs-storage/blob/master/samples/ls.js
 *
 * Helpful commands for checking IAM permissions:
 * gsutil acl get gs://berkeleytime-218606
 * gsutil acl ch -u bt-backend-staging@berkeleytime-218606.iam.gserviceaccount.com:READ gs://berkeleytime-218606
 * gsutil acl ch -d bt-backend-staging@berkeleytime-218606.iam.gserviceaccount.com:READ gs://berkeleytime-218606
 */

/**
 * TODO: Make it so backend can only create keys with a certain prefix
 *
 * ! Backend application has access to ALL resources inside berkeleytime-218606
 *
 * ! If the backend application is hijacked, a malicious actor can really
 * ! screw up the backup images and basically all resources stored inside bucket
 * ! berkeleytime-218606
 * ! Service accounts:
 * ! - bt-backend-staging@berkeleytime-218606.iam.gserviceaccount.com
 * ! - bt-backend-prod@berkeleytime-218606.iam.gserviceaccount.com
 */

class storage extends gcs.Storage {
  currentBucket: gcs.Bucket;
  constructor({ bucketName, ...opts }) {
    super({
      credentials: {
        client_email: GCLOUD_SERVICE_ACCOUNT_EMAIL,
        private_key: GCLOUD_SERVICE_ACCOUNT_PRIVATE_KEY,
      },
    });
    this.currentBucket = this.bucket(bucketName);
  }
  bucketExists = async () => {
    return (await this.currentBucket?.exists())[0];
  };
  bucketCreate = async (bucketName) => {
    const [bucket] = await this.createBucket(bucketName, {
      location: GCLOUD_REGION,
      storageClass: "STANDARD",
    });
    console.info(`Bucket ${bucket.name} created`);
  };
  ls = async (opts: gcs.GetFilesOptions): Promise<gcs.File[]> => {
    const [files] = await this.currentBucket.getFiles(opts);
    return files;
  };
  upload = async ({
    key,
    data,
    fileOptions,
    fileSaveOptions,
  }: {
    key: string;
    data: string | Buffer;
    fileOptions?: gcs.FileOptions;
    fileSaveOptions?: gcs.SaveOptions;
  }): Promise<gcs.File> => {
    const file = await this.currentBucket.file(key, fileOptions);
    await file.save(data, fileSaveOptions);
    return file;
  };
}

export const storageClient = new storage({
  bucketName: GCLOUD_BUCKET,
  credentials: {
    client_email: GCLOUD_SERVICE_ACCOUNT_EMAIL,
    private_key: GCLOUD_SERVICE_ACCOUNT_PRIVATE_KEY,
  },
});
try {
  if (!(await storageClient.bucketExists())) {
    await storageClient.bucketCreate(GCLOUD_BUCKET);
  }
} catch (error) {
  console.error(error);
  console.error(
    `ERROR! Resource access failure in Google Cloud Storage Bucket named "${GCLOUD_BUCKET}"! Program will now exit!`
      .red
  );
  process.exit(1);
}
