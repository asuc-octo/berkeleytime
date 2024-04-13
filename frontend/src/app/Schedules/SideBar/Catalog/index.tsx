import { useMemo, useState } from "react";

import { useQuery } from "@apollo/client";
import * as Dialog from "@radix-ui/react-dialog";
import { Xmark } from "iconoir-react";
import { useSearchParams } from "react-router-dom";

import Filters from "@/components/Filters";
import IconButton from "@/components/IconButton";
import List from "@/components/List";
import { GET_COURSES, ICatalogCourse } from "@/lib/api";

import styles from "./Catalog.module.scss";

interface CatalogProps {
  setClass: (course: ICatalogCourse, number: string) => void;
  children: JSX.Element;
  semester: string;
  year: number;
}

export default function Catalog({
  setClass,
  children,
  semester,
  year,
}: CatalogProps) {
  const [open, setOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const { data } = useQuery<{ catalog: ICatalogCourse[] }>(GET_COURSES, {
    variables: {
      term: {
        semester,
        year,
      },
    },
  });

  const courses = useMemo(() => data?.catalog ?? [], [data?.catalog]);

  const handleOpenChange = (open: boolean) => {
    setOpen(open);

    if (open) return;

    searchParams.delete("query");
    setSearchParams(searchParams);
  };

  const handleClass = (course: ICatalogCourse, number: string) => {
    setClass(course, number);

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
          <Filters />
          {courses && <List courses={courses} setClass={handleClass} />}
          <Dialog.Close asChild>
            <IconButton className={styles.close}>
              <Xmark />
            </IconButton>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
