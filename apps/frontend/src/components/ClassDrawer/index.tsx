import { ReactNode } from "react";

import { Dialog } from "@repo/theme";

import Class from "@/components/Class";
import { Semester } from "@/lib/generated/graphql";

import styles from "./ClassDrawer.module.scss";

interface Props {
  subject: string;
  courseNumber: string;
  number: string;
  semester: Semester;
  year: number;
  sessionId: string;
  dialog?: boolean;
  modal?: boolean;
}

interface Props {
  onOpenChange?: (open: boolean) => void;
}

interface ControlledProps extends Props {
  open?: boolean;
  children: ReactNode;
}

interface UncontrolledProps extends Props {
  open: boolean;
  children?: never;
}

export type ClassDrawerProps = ControlledProps | UncontrolledProps;

export default function ClassDrawer({
  subject,
  children,
  courseNumber,
  number,
  semester,
  year,
  sessionId,
  open,
  onOpenChange,
  modal = true,
}: ClassDrawerProps) {
  return (
    <Dialog.Root modal={modal} onOpenChange={onOpenChange} open={open}>
      {children && <Dialog.Trigger asChild>{children}</Dialog.Trigger>}
      <Dialog.Portal>
        {modal && <Dialog.Overlay />}
        <Dialog.Drawer
          className={styles.drawer}
          onOpenAutoFocus={
            modal ? undefined : (event) => event.preventDefault()
          }
        >
          <Class
            subject={subject}
            courseNumber={courseNumber}
            number={number}
            semester={semester}
            year={year}
            sessionId={sessionId}
            dialog
            scrollWithinContent
          />
        </Dialog.Drawer>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
