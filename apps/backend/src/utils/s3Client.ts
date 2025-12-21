import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import { config } from "../../../../packages/common/src/utils/config";

/**
 * Creates an S3 client configured for Minio using the environment variables.
 * Minio is S3-compatible, so we can use the AWS SDK S3Client with a custom endpoint.
 */
export const createS3Client = (): S3Client => {
  const endpoint = `http://${config.s3Endpoint}:${config.s3Port}`;

  return new S3Client({
    endpoint,
    region: "us-east-1", // Minio doesn't care about region, but SDK requires it
    credentials: {
      accessKeyId: config.s3AccessKeyId,
      secretAccessKey: config.s3SecretAccessKey,
    },
    forcePathStyle: true, // Required for Minio
  });
};

/**
 * Ensures the specified bucket exists and is public. Creates it if it doesn't exist.
 * @param bucketName The name of the bucket to check/create
 * @param s3Client The S3 client to use
 */
export const ensureBucketExists = async (
  bucketName: string,
  s3Client: S3Client
): Promise<void> => {
  let bucketJustCreated = false;

  try {
    // Check if bucket exists
    await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
    // Bucket exists, no action needed
  } catch (error: any) {
    // If bucket doesn't exist (404), create it
    if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
      try {
        await s3Client.send(
          new CreateBucketCommand({
            Bucket: bucketName,
          })
        );
        console.log(`Created S3 bucket: ${bucketName}`);
        bucketJustCreated = true;
      } catch (createError: any) {
        // Ignore error if bucket was just created by another request
        if (
          createError.name !== "BucketAlreadyExists" &&
          createError.name !== "BucketAlreadyOwnedByYou"
        ) {
          throw createError;
        }
      }
    } else {
      // Some other error occurred
      throw error;
    }
  }

  // Set public bucket policy (always set it, even if bucket already existed, to ensure it's public)
  try {
    const publicPolicy = {
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "PublicReadGetObject",
          Effect: "Allow",
          Principal: "*",
          Action: "s3:GetObject",
          Resource: `arn:aws:s3:::${bucketName}/*`,
        },
      ],
    };

    await s3Client.send(
      new PutBucketPolicyCommand({
        Bucket: bucketName,
        Policy: JSON.stringify(publicPolicy),
      })
    );

    if (bucketJustCreated) {
      console.log(`Set public policy for S3 bucket: ${bucketName}`);
    }
  } catch (policyError: any) {
    // Log but don't fail if policy setting fails (bucket might already have a policy)
    console.warn(
      `Failed to set public policy for bucket ${bucketName}:`,
      policyError.message
    );
  }
};
