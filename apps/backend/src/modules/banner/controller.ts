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
import {
  createInitialVersionEntry,
  createSnapshotFromInput,
  createVersionEntry,
  detectChangedFields,
} from "./version-service";

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
  visible?: boolean | null;
}

export interface UpdateBannerInput {
  text?: string | null;
  link?: string | null;
  linkText?: string | null;
  persistent?: boolean | null;
  reappearing?: boolean | null;
  clickEventLogging?: boolean | null;
  visible?: boolean | null;
}

/**
 * Get all visible banners for public display.
 * Filters out banners explicitly marked as hidden (visible === false).
 */
export const getVisibleBanners = async (redis: RedisClientType) => {
  // Only return banners that are explicitly visible (or default to visible)
  const banners = await BannerModel.find({ visible: { $ne: false } }).sort({
    createdAt: -1,
  });

  // Get view counts for all banners (always tracked now)
  const bannersWithViews = await Promise.all(
    banners.map(async (banner) => {
      const viewCount = await getBannerViewCount(banner._id.toString(), redis);
      return formatBanner(banner, viewCount);
    })
  );

  return bannersWithViews;
};

/**
 * Get all banners for staff dashboard (includes hidden banners).
 * Staff members need to see all banners to manage visibility.
 */
export const getAllBannersForStaff = async (redis: RedisClientType) => {
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

  // Create initial snapshot and version entry for the new banner
  const snapshot = createSnapshotFromInput(input);
  const initialVersionEntry = createInitialVersionEntry(snapshot);

  const banner = await BannerModel.create({
    text: input.text,
    link: input.link === "" || input.link === null ? null : input.link,
    linkText:
      input.linkText === "" || input.linkText === null ? null : input.linkText,
    persistent: input.persistent,
    reappearing: input.reappearing,
    clickEventLogging: input.clickEventLogging ?? false,
    visible: input.visible ?? true,
    currentVersion: 1,
    versionHistory: [initialVersionEntry],
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

  // First, fetch the current banner to detect changes
  const currentBanner = await BannerModel.findById(bannerId);
  if (!currentBanner) {
    throw new GraphQLError("Banner not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  const updateData: Record<string, unknown> = {};
  if (input.text !== null && input.text !== undefined) {
    updateData.text = input.text;
  }
  if (input.link !== undefined) {
    // Use null to signal "clear the field" (empty string → null), preserving version tracking
    updateData.link =
      input.link === "" || input.link === null ? null : input.link;
  }
  if (input.linkText !== undefined) {
    // Use null to signal "clear the field" (empty string → null), preserving version tracking
    updateData.linkText =
      input.linkText === "" || input.linkText === null ? null : input.linkText;
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
  if (input.visible !== null && input.visible !== undefined) {
    updateData.visible = input.visible;
  }

  // Detect which fields actually changed
  const changedFields = detectChangedFields(currentBanner, updateData);

  // If any versioned fields changed, create a new version entry
  if (changedFields.length > 0) {
    // Apply updates to get the new state for the snapshot
    const updatedBannerData = {
      text: (updateData.text as string) ?? currentBanner.text,
      link:
        updateData.link !== undefined ? updateData.link : currentBanner.link,
      linkText:
        updateData.linkText !== undefined
          ? updateData.linkText
          : currentBanner.linkText,
      persistent:
        (updateData.persistent as boolean) ?? currentBanner.persistent,
      reappearing:
        (updateData.reappearing as boolean) ?? currentBanner.reappearing,
      clickEventLogging:
        (updateData.clickEventLogging as boolean) ??
        currentBanner.clickEventLogging,
      visible: (updateData.visible as boolean) ?? currentBanner.visible,
    };

    const snapshot = createSnapshotFromInput(
      updatedBannerData as {
        text: string;
        link?: string | null;
        linkText?: string | null;
        persistent: boolean;
        reappearing: boolean;
        clickEventLogging?: boolean | null;
      }
    );
    const currentVersion = currentBanner.currentVersion ?? 1;
    const newVersionEntry = createVersionEntry(
      currentVersion,
      changedFields,
      snapshot
    );

    // Atomically update the banner with new version entry and incremented version
    updateData.currentVersion = currentVersion + 1;
    updateData.$push = { versionHistory: newVersionEntry };
  }

  // Separate $push from regular fields for MongoDB update
  const { $push, ...regularUpdateData } = updateData;
  const updateOperation: Record<string, unknown> = { $set: regularUpdateData };
  if ($push) {
    updateOperation.$push = $push;
  }

  // Use optimistic locking: include currentVersion in the query filter
  // to prevent concurrent updates from overwriting each other
  const expectedVersion = currentBanner.currentVersion ?? 1;
  const banner = await BannerModel.findOneAndUpdate(
    { _id: bannerId, currentVersion: expectedVersion },
    updateOperation,
    { new: true }
  );

  if (!banner) {
    // Check if banner exists but version changed (concurrent edit)
    const exists = await BannerModel.exists({ _id: bannerId });
    if (exists) {
      throw new GraphQLError(
        "Banner was modified by another user. Please refresh and try again.",
        { extensions: { code: "CONFLICT" } }
      );
    }
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

  // Track the count we read for each key to decrement later
  const keyCountMap = new Map<string, number>();

  for (const key of uniqueKeys) {
    const value = await redis.get(key);
    if (!value) continue;

    const count = parseInt(value, 10);
    if (isNaN(count) || count === 0) continue;

    const bannerId = key.replace("banner-view-counter:", "");
    if (!bannerId) continue;

    keyCountMap.set(key, count);
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

    // Decrement only the counts we flushed, preserving any new views added after our read
    for (const [key, count] of keyCountMap) {
      const remaining = await redis.decrBy(key, count);
      // Clean up keys that are now zero or negative
      if (remaining <= 0) {
        await redis.del(key);
      }
    }

    return { flushed: result.modifiedCount + result.upsertedCount, errors: 0 };
  } catch {
    return { flushed: 0, errors: operations.length };
  }
};
