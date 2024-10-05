import { ReactNode, useState } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import { Xmark } from "iconoir-react";
import { useSearchParams } from "react-router-dom";

import ClassBrowser from "@/components/ClassBrowser";
import IconButton from "@/components/IconButton";
import { IClass, Semester } from "@/lib/api";

import styles from "./Catalog.module.scss";

interface CatalogProps {
  onClassSelect: (_class: IClass) => void;
  children: ReactNode;
  semester: string;
  year: number;
}

export default function Catalog({ onClassSelect, children }: CatalogProps) {
  const [open, setOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const handleOpenChange = (open: boolean) => {
    setOpen(open);

    if (open) return;

    searchParams.delete("query");
    setSearchParams(searchParams);
  };

  const handleClassSelect = (_class: IClass) => {
    onClassSelect(_class);

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
            Add a course to this schedule
            <Dialog.Close asChild>
              <IconButton className={styles.close}>
                <Xmark />
              </IconButton>
            </Dialog.Close>
          </div>
          <div className={styles.body}>
            <ClassBrowser
              semester={Semester.Fall}
              year={2024}
              onClassSelect={handleClassSelect}
              responsive={false}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
