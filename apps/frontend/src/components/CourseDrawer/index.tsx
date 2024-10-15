import { ReactNode } from "react";

import { Dialog } from "@repo/theme";

import Course from "../Course";
import styles from "./CourseDrawer.module.scss";

interface Props {
  subject: string;
  number: string;
  onOpenChange?: (open: boolean) => void;
}

export interface ControlledProps extends Props {
  open: boolean;
  children?: never;
}

export interface UncontrolledProps extends Props {
  open?: boolean;
  children: ReactNode;
}

export type CourseDrawerProps = ControlledProps | UncontrolledProps;

export default function CourseDrawer({
  subject,
  children,
  number,
  open,
  onOpenChange,
}: CourseDrawerProps) {
  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      {children && <Dialog.Trigger asChild>{children}</Dialog.Trigger>}
      <Dialog.Content className={styles.content}>
        <Course subject={subject} number={number} dialog />
      </Dialog.Content>
    </Dialog.Root>
  );
}
