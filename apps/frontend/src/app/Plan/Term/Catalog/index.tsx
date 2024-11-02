import { ReactNode, useState } from "react";

import { Xmark } from "iconoir-react";
import { useSearchParams } from "react-router-dom";

import { Dialog, IconButton } from "@repo/theme";

import CourseBrowser from "@/components/CourseBrowser";
import { ICourse, Semester } from "@/lib/api";

import styles from "./Catalog.module.scss";

interface CatalogProps {
  onClick: (course: ICourse) => void;
  semester: Semester;
  year: number;
  children: ReactNode;
}

export default function Catalog({
  onClick,
  children,
  semester,
  year,
}: CatalogProps) {
  const [open, setOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const handleOpenChange = (open: boolean) => {
    setOpen(open);

    if (open) return;

    searchParams.delete("query");
    setSearchParams(searchParams);
  };

  const handleClick = (course: ICourse) => {
    onClick(course);

    setOpen(false);

    searchParams.delete("query");
    setSearchParams(searchParams);
  };

  return (
    <Dialog.Root onOpenChange={handleOpenChange} open={open}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Content className={styles.content}>
        <div className={styles.header}>
          <Dialog.Title asChild>
            <p className={styles.title}>
              Add a course to {semester} {year}
            </p>
          </Dialog.Title>
          <Dialog.Close asChild>
            <IconButton className={styles.close}>
              <Xmark />
            </IconButton>
          </Dialog.Close>
        </div>
        <div className={styles.body}>
          <CourseBrowser
            onSelect={handleClick}
            responsive={false}
            defaultSemesters={[semester]}
          />
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
