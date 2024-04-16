import Button from "@/components/Button";
import { Semester } from "@/lib/api";

import Catalog from "./Catalog";
import styles from "./Plan.module.scss";

export default function Plan() {
  return (
    <div className={styles.root}>
      <div className={styles.sideBar}></div>
      <div className={styles.view}>
        <div className={styles.body}>
          <div className={styles.semester}>
            <Catalog semester={Semester.Spring} year={2024} setClass={() => {}}>
              <Button>Add class</Button>
            </Catalog>
          </div>
          <div className={styles.semester}></div>
          <div className={styles.semester}></div>
        </div>
      </div>
    </div>
  );
}
