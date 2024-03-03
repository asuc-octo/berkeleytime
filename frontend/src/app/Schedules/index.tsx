import { Link, MoreVert } from "iconoir-react";

import Button from "@/components/Button";
import IconButton from "@/components/IconButton";
import MenuItem from "@/components/MenuItem";

import Calendar from "./Calendar";
import styles from "./Schedules.module.scss";

export default function Schedules() {
  return (
    <div className={styles.root}>
      <div className={styles.sideBar}></div>
      <div className={styles.view}>
        <div className={styles.header}>
          <div className={styles.menu}>
            <MenuItem active>Sections</MenuItem>
            <MenuItem>Exams</MenuItem>
          </div>
          <Button>
            <Link />
            Share
          </Button>
          <IconButton>
            <MoreVert />
          </IconButton>
        </div>
        <div className={styles.calendar}>
          <Calendar />
        </div>
      </div>
    </div>
  );
}
