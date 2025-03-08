import { useState } from "react";

import classNames from "classnames";
import { HelpCircle, LogOut, ProfileCircle, Star } from "iconoir-react";
import { useNavigate } from "react-router-dom";

import { useReadUser } from "@/hooks/api/users/useReadUser";
import { signOut } from "@/lib/api";
import { IUser } from "@/lib/api";

import styles from "./Profile.module.scss";

function YourAccount({ user }: { user: IUser | undefined }) {
  if (!user) return <></>;
  return (
    <div>
      <h2>Personal Information</h2>
      <div>
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

  const navigate = useNavigate();

  if (!userLoading && !user) {
    navigate("..");
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
          <div className={styles.navItem} onClick={() => signOut()}>
            <LogOut />
            <span>Sign Out</span>
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
