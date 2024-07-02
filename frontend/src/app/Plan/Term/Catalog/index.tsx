import { ReactNode, useState } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import { Xmark } from "iconoir-react";
import { useSearchParams } from "react-router-dom";

import CourseBrowser from "@/components/CourseBrowser";
import IconButton from "@/components/IconButton";
import { ICourse } from "@/lib/api";

import styles from "./Catalog.module.scss";

interface CatalogProps {
  onClick: (course: ICourse) => void;
  children: ReactNode;
}

export default function Catalog({ onClick, children }: CatalogProps) {
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
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content}>
          <div className={styles.header}>
            Add a course to this semester
            <Dialog.Close asChild>
              <IconButton className={styles.close}>
                <Xmark />
              </IconButton>
            </Dialog.Close>
          </div>
          <div className={styles.body}>
            <CourseBrowser onSelect={handleClick} responsive={false} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
