import { ReactNode, useState } from "react";

import { Calendar, Download, OpenNewWindow } from "iconoir-react";

import { Button, Dialog, Text } from "@repo/theme";

import useSchedule from "@/hooks/useSchedule";

import exportToCalendar from "../exportToCalendar";
import {
  GoogleCalendarCancelled,
  GoogleCalendarExport,
  exportToGoogleCalendar,
  loadGoogle,
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
  // undefined while loading, null when this deployment has no Google client
  const [clientId, setClientId] = useState<string | null>();

  const handleOpenChange = (open: boolean) => {
    if (!open) return;

    setState({ status: "idle" });

    loadGoogle()
      .then(setClientId)
      .catch((error: Error) => {
        setClientId(null);
        setState({ status: "error", message: error.message });
      });
  };

  const handleGoogle = async () => {
    if (!clientId) return;

    // Requested before any await so the browser treats the popup as part of
    // this click
    const token = requestGoogleToken(clientId);

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
            subtitle="Add your classes to Google Calendar as a new calendar"
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
                {clientId === null
                  ? "Google Calendar export isn't set up on this site yet. You can still download an .ics file and import it into any calendar app."
                  : "Berkeleytime only gets access to the calendar it creates, not the rest of your Google Calendar."}
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
            {state.status === "done" ? (
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
                disabled={!clientId || state.status === "exporting"}
              >
                <Calendar />
                {state.status === "exporting"
                  ? "Adding to Google Calendar…"
                  : "Add to Google Calendar"}
              </Button>
            )}
          </Dialog.Footer>
        </Dialog.Card>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
