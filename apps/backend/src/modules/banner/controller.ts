import { createHash } from "crypto";
import type { Request } from "express";
import { GraphQLError } from "graphql";
import type { RedisClientType } from "redis";

import {
  BannerModel,
  BannerViewCountModel,
  StaffMemberModel,
} from "@repo/common/models";

import { getClientIP } from "../../utils/ip";
import { formatBanner } from "./formatter";

// Context interface for authenticated requests
export interface BannerRequestContext {
  user: {
    _id: string;
    isAuthenticated: boolean;
  };
}

// Helper to verify the current user is a staff member
export const requireStaffMember = async (context: BannerRequestContext) => {
  if (!context.user?._id) {
    throw new GraphQLError("Not authenticated", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  const staffMember = await StaffMemberModel.findOne({
    userId: context.user._id,
  }).lean();

  if (!staffMember) {
    throw new GraphQLError("Only staff members can perform this action", {
      extensions: { code: "FORBIDDEN" },
    });
  }

  return staffMember;
};

export interface CreateBannerInput {
  text: string;
  link?: string | null;
  linkText?: string | null;
  persistent: boolean;
  reappearing: boolean;
  clickEventLogging?: boolean | null;
}

export interface UpdateBannerInput {
  text?: string | null;
  link?: string | null;
  linkText?: string | null;
  persistent?: boolean | null;
  reappearing?: boolean | null;
  clickEventLogging?: boolean | null;
}

export const getAllBanners = async (redis: RedisClientType) => {
  const banners = await BannerModel.find().sort({ createdAt: -1 });

  // Get view counts for all banners (always tracked now)
  const bannersWithViews = await Promise.all(
    banners.map(async (banner) => {
      const viewCount = await getBannerViewCount(banner._id.toString(), redis);
      return formatBanner(banner, viewCount);
    })
  );

  return bannersWithViews;
};

export const createBanner = async (
  context: BannerRequestContext,
  input: CreateBannerInput
) => {
  // Verify caller is a staff member
  await requireStaffMember(context);

  const banner = await BannerModel.create({
    text: input.text,
    link: input.link || undefined,
    linkText: input.linkText || undefined,
    persistent: input.persistent,
    reappearing: input.reappearing,
    clickEventLogging: input.clickEventLogging ?? false,
  });

  return formatBanner(banner, 0);
};

export const updateBanner = async (
  context: BannerRequestContext,
  bannerId: string,
  input: UpdateBannerInput
) => {
  // Verify caller is a staff member
  await requireStaffMember(context);

  const updateData: Record<string, unknown> = {};
  if (input.text !== null && input.text !== undefined) {
    updateData.text = input.text;
  }
  if (input.link !== null && input.link !== undefined) {
    updateData.link = input.link || undefined;
  }
  if (input.linkText !== null && input.linkText !== undefined) {
    updateData.linkText = input.linkText || undefined;
  }
  if (input.persistent !== null && input.persistent !== undefined) {
    updateData.persistent = input.persistent;
  }
  if (input.reappearing !== null && input.reappearing !== undefined) {
    updateData.reappearing = input.reappearing;
  }
  if (
    input.clickEventLogging !== null &&
    input.clickEventLogging !== undefined
  ) {
    updateData.clickEventLogging = input.clickEventLogging;
  }

  const banner = await BannerModel.findByIdAndUpdate(bannerId, updateData, {
    new: true,
  });

  if (!banner) {
    throw new GraphQLError("Banner not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  return formatBanner(banner, 0);
};

export const deleteBanner = async (
  context: BannerRequestContext,
  bannerId: string
) => {
  // Verify caller is a staff member
  await requireStaffMember(context);

  const result = await BannerModel.findByIdAndDelete(bannerId);
  return result !== null;
};

export const incrementBannerClick = async (bannerId: string) => {
  const banner = await BannerModel.findByIdAndUpdate(
    bannerId,
    { $inc: { clickCount: 1 } },
    { new: true }
  );

  if (!banner) {
    throw new GraphQLError("Banner not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  return formatBanner(banner, 0);
};

export const incrementBannerDismiss = async (bannerId: string) => {
  const banner = await BannerModel.findByIdAndUpdate(
    bannerId,
    { $inc: { dismissCount: 1 } },
    { new: true }
  );

  if (!banner) {
    throw new GraphQLError("Banner not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  return formatBanner(banner, 0);
};

// View tracking constants
const BANNER_VIEW_DEDUPE_TTL_SECONDS = 30 * 60;
const BANNER_VIEW_RATE_LIMIT_TTL_SECONDS = 60 * 60;
const BANNER_VIEW_RATE_LIMIT_MAX = 100;

const getBannerViewCounterKey = (bannerId: string) =>
  `banner-view-counter:${bannerId}`;

export const trackBannerView = async (
  bannerId: string,
  req: Request,
  redis: RedisClientType
): Promise<{ success: boolean; rateLimited?: boolean }> => {
  const clientIp = getClientIP(req);

  const rateLimitKey = `banner-view-rate-limit:${clientIp}`;
  const count = await redis.incr(rateLimitKey);
  if (count === 1) {
    await redis.expire(rateLimitKey, BANNER_VIEW_RATE_LIMIT_TTL_SECONDS);
  }

  if (count > BANNER_VIEW_RATE_LIMIT_MAX) {
    return { success: false, rateLimited: true };
  }

  const userSessionId = req.sessionID || clientIp;
  const userAgent = req.get("user-agent") || "unknown";

  const fingerprint = createHash("sha256")
    .update(`${userSessionId}:${userAgent}:${bannerId}`)
    .digest("hex");

  const dedupeKey = `banner-view-dedupe:${fingerprint}`;

  const exists = await redis.exists(dedupeKey);
  if (exists) {
    return { success: true };
  }

  await redis.set(dedupeKey, "1", { EX: BANNER_VIEW_DEDUPE_TTL_SECONDS });

  const counterKey = getBannerViewCounterKey(bannerId);
  await redis.incr(counterKey);

  return { success: true };
};

export const getBannerViewCount = async (
  bannerId: string,
  redis: RedisClientType
): Promise<number> => {
  const counterKey = getBannerViewCounterKey(bannerId);

  const redisCount = await redis.get(counterKey);
  const pendingViews = redisCount ? parseInt(redisCount, 10) : 0;

  const viewDoc = await BannerViewCountModel.findOne({ bannerId }).lean();
  const mongoViews = viewDoc?.viewCount ?? 0;

  return pendingViews + mongoViews;
};

export const flushBannerViewCounts = async (
  redis: RedisClientType
): Promise<{ flushed: number; errors: number }> => {
  const keys: string[] = [];
  let cursor = "0";
  do {
    const result = await redis.scan(cursor, {
      MATCH: "banner-view-counter:*",
      COUNT: 100,
    });
    cursor = String(result.cursor);
    keys.push(...result.keys);
  } while (cursor !== "0");

  // Deduplicate keys - Redis SCAN may return duplicates during hash table resizing
  const uniqueKeys = [...new Set(keys)];

  if (uniqueKeys.length === 0) {
    return { flushed: 0, errors: 0 };
  }

  const operations: Array<{
    updateOne: {
      filter: { bannerId: string };
      update: { $inc: { viewCount: number } };
      upsert: boolean;
    };
  }> = [];

  for (const key of uniqueKeys) {
    const value = await redis.get(key);
    if (!value) continue;

    const count = parseInt(value, 10);
    if (isNaN(count) || count === 0) continue;

    const bannerId = key.replace("banner-view-counter:", "");
    if (!bannerId) continue;

    operations.push({
      updateOne: {
        filter: { bannerId },
        update: { $inc: { viewCount: count } },
        upsert: true,
      },
    });
  }

  if (operations.length === 0) {
    return { flushed: 0, errors: 0 };
  }

  try {
    const result = await BannerViewCountModel.bulkWrite(operations, {
      ordered: false,
    });

    // Delete Redis keys only after successful Mongo write
    for (const key of uniqueKeys) {
      await redis.del(key);
    }

    return { flushed: result.modifiedCount + result.upsertedCount, errors: 0 };
  } catch {
    return { flushed: 0, errors: operations.length };
  }
};
