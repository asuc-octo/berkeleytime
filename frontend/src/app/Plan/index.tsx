import { Book, Plus } from "iconoir-react";

import Button from "@/components/Button";
import IconButton from "@/components/IconButton";
import Units from "@/components/Units";
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
            <div className={styles.header}>
              <p className={styles.title}>Spring 2024</p>
              <Units unitsMin={12} unitsMax={20} />
              <IconButton>
                <Plus />
              </IconButton>
            </div>
            <div className={styles.body}>
              <div className={styles.course}>
                <div className={styles.text}>
                  <p className={styles.title}>COMPSCI 61A</p>
                  <p className={styles.description}>
                    The Structure and Interpretation of Computer Programs
                  </p>
                  <div className={styles.row}>
                    <div className={styles.badge}>
                      <Book />
                      Minor
                    </div>
                    <Units unitsMin={4} unitsMax={4} />
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.footer}>
              <Catalog
                semester={Semester.Spring}
                year={2024}
                setClass={() => {}}
              >
                <Button secondary>
                  <Plus />
                  Add class
                </Button>
              </Catalog>
            </div>
          </div>
          <div className={styles.semester}>
            <div className={styles.header}>
              <p className={styles.title}>Spring 2024</p>
              <Units unitsMin={12} unitsMax={20} />
              <IconButton>
                <Plus />
              </IconButton>
            </div>
            <div className={styles.body}>
              <div className={styles.course}>
                <div className={styles.text}>
                  <p className={styles.title}>COMPSCI 61A</p>
                  <p className={styles.description}>
                    The Structure and Interpretation of Computer Programs
                  </p>
                  <div className={styles.row}>
                    <div className={styles.badge}>
                      <Book />
                      Minor
                    </div>
                    <Units unitsMin={4} unitsMax={4} />
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.footer}>
              <Catalog
                semester={Semester.Spring}
                year={2024}
                setClass={() => {}}
              >
                <Button secondary>
                  <Plus />
                  Add class
                </Button>
              </Catalog>
            </div>
          </div>
          <div className={styles.semester}>
            <div className={styles.header}>
              <p className={styles.title}>Spring 2024</p>
              <Units unitsMin={12} unitsMax={20} />
              <IconButton>
                <Plus />
              </IconButton>
            </div>
            <div className={styles.body}>
              <div className={styles.course}>
                <div className={styles.text}>
                  <p className={styles.title}>COMPSCI 61A</p>
                  <p className={styles.description}>
                    The Structure and Interpretation of Computer Programs
                  </p>
                  <div className={styles.row}>
                    <div className={styles.badge}>
                      <Book />
                      Minor
                    </div>
                    <Units unitsMin={4} unitsMax={4} />
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.footer}>
              <Catalog
                semester={Semester.Spring}
                year={2024}
                setClass={() => {}}
              >
                <Button secondary>
                  <Plus />
                  Add class
                </Button>
              </Catalog>
            </div>
          </div>
          <div className={styles.semester}>
            <div className={styles.header}>
              <p className={styles.title}>Spring 2024</p>
              <Units unitsMin={12} unitsMax={20} />
              <IconButton>
                <Plus />
              </IconButton>
            </div>
            <div className={styles.body}>
              <div className={styles.course}>
                <div className={styles.text}>
                  <p className={styles.title}>COMPSCI 61A</p>
                  <p className={styles.description}>
                    The Structure and Interpretation of Computer Programs
                  </p>
                  <div className={styles.row}>
                    <div className={styles.badge}>
                      <Book />
                      Elective
                    </div>
                    <Units unitsMin={4} unitsMax={4} />
                  </div>
                </div>
              </div>
              <div className={styles.course}>
                <div className={styles.text}>
                  <p className={styles.title}>COMPSCI 61A</p>
                  <p className={styles.description}>
                    The Structure and Interpretation of Computer Programs
                  </p>
                  <div className={styles.row}>
                    <div className={styles.badge}>
                      <Book />
                      Minor
                    </div>
                    <Units unitsMin={4} unitsMax={4} />
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.footer}>
              <Catalog
                semester={Semester.Spring}
                year={2024}
                setClass={() => {}}
              >
                <Button secondary>
                  <Plus />
                  Add class
                </Button>
              </Catalog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
