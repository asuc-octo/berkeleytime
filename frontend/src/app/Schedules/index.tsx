import { useState } from "react";

import { ShareIos } from "iconoir-react";

import Button from "@/components/Button";
import MenuItem from "@/components/MenuItem";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { IClass, ISection } from "@/lib/api";

import Calendar from "./Calendar";
import Map from "./Map";
import styles from "./Schedules.module.scss";
import SideBar from "./SideBar";

export default function Schedules() {
  const [tab, setTab] = useState(0);
  const [boundary, setBoundary] = useState<HTMLDivElement | null>(null);
  const [classes, setClasses] = useState<IClass[]>([]);
  const [selectedSections, setSelectedSections] = useState<ISection[]>([]);
  const { width } = useWindowDimensions();

  return (
    <div className={styles.root}>
      {width > 992 && (
        <SideBar
          classes={classes}
          setClasses={setClasses}
          selectedSections={selectedSections}
          setSelectedSections={setSelectedSections}
        />
      )}
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
            Share
            <ShareIos />
          </Button>
        </div>
        <div
          className={styles.boundary}
          ref={(element) => setBoundary(element)}
        >
          {tab === 0 ? (
            <Calendar boundary={boundary} sections={selectedSections} />
          ) : (
            <Map boundary={boundary} />
          )}
        </div>
      </div>
    </div>
  );
}
