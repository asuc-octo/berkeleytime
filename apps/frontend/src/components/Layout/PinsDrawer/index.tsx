import { ReactNode } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import { Xmark, XmarkCircle } from "iconoir-react";

import { Button, IconButton, MenuItem } from "@repo/theme";

import ClassCard from "@/components/ClassCard";
import CourseCard from "@/components/CourseCard";
import { Pin } from "@/contexts/PinsContext";
import usePins from "@/hooks/usePins";
import { sortDescendingTerm } from "@/lib/class";

import styles from "./PinsDrawer.module.scss";

interface PinsDrawerProps {
  children: ReactNode;
}

// TODO: Popover
export default function PinsDrawer({ children }: PinsDrawerProps) {
  const { pins, clearPins } = usePins();

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content}>
          <Tabs.Root defaultValue="classes">
            <div className={styles.header}>
              <div>
                <Button onClick={clearPins}>
                  <XmarkCircle />
                  Clear
                </Button>
                <Dialog.Close asChild>
                  <IconButton className={styles.exit}>
                    <Xmark />
                  </IconButton>
                </Dialog.Close>
              </div>
              <div>
                <Tabs.List className={styles.menu}>
                  <Tabs.Trigger value="classes" asChild>
                    <MenuItem>Classes</MenuItem>
                  </Tabs.Trigger>
                  <Tabs.Trigger value="courses" asChild>
                    <MenuItem>Courses</MenuItem>
                  </Tabs.Trigger>
                </Tabs.List>
              </div>
            </div>
            <div className={styles.body}>
              <Tabs.Content value="classes" asChild>
                <div>
                  {/* TODO: Some kind of dropdown would be nice here */}
                  {pins
                    .filter((p) => p.type === "class")
                    .reverse()
                    .sort(sortDescendingTerm((p: Pin) => p.data))
                    .map((pin) => (
                      <div key={pin.id}>
                        <div className={styles.cardContainer}>
                          <div className={styles.term}>
                            {pin.data.semester} {pin.data.year}
                          </div>
                          <ClassCard
                            semester={pin.data.semester}
                            year={pin.data.year}
                            courseNumber={pin.data.courseNumber}
                            number={pin.data.number}
                            subject={pin.data.subject}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </Tabs.Content>
              <Tabs.Content value="courses" asChild>
                <div>
                  {pins
                    .filter((p) => p.type === "course")
                    .reverse()
                    .sort(sortDescendingTerm((p: Pin) => p.data))
                    .map((pin) => (
                      <div key={pin.id}>
                        <div className={styles.cardContainer}>
                          <CourseCard
                            number={pin.data.number}
                            subject={pin.data.subject}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </Tabs.Content>
            </div>
          </Tabs.Root>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
