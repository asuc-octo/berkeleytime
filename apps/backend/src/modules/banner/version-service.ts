import { Types } from "mongoose";

import {
  BannerModel,
  BannerSnapshot,
  BannerType,
  BannerVersionEntry,
  ClickEventModel,
} from "@repo/common/models";

// Fields that are tracked in version history (editable content fields)
const VERSIONED_FIELDS = [
  "text",
  "link",
  "linkText",
  "persistent",
  "reappearing",
  "clickEventLogging",
  "visible",
] as const;

type VersionedField = (typeof VERSIONED_FIELDS)[number];

/**
 * Creates a snapshot of the current banner state for version history.
 * Only includes fields that are relevant for version tracking.
 */
export const createSnapshot = (banner: BannerType): BannerSnapshot => {
  return {
    text: banner.text,
    link: banner.link ?? undefined,
    linkText: banner.linkText ?? undefined,
    persistent: banner.persistent,
    reappearing: banner.reappearing ?? false,
    clickEventLogging: banner.clickEventLogging ?? false,
    visible: banner.visible ?? true,
  };
};

/**
 * Creates a snapshot from input data (for new banners).
 */
export const createSnapshotFromInput = (input: {
  text: string;
  link?: string | null;
  linkText?: string | null;
  persistent: boolean;
  reappearing: boolean;
  clickEventLogging?: boolean | null;
  visible?: boolean | null;
}): BannerSnapshot => {
  return {
    text: input.text,
    link: input.link ?? undefined,
    linkText: input.linkText ?? undefined,
    persistent: input.persistent,
    reappearing: input.reappearing,
    clickEventLogging: input.clickEventLogging ?? false,
    visible: input.visible ?? true,
  };
};

/**
 * Detects which fields have changed between the current banner state and an update input.
 * Returns an array of field names that have different values.
 */
export const detectChangedFields = (
  currentBanner: BannerType,
  updateInput: Record<string, unknown>
): VersionedField[] => {
  const changedFields: VersionedField[] = [];

  for (const field of VERSIONED_FIELDS) {
    // Skip if field is not in the update input (undefined means "don't update")
    // null means "clear the field" - this IS an update we want to track
    if (updateInput[field] === undefined) {
      continue;
    }

    const currentValue = currentBanner[field as keyof BannerType];
    const newValue = updateInput[field];

    // Normalize for comparison:
    // - null in updateInput means "clear the field"
    // - current undefined/null should match for comparison purposes
    const normalizedCurrent = currentValue ?? null;
    const normalizedNew = newValue ?? null;

    if (normalizedCurrent !== normalizedNew) {
      changedFields.push(field);
    }
  }

  return changedFields;
};

/**
 * Creates a new version entry for the version history array.
 */
export const createVersionEntry = (
  currentVersion: number,
  changedFields: string[],
  snapshot: BannerSnapshot,
  metadata?: Record<string, unknown>
): BannerVersionEntry => {
  return {
    version: currentVersion + 1,
    changedFields,
    timestamp: new Date(),
    snapshot,
    metadata,
  };
};

/**
 * Creates the initial version entry for a new banner.
 * All fields are considered "changed" since the banner is being created.
 */
export const createInitialVersionEntry = (
  snapshot: BannerSnapshot
): BannerVersionEntry => {
  // All versioned fields that have actual values are considered changed
  const changedFields = VERSIONED_FIELDS.filter((field) => {
    const value = snapshot[field as keyof BannerSnapshot];
    return value !== undefined && value !== null;
  });

  return {
    version: 1,
    changedFields: [...changedFields],
    timestamp: new Date(),
    snapshot,
    metadata: undefined,
  };
};

/**
 * Gets the version entry that was active at a specific timestamp.
 * Useful for correlating historical data with specific banner versions.
 */
export const getVersionAtTimestamp = async (
  bannerId: string,
  timestamp: Date
): Promise<BannerVersionEntry | null> => {
  const banner = await BannerModel.findById(bannerId).lean();
  if (!banner || !banner.versionHistory) {
    return null;
  }

  // Find the version that was active at the given timestamp
  // (the most recent version with timestamp <= the given timestamp)
  const versionHistory = banner.versionHistory as BannerVersionEntry[];
  const sortedHistory = [...versionHistory].sort(
    (a, b) =>
      new Date(b.timestamp as Date).getTime() -
      new Date(a.timestamp as Date).getTime()
  );

  for (const entry of sortedHistory) {
    if (new Date(entry.timestamp as Date) <= timestamp) {
      return entry;
    }
  }

  // If no version was found, return the oldest version (shouldn't happen normally)
  return sortedHistory[sortedHistory.length - 1] || null;
};

/**
 * Gets click statistics grouped by banner version.
 * Enables correlation analysis between content changes and user behavior.
 */
export const getClickStatsByVersion = async (
  bannerId: string,
  startDate?: Date,
  endDate?: Date
): Promise<
  Array<{
    version: number;
    clickCount: number;
    uniqueVisitors: number;
  }>
> => {
  const matchStage: Record<string, unknown> = {
    targetId: new Types.ObjectId(bannerId),
    targetType: "banner",
    targetVersion: { $exists: true, $ne: null },
  };

  if (startDate || endDate) {
    matchStage.timestamp = {};
    if (startDate) {
      (matchStage.timestamp as Record<string, Date>).$gte = startDate;
    }
    if (endDate) {
      (matchStage.timestamp as Record<string, Date>).$lte = endDate;
    }
  }

  const results = await ClickEventModel.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$targetVersion",
        clickCount: { $sum: 1 },
        uniqueFingerprints: { $addToSet: "$sessionFingerprint" },
      },
    },
    {
      $project: {
        version: "$_id",
        clickCount: 1,
        uniqueVisitors: { $size: "$uniqueFingerprints" },
      },
    },
    { $sort: { version: 1 } },
  ]);

  return results.map((r) => ({
    version: r.version,
    clickCount: r.clickCount,
    uniqueVisitors: r.uniqueVisitors,
  }));
};

/**
 * Gets the full version history for a banner.
 */
export const getBannerVersionHistory = async (
  bannerId: string
): Promise<BannerVersionEntry[]> => {
  const banner = await BannerModel.findById(bannerId).lean();
  if (!banner || !banner.versionHistory) {
    return [];
  }

  return (banner.versionHistory as BannerVersionEntry[]).sort(
    (a, b) => a.version - b.version
  );
};
