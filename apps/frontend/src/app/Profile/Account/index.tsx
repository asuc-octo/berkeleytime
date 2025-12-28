import { LogOut } from "iconoir-react";

import { Button } from "@repo/theme";

import useUser from "@/hooks/useUser";
import { signOut } from "@/lib/api";

import profileStyles from "../Profile.module.scss";
import styles from "./Account.module.scss";

export default function Account() {
  const { user } = useUser();

  return (
    <div className={profileStyles.contentInner}>
      <h1 className={profileStyles.pageTitle}>Account</h1>
      <div className={profileStyles.pageContent}>
        <div className={profileStyles.section}>
          <h2 className={profileStyles.sectionTitle}>Personal Information</h2>
          <div>
            <div className={styles.infoItem}>
              <label>Full Name</label>
              <span className={styles.infoValue}>{user?.name}</span>
            </div>
            <div className={styles.infoItem}>
              <label>bConnected Email</label>
              <span className={styles.infoValue}>{user?.email}</span>
            </div>
            <div className={styles.infoItem}>
              <label>Student Account</label>
              <span className={styles.infoValue}>
                {user?.student ? "Yes" : "No"}
              </span>
            </div>
          </div>
          <Button
            variant="tertiary"
            onClick={() => signOut()}
            style={{ color: "var(--red-500)" }}
          >
            <LogOut width={16} height={16} />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
