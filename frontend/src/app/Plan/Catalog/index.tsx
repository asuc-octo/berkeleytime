import { useMemo, useState } from "react";

import { useQuery } from "@apollo/client";
import * as Dialog from "@radix-ui/react-dialog";
import { Xmark } from "iconoir-react";
import { useSearchParams } from "react-router-dom";

import Browser from "@/components/Browser";
import IconButton from "@/components/IconButton";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { GET_COURSES, ICatalogCourse, Semester } from "@/lib/api";

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
  const { width } = useWindowDimensions();

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

  // The browser will be responsive at 992px
  const block = useMemo(() => width <= 992, [width]);

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
            <Browser
              courses={courses}
              semester={Semester.Spring}
              year={2024}
              setClass={handleClass}
              responsive={block}
              block={block}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
