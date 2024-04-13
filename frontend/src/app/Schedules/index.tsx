import { useMemo, useState } from "react";

import { Link, MoreVert } from "iconoir-react";

import Button from "@/components/Button";
import IconButton from "@/components/IconButton";
import MenuItem from "@/components/MenuItem";
import { IClass } from "@/lib/api";

import Calendar from "./Calendar";
import Map from "./Map";
import styles from "./Schedules.module.scss";
import SideBar from "./SideBar";

export default function Schedules() {
  const [tab, setTab] = useState(0);
  const [boundary, setBoundary] = useState<HTMLDivElement | null>(null);
  const [classes, setClasses] = useState<IClass[]>([]);

  const sections = useMemo(
    () => classes.map((_class) => _class.primarySection),
    [classes]
  );

  return (
    <div className={styles.root}>
      <SideBar classes={classes} setClasses={setClasses} />
      <div className={styles.view}>
        <div className={styles.header}>
          <div className={styles.menu}>
            <MenuItem active={tab === 0} onClick={() => setTab(0)}>
              Schedule
            </MenuItem>
            {/*<MenuItem>Exams</MenuItem>*/}
            <MenuItem active={tab === 1} onClick={() => setTab(1)}>
              Itinerary
            </MenuItem>
          </div>
          <Button>
            <Link />
            Share
          </Button>
          <IconButton>
            <MoreVert />
          </IconButton>
        </div>
        <div
          className={styles.boundary}
          ref={(element) => setBoundary(element)}
        >
          {tab === 0 ? (
            <Calendar boundary={boundary} sections={sections} />
          ) : (
            <Map boundary={boundary} />
          )}
        </div>
      </div>
    </div>
  );
}
