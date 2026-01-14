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
}: ClassDrawerProps) {
  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      {children && <Dialog.Trigger asChild>{children}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Drawer className={styles.drawer}>
          <Class
            subject={subject}
            courseNumber={courseNumber}
            number={number}
            semester={semester}
            year={year}
            sessionId={sessionId}
            dialog
          />
        </Dialog.Drawer>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
