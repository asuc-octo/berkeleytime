import { ReactNode, useMemo, useRef, useState } from "react";

import * as Checkbox from "@radix-ui/react-checkbox";
import {
  Check,
  ClipboardCheck,
  PasteClipboard,
  ShareIos,
  Xmark,
} from "iconoir-react";

import { Button, Dialog, Flex, IconButton } from "@repo/theme";

import { useUpdateSchedule } from "@/hooks/api";
import useSchedule from "@/hooks/useSchedule";

import styles from "./ShareDialog.module.scss";

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
          <Flex p="5" direction="column" gap="5">
            <Flex align="start" gap="5">
              <Flex direction="column" gap="1" flexGrow="1">
                <Dialog.Title asChild>
                  <p className={styles.title}>Share schedule</p>
                </Dialog.Title>
                <Dialog.Description asChild>
                  <p className={styles.description}>
                    Manage who can view your schedule
                  </p>
                </Dialog.Description>
              </Flex>
              <Dialog.Close asChild>
                <IconButton>
                  <Xmark />
                </IconButton>
              </Dialog.Close>
            </Flex>
            <Flex gap="4">
              <input
                readOnly
                type="url"
                className={styles.input}
                value={window.location.origin + window.location.pathname}
              />
              {canShare ? (
                <Button
                  variant="solid"
                  onClick={() => navigator.share(content)}
                >
                  Share
                  <ShareIos />
                </Button>
              ) : (
                <Button variant="solid" onClick={() => copy()}>
                  {copied ? <ClipboardCheck /> : <PasteClipboard />}
                  {copied ? "Copied" : "Copy link"}
                </Button>
              )}
            </Flex>
            <label htmlFor="public" className={styles.label}>
              <Checkbox.Root
                className={styles.checkbox}
                id="public"
                checked={schedule.public}
                onCheckedChange={handleCheckedChange}
                disabled={loading}
              >
                <Checkbox.Indicator>
                  <Check width={12} height={12} />
                </Checkbox.Indicator>
              </Checkbox.Root>
              <span className={styles.description}>
                Anyone with the link can view
              </span>
            </label>
          </Flex>
        </Dialog.Card>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
