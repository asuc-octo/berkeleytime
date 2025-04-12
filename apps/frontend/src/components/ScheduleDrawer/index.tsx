import { ReactNode, useMemo } from "react";

import { Dialog } from "@repo/theme";

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

export default function CourseDrawer({
  subject,
  children,
  courseNumber,
  classNumber,
  year,
  semester,
  open,
  onOpenChange,
}: CourseDrawerProps) {
  const trigger = useMemo(() => open === undefined, [open]);

  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      {trigger && <Dialog.Trigger asChild>{children}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Drawer>
          <Schedule
            year={year}
            semester={semester}
            subject={subject}
            courseNumber={courseNumber}
            classNumber={classNumber}
          />
        </Dialog.Drawer>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
