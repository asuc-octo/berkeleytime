import { ReactNode, useState } from "react";

import { Calendar, Download, OpenNewWindow } from "iconoir-react";

import { Button, Dialog, Text } from "@repo/theme";

import useSchedule from "@/hooks/useSchedule";

import exportToCalendar from "../exportToCalendar";
import {
  GOOGLE_CLIENT_ID,
  GoogleCalendarCancelled,
  GoogleCalendarExport,
  exportToGoogleCalendar,
  loadGoogleIdentity,
  requestGoogleToken,
} from "../googleCalendar";

interface ExportDialogProps {
  children: ReactNode;
}

type ExportState =
  | { status: "idle" }
  | { status: "exporting" }
  | { status: "done"; result: GoogleCalendarExport }
  | { status: "error"; message: string };

export default function ExportDialog({ children }: ExportDialogProps) {
  const { schedule } = useSchedule();
  const [state, setState] = useState<ExportState>({ status: "idle" });
  const [googleReady, setGoogleReady] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) return;

    setState({ status: "idle" });

    if (GOOGLE_CLIENT_ID) {
      loadGoogleIdentity()
        .then(() => setGoogleReady(true))
        .catch((error: Error) =>
          setState({ status: "error", message: error.message })
        );
    }
  };

  const handleGoogle = async () => {
    // Requested before any await so the browser treats the popup as part of
    // this click
    const token = requestGoogleToken();

    try {
      const accessToken = await token;
      setState({ status: "exporting" });
      const result = await exportToGoogleCalendar(schedule, accessToken);
      setState({ status: "done", result });
    } catch (error) {
      if (error instanceof GoogleCalendarCancelled) {
        setState({ status: "idle" });
        return;
      }

      setState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Couldn't export to Google Calendar.",
      });
    }
  };

  return (
    <Dialog.Root onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Card>
          <Dialog.Header
            title="Export schedule"
            subtitle={
              GOOGLE_CLIENT_ID
                ? "Add your classes to Google Calendar as a new calendar"
                : "Download your classes as a calendar file"
            }
            hasCloseButton
          />
          <Dialog.Body gap="3">
            {state.status === "done" ? (
              <Text>
                Added {state.result.eventCount}{" "}
                {state.result.eventCount === 1 ? "class" : "classes"} to a new
                calendar named "{schedule.name} (Berkeleytime)". Exporting again
                replaces it.
              </Text>
            ) : state.status === "error" ? (
              <Text>{state.message}</Text>
            ) : (
              <Text>
                {GOOGLE_CLIENT_ID
                  ? "Berkeleytime only gets access to the calendar it creates, not the rest of your Google Calendar."
                  : "Open the .ics file with any calendar app to import your classes."}
              </Text>
            )}
          </Dialog.Body>
          <Dialog.Footer>
            <Button
              variant="secondary"
              onClick={() => exportToCalendar(schedule)}
            >
              <Download />
              Download .ics
            </Button>
            {GOOGLE_CLIENT_ID &&
              (state.status === "done" ? (
                <Button
                  as="a"
                  href={state.result.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Google Calendar
                  <OpenNewWindow />
                </Button>
              ) : (
                <Button
                  onClick={handleGoogle}
                  disabled={!googleReady || state.status === "exporting"}
                >
                  <Calendar />
                  {state.status === "exporting"
                    ? "Adding to Google Calendar…"
                    : "Add to Google Calendar"}
                </Button>
              ))}
          </Dialog.Footer>
        </Dialog.Card>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
