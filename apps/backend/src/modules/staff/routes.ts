import { PutObjectCommand } from "@aws-sdk/client-s3";
import { type Application, type Request, type Response } from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

import { config } from "../../../../../packages/common/src/utils/config";
import { createS3Client, ensureBucketExists } from "../../utils/s3Client";

// Configure multer to handle file uploads in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

/**
 * POST /api/uploadStaffImage
 *
 * Uploads an image file to the S3 bucket configured for staff photos.
 *
 * Request:
 * - Content-Type: multipart/form-data
 * - Body: FormData with 'image' field containing the image file
 *
 * Response:
 * {
 *   "success": true,
 *   "url": "path/to/uploaded/image.jpg"
 * }
 */
export default (app: Application): void => {
  app.post(
    "/uploadStaffImage",
    upload.single("image"),
    async (req: Request, res: Response): Promise<void> => {
      try {
        if (!req.file) {
          res.status(400).json({
            error:
              "No image file provided. Please upload a file with field name 'image'",
          });
          return;
        }

        // Generate unique filename
        const fileExtension = req.file.originalname.split(".").pop() || "jpg";
        const fileName = `${uuidv4()}.${fileExtension}`;

        // Create S3 client
        const s3Client = createS3Client();

        // Ensure bucket exists (create if it doesn't)
        await ensureBucketExists(config.s3StaffPhotosBucket, s3Client);

        // Upload to S3
        const putCommand = new PutObjectCommand({
          Bucket: config.s3StaffPhotosBucket,
          Key: fileName,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        });

        await s3Client.send(putCommand);

        // Return the file path/name (adjust this based on how you want to construct the URL)
        res.status(200).json({
          success: true,
          fileName,
          url: `http://${config.isDev ? "localhost" : config.s3Endpoint}:${config.s3Port}/${config.s3StaffPhotosBucket}/${fileName}`, // You may want to construct a full URL here if needed
        });
      } catch (error: any) {
        console.error("[Staff Upload API] Error:", error);

        // Handle multer errors
        if (
          error instanceof Error &&
          error.message === "Only image files are allowed"
        ) {
          res.status(400).json({
            error: "Invalid file type. Only image files are allowed",
          });
          return;
        }

        // Handle file size errors
        if (error.code === "LIMIT_FILE_SIZE") {
          res.status(400).json({
            error: "File too large. Maximum file size is 5MB",
          });
          return;
        }

        res.status(500).json({
          error: "Failed to upload image",
          message: error.message,
        });
      }
    }
  );
};
