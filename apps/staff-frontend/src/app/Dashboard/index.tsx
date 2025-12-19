import { Book, DataTransferBoth, GraphUp, Group } from "iconoir-react";

import { useUser } from "@/contexts/UserContext";

import styles from "./Dashboard.module.scss";

export default function Dashboard() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className={styles.root}>
        <div className={styles.container}>
          <p className={styles.subtitle}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.root}>
        <div className={styles.container}>
          <h1 className={styles.title}>Staff Dashboard</h1>
          <p className={styles.subtitle}>
            Please sign in to access the staff dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <h1 className={styles.title}>Welcome, {user.name?.split(" ")[0]}!</h1>
        <p className={styles.subtitle}>
          Manage Berkeleytime data and configurations.
        </p>

        <div className={styles.grid}>
          <div className={styles.card}>
            <Book width={32} height={32} />
            <span className={styles.cardTitle}>Courses</span>
            <span className={styles.cardDescription}>
              Manage course data and metadata
            </span>
          </div>

          <div className={styles.card}>
            <DataTransferBoth width={32} height={32} />
            <span className={styles.cardTitle}>Data Pipeline</span>
            <span className={styles.cardDescription}>
              Monitor and trigger data pulls
            </span>
          </div>

          <div className={styles.card}>
            <GraphUp width={32} height={32} />
            <span className={styles.cardTitle}>Analytics</span>
            <span className={styles.cardDescription}>
              View site usage and metrics
            </span>
          </div>

          <div className={styles.card}>
            <Group width={32} height={32} />
            <span className={styles.cardTitle}>Users</span>
            <span className={styles.cardDescription}>
              Manage user accounts and permissions
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

