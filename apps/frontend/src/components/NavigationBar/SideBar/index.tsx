import { ReactNode } from "react";

import { Xmark } from "iconoir-react";
import { Link } from "react-router-dom";

import { Dialog, IconButton } from "@repo/theme";

import { RecentType, getPageUrl } from "@/lib/recent";

import styles from "./SideBar.module.scss";

interface SideBarProps {
  children: ReactNode;
}

export default function SideBar({ children }: SideBarProps) {
  const savedGradesUrl = getPageUrl(RecentType.GradesPage);
  const gradesPath = savedGradesUrl ? `/grades${savedGradesUrl}` : "/grades";
  const savedEnrollmentUrl = getPageUrl(RecentType.EnrollmentPage);
  const enrollmentPath = savedEnrollmentUrl
    ? `/enrollment${savedEnrollmentUrl}`
    : "/enrollment";

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Drawer align="start" className={styles.drawer}>
          <div className={styles.header}>
            <span className={styles.brand}>Berkeleytime</span>
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
              <Link className={styles.item} to="/curated">
                Curated classes
              </Link>
            </div>
            <div className={styles.group}>
              <p className={styles.label}>Career</p>
              <Link className={styles.item} to="/schedules">
                Scheduler
              </Link>
              <Link className={styles.item} to="/gradtrak">
                Gradtrak
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
              <Link className={styles.item} to={gradesPath}>
                Grade distributions
              </Link>
              <Link className={styles.item} to={enrollmentPath}>
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
