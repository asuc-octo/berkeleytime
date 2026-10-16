import UAParser from "ua-parser-js";

import { TrackingEventModel } from "@repo/common/models";

import { RequestContext } from "../../../types/request-context";
import { requireStaffAuth } from "../helpers/staff-auth";

export interface DeviceVendorCount {
  name: string;
  users: number;
}

export interface DeviceCategoryCount {
  category: string;
  users: number;
  vendors: DeviceVendorCount[];
}

export interface DeviceAnalyticsData {
  devices: DeviceCategoryCount[];
  totalUsers: number;
}

// Map ua-parser-js device types onto the macro categories shown on the pie
// chart. An absent device type means a desktop browser.
function categorize(deviceType: string | undefined): string {
  if (
    deviceType === "mobile" ||
    deviceType === "tablet" ||
    deviceType === "wearable"
  ) {
    return "Mobile";
  }
  if (deviceType === "smarttv") return "TV";
  if (deviceType === undefined) return "Computer";
  return "Other";
}

export async function getDeviceAnalyticsData(
  context: RequestContext,
  days: number,
  targetType?: string
): Promise<DeviceAnalyticsData> {
  await requireStaffAuth(context);

  const rangeEnd = new Date();
  const rangeStart = new Date(rangeEnd);
  rangeStart.setDate(rangeStart.getDate() - days + 1);
  rangeStart.setHours(0, 0, 0, 0);

  // One row per distinct (visitor, userAgent) pair, so each user agent string
  // is parsed once per visitor regardless of how many events they produced
  const pairs = await TrackingEventModel.aggregate<{
    _id: { visitor: unknown; userAgent: string };
  }>([
    {
      $match: {
        timestamp: { $gte: rangeStart, $lte: rangeEnd },
        userAgent: { $type: "string", $ne: "" },
        // Optionally scope to one feature's events (e.g. "grades" sessions)
        ...(targetType && { targetType }),
      },
    },
    {
      $group: {
        _id: {
          visitor: { $ifNull: ["$userId", "$ipHash"] },
          userAgent: "$userAgent",
        },
      },
    },
  ]);

  interface ParsedAgent {
    category: string;
    vendor: string;
  }
  const parseCache = new Map<string, ParsedAgent>();

  const allUsers = new Set<string>();
  const categoryUsers = new Map<string, Set<string>>();
  const vendorUsers = new Map<string, Map<string, Set<string>>>();

  for (const pair of pairs) {
    if (!pair._id.visitor) continue;
    const visitor = String(pair._id.visitor);
    const ua = pair._id.userAgent;

    let parsed = parseCache.get(ua);
    if (!parsed) {
      const result = new UAParser(ua).getResult();
      parsed = {
        category: categorize(result.device.type),
        // Desktop user agents carry no manufacturer, so fall back to the OS
        // (macOS/Windows/Linux) for the per-slice breakdown
        vendor: result.device.vendor || result.os.name || "Unknown",
      };
      parseCache.set(ua, parsed);
    }

    allUsers.add(visitor);

    let category = categoryUsers.get(parsed.category);
    if (!category) categoryUsers.set(parsed.category, (category = new Set()));
    category.add(visitor);

    let vendors = vendorUsers.get(parsed.category);
    if (!vendors) vendorUsers.set(parsed.category, (vendors = new Map()));
    let vendor = vendors.get(parsed.vendor);
    if (!vendor) vendors.set(parsed.vendor, (vendor = new Set()));
    vendor.add(visitor);
  }

  const devices: DeviceCategoryCount[] = [...categoryUsers.entries()]
    .map(([category, users]) => ({
      category,
      users: users.size,
      vendors: [...(vendorUsers.get(category) ?? new Map()).entries()]
        .map(([name, vendorSet]) => ({
          name,
          users: (vendorSet as Set<string>).size,
        }))
        .sort((a, b) => b.users - a.users),
    }))
    .sort((a, b) => b.users - a.users);

  return { devices, totalUsers: allUsers.size };
}
