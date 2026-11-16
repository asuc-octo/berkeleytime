import { ISchedule } from "@/lib/api";

import { CALENDAR_TIME_ZONE, getCalendarEvents } from "./exportToCalendar";

// Only lets Berkeleytime manage calendars it created, not the rest of the
// user's Google Calendar
const SCOPE = "https://www.googleapis.com/auth/calendar.app.created";
const API = "https://www.googleapis.com/calendar/v3";

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

const loadIdentityScript = () => {
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

let clientId: Promise<string | null> | null = null;

// Uses the same OAuth client as Berkeleytime login. Resolves to null when
// this deployment has no Google client configured.
const loadClientId = () => {
  clientId ??= fetch("/api/login/google-client")
    .then((response) => (response.ok ? response.json() : { clientId: null }))
    .then((body: { clientId: string | null }) => body.clientId)
    .catch(() => {
      clientId = null;
      return null;
    });

  return clientId;
};

// The token popup has to open in the same click that requests it, so the
// client ID and script are loaded ahead of time
export const loadGoogle = async () => {
  const id = await loadClientId();
  if (id) await loadIdentityScript();
  return id;
};

// Must be called synchronously from a click handler after loadGoogle
export const requestGoogleToken = (clientId: string) =>
  new Promise<string>((resolve, reject) => {
    if (!window.google?.accounts) {
      reject(new Error("Google sign-in isn't available."));
      return;
    }

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
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

const request = (token: string, method: string, path: string, body?: unknown) =>
  fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

const describeFailure = async (response: Response, fallback: string) => {
  if (response.status === 401) {
    return "Your Google sign-in expired. Try again.";
  }

  if (response.status === 429) {
    return "Google Calendar is busy right now. Try again in a few minutes.";
  }

  if (response.status === 403) {
    // Per-minute rate limits clear quickly; any other 403 reason (such as
    // "Calendar usage limits exceeded") lasts hours
    const body = (await response.json().catch(() => null)) as {
      error?: { errors?: { reason?: string }[] };
    } | null;
    const reason = body?.error?.errors?.[0]?.reason;

    return reason === "rateLimitExceeded" || reason === "userRateLimitExceeded"
      ? "Google Calendar is busy right now. Try again in a few minutes."
      : "Your Google account has hit a Google Calendar limit. Try again in a few hours.";
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
