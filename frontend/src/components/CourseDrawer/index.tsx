import { ReactNode, forwardRef, useMemo } from "react";

import {
  Content,
  DialogTriggerProps,
  Overlay,
  Portal,
  Root,
  Trigger,
} from "@radix-ui/react-dialog";

import Course from "./Course";
import styles from "./CourseDrawer.module.scss";

interface CourseDrawerProps {
  subject: string;
  number: string;
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// TODO: Determine if this component would be better suited as a global context
const CourseDrawer = forwardRef<
  HTMLButtonElement,
  CourseDrawerProps & Omit<DialogTriggerProps, "asChild">
>(({ subject, children, number, open, onOpenChange, ...props }, ref) => {
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
          <Course subject={subject} number={number} />
        </Content>
      </Portal>
    </Root>
  );
});

export default CourseDrawer;
