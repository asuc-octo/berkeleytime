import { PillSwitcher, Theme, useTheme } from "@repo/theme";

import useUser from "@/hooks/useUser";

import styles from "./Account.module.scss";
import profileStyles from "../Profile.module.scss";

const themeOptions = [
  { value: "system", label: "System preference" },
  { value: "light", label: "Light mode" },
  { value: "dark", label: "Dark mode" },
];

export default function Account() {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (value: string) => {
    setTheme(value === "system" ? null : (value as Theme));
  };

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
            <div className={styles.infoItem}>
              <label>Theme</label>
              <PillSwitcher
                items={themeOptions}
                value={theme ?? "system"}
                onValueChange={handleThemeChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
