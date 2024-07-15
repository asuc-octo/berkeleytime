import { ReactNode, forwardRef, useMemo } from "react";

import {
  Content,
  DialogTriggerProps,
  Overlay,
  Portal,
  Root,
  Trigger,
} from "@radix-ui/react-dialog";

import Class from "@/components/Class";
import { IClass, Semester } from "@/lib/api";

import styles from "./ClassDrawer.module.scss";

interface BaseClassDrawerProps {
  year: number;
  semester: Semester;
  subject: string;
  courseNumber: string;
  classNumber: string;
  partialClass?: IClass | null;
  children?: ReactNode;
}

export interface ControlledClassDrawerProps extends BaseClassDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface DefaultClassDrawerProps extends BaseClassDrawerProps {
  open?: never;
  onOpenChange?: never;
}

export type ClassDrawerProps =
  | ControlledClassDrawerProps
  | DefaultClassDrawerProps;

// TODO: Determine if this component would be better suited in the global context
const ClassDrawer = forwardRef<
  HTMLButtonElement,
  ClassDrawerProps & Omit<DialogTriggerProps, "asChild">
>(
  (
    {
      subject,
      children,
      courseNumber,
      classNumber,
      semester,
      year,
      partialClass,
      open,
      onOpenChange,
      ...props
    },
    ref
  ) => {
    const trigger = useMemo(() => open === undefined, [open]);

    return (
      <Root onOpenChange={onOpenChange} open={open}>
        {trigger && (
          <Trigger {...props} asChild ref={ref}>
            {children}
          </Trigger>
        )}
        <Portal>
          <Overlay className={styles.overlay} />
          <Content
            className={styles.content}
            // TODO: Automatically focus a relevant element
            onOpenAutoFocus={(event) => event.preventDefault()}
          >
            <Class
              subject={subject}
              courseNumber={courseNumber}
              classNumber={classNumber}
              semester={semester}
              year={year}
              partialClass={partialClass}
              dialog
            />
          </Content>
        </Portal>
      </Root>
    );
  }
);

export default ClassDrawer;
