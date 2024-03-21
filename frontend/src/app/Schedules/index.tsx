import { useState } from "react";

import classNames from "classnames";
import {
  ArrowSeparateVertical,
  ArrowUnionVertical,
  Link,
  MoreVert,
} from "iconoir-react";

import Button from "@/components/Button";
import IconButton from "@/components/IconButton";
import MenuItem from "@/components/MenuItem";

import AverageGrade from "../../components/AverageGrade";
import Capacity from "../../components/Capacity";
import Calendar from "./Calendar";
import { getY } from "./Calendar/calendar";
import Map from "./Map";
import styles from "./Schedules.module.scss";
import { IEvent } from "./types";

const exampleEventPreview: IEvent = {
  days: [false, true, false, true, false, true, false],
  startTime: "12:00",
  endTime: "13:59",
  kind: "Lecture",
  color: "var(--pink-500)",
  name: "AFRICAM 279",
  preview: true,
  id: 0,
};

const exampleEvents: IEvent[] = [
  {
    days: [true, true, true, true, true, true, true],
    startTime: "6:00",
    endTime: "8:59",
    kind: "Custom event",
    name: "Sleep",
    color: "var(--neutral-500)",
    id: 1,
  },
  {
    days: [false, true, false, true, false, true, false],
    startTime: "11:00",
    endTime: "12:59",
    kind: "COM LIT R1A",
    color: "var(--orange-500)",
    name: "AFRICAM 279",
    id: 3,
  },
  {
    days: [false, true, false, true, false, true, false],
    startTime: "13:00",
    endTime: "14:59",
    kind: "Lecture",
    color: "var(--yellow-500)",
    name: "AFRICAM 279",
    id: 4,
  },
  {
    days: [false, true, false, true, false, true, false],
    startTime: "13:00",
    endTime: "14:59",
    kind: "Lecture",
    color: "var(--green-500)",
    name: "AFRICAM 279",
    id: 5,
  },
  {
    days: [false, false, true, false, true, false, false],
    startTime: "15:00",
    endTime: "17:59",
    kind: "Discussion",
    color: "var(--violet-500)",
    name: "AFRICAM 279",
    id: 6,
  },
  {
    days: [true, true, true, true, true, true, true],
    startTime: "22:00",
    endTime: "23:59",
    kind: "Custom event",
    name: "Sleep",
    color: "var(--neutral-500)",
    id: 7,
  },
];

export default function Schedules() {
  const [tab, setTab] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [boundary, setBoundary] = useState<HTMLDivElement | null>(null);
  const [events, setEvents] = useState(exampleEvents);

  const handleMouseEnter = () => {
    setEvents((events) => [...events, exampleEventPreview]);

    const top = getY(exampleEventPreview.startTime);
    const bottom = getY(exampleEventPreview.endTime);

    boundary?.scrollTo({
      // Does not account for the height of the header
      top: top + (bottom - top) / 2 - boundary.clientHeight / 2,
      behavior: "smooth",
    });
  };

  const handleMouseLeave = () => {
    setEvents((events) => events.filter((event) => !event.preview));
  };

  return (
    <div className={styles.root}>
      <div className={styles.sideBar}>
        <div
          className={styles.course}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className={styles.border} />
          <div className={styles.body}>
            <div
              className={styles.header}
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ArrowUnionVertical /> : <ArrowSeparateVertical />}
              <div className={styles.text}>
                <p className={styles.heading}>AFRICAM 294</p>
                <p className={styles.description}>The Study of Modern Africa</p>
                <div className={styles.row}>
                  <AverageGrade averageGrade={3.5} />
                  <Capacity
                    count={20}
                    capacity={30}
                    waitlistCount={5}
                    waitlistCapacity={10}
                  />
                  <p className={styles.units}>4 units</p>
                </div>
              </div>
              {/*<div className={styles.toolBar}>
                <IconButton className={styles.iconButton}>
                  <MoreVertCircle />
                </IconButton>
  </div>*/}
            </div>
            {expanded && (
              <>
                <div className={styles.group}>
                  <p className={styles.label}>Lectures</p>
                  <div className={classNames(styles.section, styles.active)}>
                    <div className={styles.radioButton} />
                    <div className={styles.text}>
                      <p className={styles.title}>
                        <span className={styles.important}>Lecture 001</span>{" "}
                        (CCN: 23546)
                      </p>
                    </div>
                  </div>
                  <div className={styles.section}>
                    <div className={styles.radioButton}></div>
                    <div className={styles.text}>
                      <p className={styles.title}>Lecture 001</p>
                    </div>
                  </div>
                </div>
                <div className={styles.group}>
                  <p className={styles.label}>Discussions</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
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
            <Calendar boundary={boundary} events={events} />
          ) : (
            <Map boundary={boundary} />
          )}
        </div>
      </div>
    </div>
  );
}
