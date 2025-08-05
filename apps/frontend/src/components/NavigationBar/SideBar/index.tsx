import { ReactNode } from "react";

import { Xmark } from "iconoir-react";
import { Link } from "react-router-dom";

import { Dialog, IconButton } from "@repo/theme";

import styles from "./SideBar.module.scss";

interface SideBarProps {
  children: ReactNode;
}

export default function SideBar({ children }: SideBarProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Drawer align="start" className={styles.drawer}>
          <div className={styles.header}>
            <Link className={styles.brand} to="/">
              Berkeleytime
            </Link>
            <Dialog.Close asChild>
              <IconButton>
                <Xmark />
              </IconButton>
            </Dialog.Close>
          </div>
          <div className={styles.body}>
            <div className={styles.group}>
              <p className={styles.label}>Academics</p>
              {/* <Link className={styles.item} to="/catalog">
              Dicover
            </Link> */}
              <Link className={styles.item} to="/catalog">
                Catalog
              </Link>
              {/* <Link className={styles.item} to="/catalog">
              Courses
            </Link> */}
            </div>
            <div className={styles.group}>
              <p className={styles.label}>Career</p>
              <Link className={styles.item} to="/schedules">
                My schedules
              </Link>
              {/* <Link className={styles.item} to="/plans">
              My plans
            </Link> */}
              {/* <Link className={styles.item} to="/catalog">
              Pathways
            </Link> */}
            </div>
            <div className={styles.group}>
              <p className={styles.label}>Tools</p>
              <Link className={styles.item} to="/grades">
                Grade distributions
              </Link>
              <Link className={styles.item} to="/enrollment">
                Enrollment over time
              </Link>
              {/* <Link className={styles.item} to="/catalog">
              GPA calculator
            </Link> */}
            </div>
            {/* <div className={styles.group}>
              <p className={styles.label}>Organization</p>
              <Link className={styles.item} to="/about">
                About us
              </Link>
              <Link className={styles.item} to="/catalog">
              Frequently asked questions
            </Link>
              <Link className={styles.item} to="/">
                Terms of service
              </Link>
              <Link className={styles.item} to="/">
                Privacy policy
              </Link>
              <Link className={styles.item} to="/catalog">
              Data API
            </Link>
            </div> */}
          </div>
        </Dialog.Drawer>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
