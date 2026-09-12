import { PutObjectCommand } from "@aws-sdk/client-s3";
import {
  type Application,
  type Request,
  type RequestHandler,
  type Response,
} from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

import { config } from "../../../../../packages/common/src/utils/config";
import { createS3Client } from "../../utils/s3Client";
import { requireStaffMember } from "./controller";

// Configure multer to handle file uploads in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

const requireStaffUploadAccess: RequestHandler = async (req, res, next) => {
  try {
    const userId = (req.user as { _id?: { toString(): string } | string })?._id;
    await requireStaffMember({
      user: {
        _id: userId?.toString() ?? "",
        isAuthenticated: req.isAuthenticated(),
      },
    });
    next();
  } catch (error) {
    const code = (error as { extensions?: { code?: string } }).extensions?.code;
    res.status(code === "FORBIDDEN" ? 403 : 401).json({
      error:
        code === "FORBIDDEN"
          ? "Staff access required"
          : "Authentication required",
    });
  }
};

const parseImageUpload: RequestHandler = (req, res, next) => {
  upload.single("image")(req, res, (error: unknown) => {
    if (!error) {
      next();
      return;
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "LIMIT_FILE_SIZE"
    ) {
      res
        .status(400)
        .json({ error: "File too large. Maximum file size is 5MB" });
      return;
    }

    res.status(400).json({ error: "Invalid image upload" });
  });
};

function detectImageType(buffer: Buffer) {
  if (
    buffer.length >= 8 &&
    buffer
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return { extension: "png", contentType: "image/png" };
  }
  if (
    buffer.length >= 3 &&
    buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))
  ) {
    return { extension: "jpg", contentType: "image/jpeg" };
  }
  const signature = buffer.subarray(0, 12).toString("ascii");
  if (signature.startsWith("GIF87a") || signature.startsWith("GIF89a")) {
    return { extension: "gif", contentType: "image/gif" };
  }
  if (signature.startsWith("RIFF") && signature.slice(8, 12) === "WEBP") {
    return { extension: "webp", contentType: "image/webp" };
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(4, 8).toString("ascii") === "ftyp" &&
    ["avif", "avis"].includes(buffer.subarray(8, 12).toString("ascii"))
  ) {
    return { extension: "avif", contentType: "image/avif" };
  }
  return null;
}

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
    requireStaffUploadAccess,
    parseImageUpload,
    async (req: Request, res: Response): Promise<void> => {
      try {
        if (!req.file) {
          res.status(400).json({
            error:
              "No image file provided. Please upload a file with field name 'image'",
          });
          return;
        }

        const imageType = detectImageType(req.file.buffer);
        if (!imageType) {
          res.status(400).json({ error: "Invalid or unsupported image file" });
          return;
        }

        // Generate a server-controlled filename and extension based on the
        // file signature, never the client-supplied name or MIME type.
        const fileName = `${uuidv4()}.${imageType.extension}`;

        // Create S3 client
        const s3Client = createS3Client();

        // Upload to S3
        const putCommand = new PutObjectCommand({
          Bucket: "images",
          Key: fileName,
          Body: req.file.buffer,
          ContentType: imageType.contentType,
        });

        await s3Client.send(putCommand);

        // Return the file path/name (adjust this based on how you want to construct the URL)
        res.status(200).json({
          success: true,
          fileName,
          url: `${config.s3.imagesAccessUrl}/${fileName}`, // You may want to construct a full URL here if needed
        });
      } catch (error: unknown) {
        console.error("[Staff Upload API] Error:", error);

        res.status(500).json({
          error: "Failed to upload image",
        });
      }
    }
  );
};
