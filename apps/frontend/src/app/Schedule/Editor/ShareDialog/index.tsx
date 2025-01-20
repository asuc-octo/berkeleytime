import { ReactNode, useState } from "react";

import * as Checkbox from "@radix-ui/react-checkbox";
import { Check, PasteClipboard, Xmark } from "iconoir-react";

import { Button, Dialog, IconButton } from "@repo/theme";

import styles from "./ShareDialog.module.scss";

interface ShareDialogProps {
  children: ReactNode;
}

// TODO: Collaborative editing
// TODO: Invite collaborators

export default function ShareDialog({ children }: ShareDialogProps) {
  const [checked, setChecked] = useState(false);

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Content className={styles.content}>
        <div className={styles.header}>
          <div className={styles.text}>
            <Dialog.Title asChild>
              <p className={styles.title}>Share schedule</p>
            </Dialog.Title>
            <Dialog.Description asChild>
              <p className={styles.description}>
                Manage who can view your schedule
              </p>
            </Dialog.Description>
          </div>
          <Dialog.Close asChild>
            <IconButton>
              <Xmark />
            </IconButton>
          </Dialog.Close>
        </div>
        <div className={styles.column}>
          <div className={styles.row}>
            <input
              type="url"
              className={styles.input}
              value={window.location.origin + window.location.pathname}
            />
            <Button variant="solid">
              <PasteClipboard />
              Copy link
            </Button>
          </div>
          <label htmlFor="public" className={styles.label}>
            <Checkbox.Root
              className={styles.checkbox}
              id="public"
              checked={checked}
              onCheckedChange={(checked) => setChecked(checked as boolean)}
            >
              <Checkbox.Indicator>
                <Check width={12} height={12} />
              </Checkbox.Indicator>
            </Checkbox.Root>
            <span className={styles.description}>
              Anyone with the link can view
            </span>
          </label>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
