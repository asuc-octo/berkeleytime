import { ReactNode, useState } from "react";

import { Xmark } from "iconoir-react";
import { useSearchParams } from "react-router-dom";

import { Dialog, IconButton } from "@repo/theme";

import ClassBrowser from "@/components/ClassBrowser";
import { Semester } from "@/lib/api";

import styles from "./Catalog.module.scss";

interface CatalogProps {
  onClassSelect: (
    subject: string,
    courseNumber: string,
    number: string
  ) => void;
  children: ReactNode;
  semester: Semester;
  year: number;
}

export default function Catalog({
  onClassSelect,
  children,
  year,
  semester,
}: CatalogProps) {
  const [open, setOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const handleOpenChange = (open: boolean) => {
    setOpen(open);

    if (open) return;

    searchParams.delete("query");
    setSearchParams(searchParams);
  };

  const handleSelect = (
    subject: string,
    courseNumber: string,
    number: string
  ) => {
    onClassSelect(subject, courseNumber, number);

    setOpen(false);

    searchParams.delete("query");
    setSearchParams(searchParams);
  };

  return (
    <Dialog.Root onOpenChange={handleOpenChange} open={open}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Drawer align="start" className={styles.drawer}>
          <div className={styles.header}>
            Add a course to this schedule
            <Dialog.Close asChild>
              <IconButton>
                <Xmark />
              </IconButton>
            </Dialog.Close>
          </div>
          <div className={styles.body}>
            <ClassBrowser
              semester={semester}
              year={year}
              onSelect={handleSelect}
              responsive={false}
            />
          </div>
        </Dialog.Drawer>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
