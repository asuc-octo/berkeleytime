import { ReactNode } from "react";

import { Xmark, XmarkCircle } from "iconoir-react";

import { Button, Dialog, IconButton } from "@repo/theme";

import usePins from "@/hooks/usePins";

import styles from "./PinsDrawer.module.scss";

interface PinsDrawerProps {
  children: ReactNode;
}

// TODO: Popover
export default function PinsDrawer({ children }: PinsDrawerProps) {
  const { pins } = usePins();

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Drawer className={styles.drawer}>
          <div className={styles.header}>
            <Button variant="secondary">
              <XmarkCircle />
              Clear
            </Button>
            <Dialog.Close asChild>
              <IconButton>
                <Xmark />
              </IconButton>
            </Dialog.Close>
          </div>
          <div className={styles.body}>
            {pins.map((pin) => (
              <div key={pin.id}>
                {pin.type}
                {JSON.stringify(pin.data)}
              </div>
            ))}
          </div>
        </Dialog.Drawer>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
