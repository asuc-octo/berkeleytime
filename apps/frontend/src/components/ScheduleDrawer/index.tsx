import { ReactNode, forwardRef, useMemo } from "react";

import {
  Content,
  DialogTriggerProps,
  Overlay,
  Portal,
  Root,
  Trigger,
} from "@radix-ui/react-dialog";

import { Semester } from "@/lib/api";

import Schedule from "./Schedule";

interface CourseDrawerProps {
  year: number;
  semester: Semester;
  subject: string;
  courseNumber: string;
  classNumber: string;
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// TODO: Determine if this component would be better suited as a global context
const CourseDrawer = forwardRef<
  HTMLButtonElement,
  CourseDrawerProps & Omit<DialogTriggerProps, "asChild">
>(
  (
    {
      subject,
      children,
      courseNumber,
      classNumber,
      year,
      semester,
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
          <Overlay />
          <Content>
            <Schedule
              year={year}
              semester={semester}
              subject={subject}
              courseNumber={courseNumber}
              classNumber={classNumber}
            />
          </Content>
        </Portal>
      </Root>
    );
  }
);

export default CourseDrawer;
