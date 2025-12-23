import { S3Client } from "@aws-sdk/client-s3";

import { config } from "../../../../packages/common/src/utils/config";

/**
 * Creates an S3 client configured for Minio using the environment variables.
 * Minio is S3-compatible, so we can use the AWS SDK S3Client with a custom endpoint.
 */
export const createS3Client = (): S3Client => {
  return new S3Client({
    endpoint: config.s3.endpoint,
    region: "us-east-1", // Minio doesn't care about region, but SDK requires it
    credentials: {
      accessKeyId: config.s3.accessKeyId,
      secretAccessKey: config.s3.secretAccessKey,
    },
    forcePathStyle: true, // Required for Minio
  });
};
