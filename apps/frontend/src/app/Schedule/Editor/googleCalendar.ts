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

const request = async (
  token: string,
  method: string,
  path: string,
  body?: unknown
) => {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  return response;
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

const writeCalendarId = (scheduleId: string, calendarId: string) => {
  try {
    localStorage.setItem(storageKey(scheduleId), calendarId);
  } catch {
    // Re-exporting will create a separate calendar instead of replacing it
  }
};

export interface GoogleCalendarExport {
  eventCount: number;
  // Week of the first class, for linking into Google Calendar
  url: string;
}

// Puts the schedule in its own Google calendar, replacing the one from a
// previous export of the same schedule so re-exporting doesn't duplicate it
export const exportToGoogleCalendar = async (
  schedule: ISchedule,
  token: string
): Promise<GoogleCalendarExport> => {
  const events = getCalendarEvents(schedule);

  const previous = readCalendarId(schedule._id);
  if (previous) {
    // The calendar may already be gone if the user deleted it
    await request(
      token,
      "DELETE",
      `/calendars/${encodeURIComponent(previous)}`
    );
  }

  const created = await request(token, "POST", "/calendars", {
    summary: `${schedule.name} (Berkeleytime)`,
    description: `${schedule.semester} ${schedule.year} schedule exported from Berkeleytime`,
    timeZone: CALENDAR_TIME_ZONE,
  });

  if (!created.ok) throw new Error("Couldn't create the Google calendar.");

  const { id: calendarId } = (await created.json()) as { id: string };
  writeCalendarId(schedule._id, calendarId);

  const path = `/calendars/${encodeURIComponent(calendarId)}/events`;

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

    if (responses.some((response) => !response.ok)) {
      throw new Error("Couldn't add every class to Google Calendar.");
    }
  }

  const first = events.map((event) => event.start).sort()[0];

  return {
    eventCount: events.length,
    url: first
      ? `https://calendar.google.com/calendar/r/week/${first.slice(0, 4)}/${Number(first.slice(4, 6))}/${Number(first.slice(6, 8))}`
      : "https://calendar.google.com/calendar/r",
  };
};
