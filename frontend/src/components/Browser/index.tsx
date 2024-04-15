import { useState } from "react";

import classNames from "classnames";

import { ICatalogCourse } from "@/lib/api";

import styles from "./Browser.module.scss";
import Filters from "./Filters";
import List from "./List";

interface BrowserProps {
  courses: ICatalogCourse[];
  setClass: (course: ICatalogCourse, number: string) => void;
  responsive: boolean;
  block?: boolean;
}

export default function Browser({
  courses,
  setClass,
  responsive,
  block,
}: BrowserProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={classNames(styles.root, { [styles.block]: block })}>
      {(open || !responsive) && (
        <Filters responsive={responsive} block={block} />
      )}
      <List
        courses={courses}
        setClass={setClass}
        setOpen={setOpen}
        open={open}
        responsive={responsive}
        block={block}
      />
    </div>
  );
}
