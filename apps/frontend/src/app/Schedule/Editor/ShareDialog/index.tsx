import { ReactNode, useMemo, useRef, useState } from "react";

import { Xmark } from "iconoir-react";

import {
  Button,
  Checkbox,
  Dialog,
  Flex,
  Heading,
  IconButton,
  Input,
  Text,
} from "@repo/theme";

import { useUpdateSchedule } from "@/hooks/api";
import useSchedule from "@/hooks/useSchedule";
import { copyTextToClipboard } from "@/lib/clipboard";

interface ShareDialogProps {
  children: ReactNode;
}

// TODO: Collaborative editing
// TODO: Invite collaborators

export default function ShareDialog({ children }: ShareDialogProps) {
  const { schedule, editing } = useSchedule();
  const [updateSchedule, { loading }] = useUpdateSchedule();

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(
    () => `${window.location.origin}/schedules/${schedule._id}`,
    [schedule._id]
  );

  const content = useMemo(
    () => ({
      url: shareUrl,
      title: schedule.name,
      text: `View my ${schedule.semester} ${schedule.year} schedule on Berkeleytime`,
    }),
    [schedule, shareUrl]
  );

  const canShare =
    typeof navigator.share === "function" &&
    (!navigator.canShare || navigator.canShare(content));

  const copy = async () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    await copyTextToClipboard(shareUrl);
    setCopied(true);

    timeoutRef.current = setTimeout(() => {
      setCopied(false);
    }, 1200);
  };

  const handleCheckedChange = async (checked: boolean) => {
    await updateSchedule(
      schedule._id,
      { public: checked },
      {
        optimisticResponse: {
          updateSchedule: { ...schedule, public: checked },
        },
      }
    );
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Card>
          <Dialog.Header>
            <Flex direction="column" gap="1" flexGrow="1">
              <Dialog.Title asChild>
                <Heading>Share schedule</Heading>
              </Dialog.Title>
              <Dialog.Description asChild>
                <Text>Manage who can view your schedule</Text>
              </Dialog.Description>
            </Flex>
            <Dialog.Close asChild>
              <IconButton>
                <Xmark />
              </IconButton>
            </Dialog.Close>
          </Dialog.Header>
          <Dialog.Body gap="3">
            <Flex gap="3" width="100%">
              <Input readOnly type="url" value={shareUrl} width="100%" />
              <Button onClick={() => copy()}>
                {copied ? "Copied" : "Copy link"}
              </Button>
              {canShare && (
                <Button onClick={() => navigator.share(content)}>Share</Button>
              )}
            </Flex>
            {editing ? (
              <label>
                <Flex align="center" gap="3">
                  <Checkbox
                    checked={schedule.public}
                    onCheckedChange={handleCheckedChange}
                    disabled={loading}
                  />
                  <Text as="span">Anyone with the link can view</Text>
                </Flex>
              </label>
            ) : (
              <Text>This public schedule is view-only.</Text>
            )}
          </Dialog.Body>
        </Dialog.Card>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
