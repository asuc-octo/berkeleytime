import { useMemo, useState } from "react";

import { useQuery } from "@apollo/client";
import * as Dialog from "@radix-ui/react-dialog";
import { Xmark } from "iconoir-react";
import { useSearchParams } from "react-router-dom";

import Browser from "@/components/Browser";
import IconButton from "@/components/IconButton";
import { GET_COURSES, ICatalogCourse, Semester } from "@/lib/api";

import styles from "./Catalog.module.scss";

interface CatalogProps {
  onClick: (course: ICatalogCourse, number: string) => void;
  children: JSX.Element;
  semester: string;
  year: number;
}

export default function Catalog({
  onClick,
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

  const handleClick = (course: ICatalogCourse, number: string) => {
    onClick(course, number);

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
            <Browser
              courses={courses}
              currentSemester={Semester.Spring}
              currentYear={2024}
              onClassSelect={handleClick}
              responsive={false}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
