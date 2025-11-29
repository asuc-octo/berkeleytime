import {
  EnrollmentCalendarEventModel,
  EnrollmentTimeframeModel,
  TermModel,
} from "@repo/common";

import { Config } from "../shared/config";
import type { Group, Semester } from "./enrollment-calendar-parser";

interface ParsedEventDoc {
  uid: string;
  summary: string;
  startDate: Date;
  parsedEvent: {
    termCode: string;
    semester: Semester;
    year: number;
    phase: 1 | 2 | null;
    isAdjustment: boolean;
    group: Group;
    eventType: "start" | "end";
  };
}

interface TimeframeKey {
  termCode: string;
  phase: number | null;
  isAdjustment: boolean;
  group: Group;
}

function makeKey(k: TimeframeKey): string {
  return `${k.termCode}|${k.phase ?? "adj"}|${k.isAdjustment}|${k.group}`;
}

/**
 * Groups that should inherit from "new_student" end events
 */
const NEW_STUDENT_GROUPS: Group[] = [
  "new_transfer",
  "new_freshman",
  "new_graduate",
];

/**
 * Sync enrollment timeframes by pairing start/end events from parsed calendar events.
 */
const syncEnrollmentTimeframes = async ({ log }: Config) => {
  log.trace(
    `Enrollment timeframe collection: ${EnrollmentTimeframeModel.collection.collectionName}`
  );

  // Fetch all parsed enrollment events
  log.trace("Fetching parsed enrollment calendar events...");
  const parsedEvents = (await EnrollmentCalendarEventModel.find({
    parsedEvent: { $ne: null },
  })
    .lean()
    .exec()) as unknown as ParsedEventDoc[];

  log.info(`Found ${parsedEvents.length} parsed enrollment events.`);

  if (parsedEvents.length === 0) {
    log.warn("No parsed events found; nothing to aggregate.");
    return;
  }

  // Group events by (termCode, phase, isAdjustment, group, eventType)
  const startEvents = new Map<string, ParsedEventDoc>();
  const endEvents = new Map<string, ParsedEventDoc>();

  for (const event of parsedEvents) {
    const { parsedEvent } = event;
    const key: TimeframeKey = {
      termCode: parsedEvent.termCode,
      phase: parsedEvent.phase,
      isAdjustment: parsedEvent.isAdjustment,
      group: parsedEvent.group,
    };
    const keyStr = makeKey(key);

    if (parsedEvent.eventType === "start") {
      // Keep the earliest start if multiple exist
      const existing = startEvents.get(keyStr);
      if (!existing || event.startDate < existing.startDate) {
        startEvents.set(keyStr, event);
      }
    } else {
      // Keep the latest end if multiple exist
      const existing = endEvents.get(keyStr);
      if (!existing || event.startDate > existing.startDate) {
        endEvents.set(keyStr, event);
      }
    }
  }

  log.trace(
    `Found ${startEvents.size} unique start events, ${endEvents.size} unique end events.`
  );

  // Fetch terms for termId lookup
  const terms = await TermModel.find({ academicCareerCode: "UGRD" }).lean();
  const termLookup = new Map<string, { termId: string }>();

  for (const term of terms) {
    // Create lookup by "YYYY Semester" format
    const nameParts = term.name.split(" ");
    if (nameParts.length >= 2) {
      const year = parseInt(nameParts[0], 10);
      const semester = nameParts[1];
      if (!isNaN(year) && semester) {
        // Generate term codes for both year formats
        const yearShort = year % 100;
        const prefix =
          semester === "Spring" ? "SP" : semester === "Fall" ? "FA" : "SU";
        const termCode = `${prefix}${yearShort.toString().padStart(2, "0")}`;
        termLookup.set(termCode, { termId: term.id });
      }
    }
  }

  // Build timeframes by matching start and end events
  const timeframes: Array<{
    termId: string;
    year: number;
    semester: Semester;
    phase: number | null;
    isAdjustment: boolean;
    group: Group;
    startDate: Date;
    endDate: Date | undefined;
    startEventUid: string;
    startEventSummary: string;
    endEventUid: string | undefined;
    endEventSummary: string | undefined;
  }> = [];

  for (const [keyStr, startEvent] of startEvents) {
    const { parsedEvent } = startEvent;

    // Look up term info
    const termInfo = termLookup.get(parsedEvent.termCode);
    if (!termInfo) {
      log.warn(
        `No term found for termCode ${parsedEvent.termCode}, skipping timeframe.`
      );
      continue;
    }

    // Find matching end event
    let endEvent = endEvents.get(keyStr);

    // If no direct end event and this is a new student group, try "new_student" end
    if (
      !endEvent &&
      NEW_STUDENT_GROUPS.includes(parsedEvent.group) &&
      !parsedEvent.isAdjustment
    ) {
      const newStudentKey: TimeframeKey = {
        termCode: parsedEvent.termCode,
        phase: parsedEvent.phase,
        isAdjustment: false,
        group: "new_student",
      };
      endEvent = endEvents.get(makeKey(newStudentKey));
    }

    // Also try "all" as a fallback for end events
    if (!endEvent) {
      const allKey: TimeframeKey = {
        termCode: parsedEvent.termCode,
        phase: parsedEvent.phase,
        isAdjustment: parsedEvent.isAdjustment,
        group: "all",
      };
      endEvent = endEvents.get(makeKey(allKey));
    }

    timeframes.push({
      termId: termInfo.termId,
      year: parsedEvent.year,
      semester: parsedEvent.semester,
      phase: parsedEvent.phase,
      isAdjustment: parsedEvent.isAdjustment,
      group: parsedEvent.group,
      startDate: startEvent.startDate,
      endDate: endEvent?.startDate,
      startEventUid: startEvent.uid,
      startEventSummary: startEvent.summary,
      endEventUid: endEvent?.uid,
      endEventSummary: endEvent?.summary,
    });
  }

  log.info(`Built ${timeframes.length} enrollment timeframes.`);

  if (timeframes.length === 0) {
    log.warn("No timeframes built; nothing to upsert.");
    return;
  }

  // Upsert timeframes
  const now = new Date();
  const bulkOps = timeframes.map((tf) => ({
    updateOne: {
      filter: {
        termId: tf.termId,
        phase: tf.phase,
        isAdjustment: tf.isAdjustment,
        group: tf.group,
      },
      update: {
        $set: {
          termId: tf.termId,
          year: tf.year,
          semester: tf.semester,
          phase: tf.phase,
          isAdjustment: tf.isAdjustment,
          group: tf.group,
          startDate: tf.startDate,
          endDate: tf.endDate,
          startEventUid: tf.startEventUid,
          startEventSummary: tf.startEventSummary,
          endEventUid: tf.endEventUid,
          endEventSummary: tf.endEventSummary,
          lastSyncedAt: now,
        },
      },
      upsert: true,
    },
  }));

  log.trace("Upserting enrollment timeframes...");
  const bulkResult = await EnrollmentTimeframeModel.bulkWrite(bulkOps, {
    ordered: false,
  });

  log.info(
    `Upserted timeframes: ${bulkResult.upsertedCount} inserted, ${bulkResult.modifiedCount} updated, ${bulkResult.matchedCount} matched.`
  );

  // Remove stale timeframes (those no longer derived from events)
  const validKeys = new Set(
    timeframes.map(
      (tf) => `${tf.termId}|${tf.phase}|${tf.isAdjustment}|${tf.group}`
    )
  );

  const allTimeframes = await EnrollmentTimeframeModel.find({}).lean();
  const staleIds = allTimeframes
    .filter((tf) => {
      const key = `${tf.termId}|${tf.phase}|${tf.isAdjustment}|${tf.group}`;
      return !validKeys.has(key);
    })
    .map((tf) => tf._id);

  if (staleIds.length > 0) {
    log.trace("Removing stale timeframes...");
    const deleteResult = await EnrollmentTimeframeModel.deleteMany({
      _id: { $in: staleIds },
    });
    log.info(`Removed ${deleteResult.deletedCount} stale timeframes.`);
  }
};

export { syncEnrollmentTimeframes };

export default {
  syncEnrollmentTimeframes,
};
