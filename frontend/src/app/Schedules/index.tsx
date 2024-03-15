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

import AverageGrade from "../Catalog/AverageGrade";
import Capacity from "../Catalog/Capacity";
import Calendar from "./Calendar";
import Map from "./Map";
import styles from "./Schedules.module.scss";

export default function Schedules() {
  const [tab, setTab] = useState(0);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={styles.root}>
      <div className={styles.sideBar}>
        <div className={styles.course}>
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
                  <div className={styles.section}>
                    <div
                      className={classNames(styles.radioButton, styles.active)}
                    />
                    <div className={styles.text}>
                      <p className={styles.title}>Lecture 001</p>
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
              Sections
            </MenuItem>
            {/*<MenuItem>Exams</MenuItem>*/}
            <MenuItem active={tab === 1} onClick={() => setTab(1)}>
              Map
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
        {tab === 0 ? (
          <div className={styles.sections}>
            <Calendar />
          </div>
        ) : (
          <div className={styles.map}>
            <Map />
          </div>
        )}
      </div>
    </div>
  );
}
