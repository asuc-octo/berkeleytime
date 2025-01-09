import { useState } from "react";

import classNames from "classnames";
import { HelpCircle, ProfileCircle, Star } from "iconoir-react";

import { useReadUser } from "@/hooks/api/users/useReadUser";
import { signIn } from "@/lib/api";
import { IUser } from "@/lib/api";

import styles from "./Profile.module.scss";

function YourAccount({ user }: { user: IUser | undefined }) {
  if (!user) return <></>;
  return (
    <div>
      <h2>Personal Information</h2>
      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <label>bConnected Email</label>
          <span className={styles.infoValue}>{user.email}</span>
        </div>
        <div className={styles.infoItem}>
          <label>Student Account</label>
          <span className={styles.infoValue}>
            {user.student ? "Yes" : "No"}
          </span>
        </div>
      </div>
    </div>
  );
}

function YourRatings() {
  return <div></div>;
}

function Support() {
  return <div></div>;
}

export default function Profile() {
  const { data: user, loading: userLoading } = useReadUser();

  const [activeView, changeActiveView] = useState(0);

  if (!userLoading && !user) {
    signIn();
  }

  return (
    <div className={styles.root}>
      <h1>
        {activeView == 0
          ? "Your Account"
          : activeView == 1
            ? "Your Ratings"
            : "Support"}
      </h1>
      <div className={styles.body}>
        <div className={styles.sidebar}>
          <div
            className={classNames(styles.navItem, {
              [styles.active]: activeView == 0,
            })}
            onClick={() => changeActiveView(0)}
          >
            <ProfileCircle />
            <span>Your Account</span>
          </div>
          <div
            className={classNames(styles.navItem, {
              [styles.active]: activeView == 1,
            })}
            onClick={() => changeActiveView(1)}
          >
            <Star />
            <span>Your Ratings</span>
          </div>
          <div
            className={classNames(styles.navItem, {
              [styles.active]: activeView == 2,
            })}
            onClick={() => changeActiveView(2)}
          >
            <HelpCircle />
            <span>Support</span>
          </div>
        </div>
        {userLoading ? (
          <></>
        ) : activeView == 0 ? (
          <YourAccount user={user} />
        ) : activeView == 1 ? (
          <YourRatings />
        ) : (
          <Support />
        )}
      </div>
    </div>
  );
}
