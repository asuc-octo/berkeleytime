import { ReactNode, useMemo, useRef, useState } from "react";

import { ClipboardCheck, PasteClipboard, ShareIos, Xmark } from "iconoir-react";

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

interface ShareDialogProps {
  children: ReactNode;
}

// TODO: Collaborative editing
// TODO: Invite collaborators

export default function ShareDialog({ children }: ShareDialogProps) {
  const { schedule } = useSchedule();
  const [updateSchedule, { loading }] = useUpdateSchedule();

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const [copied, setCopied] = useState(false);

  const content = useMemo(
    () => ({
      url: window.location.href,
      title: schedule.name,
      text: `View my ${schedule.semester} ${schedule.year} schedule on Berkeleytime`,
    }),
    [schedule]
  );

  const canShare = navigator.canShare && navigator.canShare?.(content);

  const copy = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setCopied(true);

    navigator.clipboard.writeText(window.location.href);

    timeoutRef.current = setTimeout(() => {
      setCopied(false);
    }, 1000);
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
            <Flex gap="3">
              <Input
                readOnly
                type="url"
                value={window.location.origin + window.location.pathname}
              />
              {canShare ? (
                <Button onClick={() => navigator.share(content)}>
                  Share
                  <ShareIos />
                </Button>
              ) : (
                <Button onClick={() => copy()}>
                  {copied ? <ClipboardCheck /> : <PasteClipboard />}
                  {copied ? "Copied" : "Copy link"}
                </Button>
              )}
            </Flex>
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
          </Dialog.Body>
        </Dialog.Card>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
