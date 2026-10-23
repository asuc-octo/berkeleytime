import { ISchedule } from "@/lib/api";

import { CALENDAR_TIME_ZONE, getCalendarEvents } from "./exportToCalendar";

// Only lets Berkeleytime manage calendars it created, not the rest of the
// user's Google Calendar
const SCOPE = "https://www.googleapis.com/auth/calendar.app.created";
const API = "https://www.googleapis.com/calendar/v3";

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as
  | string
  | undefined;

interface TokenResponse {
  access_token?: string;
  error?: string;
}

interface TokenClient {
  requestAccessToken: () => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: TokenResponse) => void;
            error_callback?: (error: { type: string }) => void;
          }) => TokenClient;
        };
      };
    };
  }
}

export class GoogleCalendarCancelled extends Error {}

let identityScript: Promise<void> | null = null;

// The token popup has to open in the same click that requests it, so the
// script is loaded ahead of time
export const loadGoogleIdentity = () => {
  identityScript ??= new Promise<void>((resolve, reject) => {
    if (window.google?.accounts) return resolve();

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      identityScript = null;
      reject(new Error("Couldn't load Google sign-in."));
    };
    document.head.appendChild(script);
  });

  return identityScript;
};

// Must be called synchronously from a click handler after loadGoogleIdentity
export const requestGoogleToken = () =>
  new Promise<string>((resolve, reject) => {
    if (!GOOGLE_CLIENT_ID || !window.google?.accounts) {
      reject(new Error("Google sign-in isn't available."));
      return;
    }

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPE,
      callback: (response) => {
        if (response.access_token) resolve(response.access_token);
        else reject(new GoogleCalendarCancelled(response.error));
      },
      error_callback: (error) =>
        reject(new GoogleCalendarCancelled(error.type)),
    });

    client.requestAccessToken();
  });

const MAX_RETRIES = 5;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Google asks for exponential backoff on per-minute rate limits and server
// errors. A 403 with any other reason (such as the hours-long "Calendar
// usage limits exceeded") won't clear by retrying.
const isRetryable = async (response: Response) => {
  if (response.status === 429 || response.status >= 500) return true;
  if (response.status !== 403) return false;

  try {
    const body = (await response.clone().json()) as {
      error?: { errors?: { reason?: string }[] };
    };
    const reason = body.error?.errors?.[0]?.reason;
    return reason === "rateLimitExceeded" || reason === "userRateLimitExceeded";
  } catch {
    return false;
  }
};

const request = async (
  token: string,
  method: string,
  path: string,
  body?: unknown
) => {
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(`${API}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (attempt === MAX_RETRIES || !(await isRetryable(response))) {
      return response;
    }

    // 1s, 2s, 4s, 8s, 16s plus jitter so many users who hit the limit at the
    // same moment don't all retry together
    const retryAfter = Number(response.headers.get("Retry-After"));
    const delay =
      retryAfter > 0
        ? retryAfter * 1000
        : 2 ** attempt * 1000 + Math.random() * 1000;

    await sleep(delay);
  }
};

const describeFailure = async (response: Response, fallback: string) => {
  if (response.status === 429 || (await isRetryable(response))) {
    return "Google Calendar is busy right now. Try again in a few minutes.";
  }

  if (response.status === 403) {
    return "Your Google account has hit a Google Calendar limit. Try again in a few hours.";
  }

  if (response.status === 401) {
    return "Your Google sign-in expired. Try again.";
  }

  return fallback;
};

// YYYYMMDDTHHMMSS -> YYYY-MM-DDTHH:MM:SS
const toDateTime = (value: string) =>
  `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T${value.slice(9, 11)}:${value.slice(11, 13)}:${value.slice(13, 15)}`;

const storageKey = (scheduleId: string) =>
  `berkeleytime:google-calendar:${scheduleId}`;

const readCalendarId = (scheduleId: string) => {
  try {
    return localStorage.getItem(storageKey(scheduleId));
  } catch {
    return null;
  }
};

const writeCalendarId = (scheduleId: string, calendarId: string | null) => {
  try {
    if (calendarId) localStorage.setItem(storageKey(scheduleId), calendarId);
    else localStorage.removeItem(storageKey(scheduleId));
  } catch {
    // Re-exporting will create a separate calendar instead of replacing it
  }
};

const deleteCalendar = (token: string, calendarId: string) =>
  request(token, "DELETE", `/calendars/${encodeURIComponent(calendarId)}`);

export interface GoogleCalendarExport {
  eventCount: number;
  // Week of the first class, for linking into Google Calendar
  url: string;
}

// Puts the schedule in its own Google calendar, replacing the one from a
// previous export of the same schedule so re-exporting doesn't duplicate it.
// The previous calendar is only removed once the new one is complete, and a
// half-built calendar is removed if the export fails.
export const exportToGoogleCalendar = async (
  schedule: ISchedule,
  token: string
): Promise<GoogleCalendarExport> => {
  const events = getCalendarEvents(schedule);
  const previous = readCalendarId(schedule._id);

  const created = await request(token, "POST", "/calendars", {
    summary: `${schedule.name} (Berkeleytime)`,
    description: `${schedule.semester} ${schedule.year} schedule exported from Berkeleytime`,
    timeZone: CALENDAR_TIME_ZONE,
  });

  if (!created.ok) {
    throw new Error(
      await describeFailure(created, "Couldn't create the Google calendar.")
    );
  }

  const { id: calendarId } = (await created.json()) as { id: string };

  const path = `/calendars/${encodeURIComponent(calendarId)}/events`;

  try {
    // A few at a time to stay under Google's per-user rate limit
    for (let i = 0; i < events.length; i += 5) {
      const responses = await Promise.all(
        events.slice(i, i + 5).map((event) =>
          request(token, "POST", path, {
            summary: event.summary,
            description: event.description,
            location: event.location,
            start: {
              dateTime: toDateTime(event.start),
              timeZone: CALENDAR_TIME_ZONE,
            },
            end: {
              dateTime: toDateTime(event.end),
              timeZone: CALENDAR_TIME_ZONE,
            },
            recurrence: [event.rrule],
          })
        )
      );

      const failed = responses.find((response) => !response.ok);
      if (failed) {
        throw new Error(
          await describeFailure(
            failed,
            "Couldn't add every class to Google Calendar."
          )
        );
      }
    }
  } catch (error) {
    // Don't leave a calendar with only some of the classes behind. If even
    // this fails, remember it so the next export replaces it.
    const removed = await deleteCalendar(token, calendarId).catch(() => null);
    if (!removed?.ok) writeCalendarId(schedule._id, calendarId);
    throw error;
  }

  writeCalendarId(schedule._id, calendarId);

  if (previous && previous !== calendarId) {
    // The previous calendar may already be gone if the user deleted it
    await deleteCalendar(token, previous).catch(() => null);
  }

  const first = events.map((event) => event.start).sort()[0];

  return {
    eventCount: events.length,
    url: first
      ? `https://calendar.google.com/calendar/r/week/${first.slice(0, 4)}/${Number(first.slice(4, 6))}/${Number(first.slice(6, 8))}`
      : "https://calendar.google.com/calendar/r",
  };
};
