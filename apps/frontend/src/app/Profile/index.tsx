import classNames from "classnames";
import {
  Bell,
  ChatBubbleQuestion,
  LogOut,
  ProfileCircle,
  Star,
} from "iconoir-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import UserContext from "@/contexts/UserContext";
import { useReadUser } from "@/hooks/api";
import { signOut } from "@/lib/api";

import styles from "./Profile.module.scss";

export default function Root() {
  const location = useLocation();

  const { data: user, loading: userLoading } = useReadUser();

  const navigate = useNavigate();

  if (!userLoading && !user) {
    navigate("..");
  }

  return (
    <div className={styles.root}>
      <div className={styles.body}>
        <div className={styles.sidebar}>
          <NavLink to={{ ...location, pathname: "." }} end>
            {({ isActive }) => (
              <div
                className={classNames(styles.navItem, {
                  [styles.active]: isActive,
                })}
              >
                <ProfileCircle />
                <span>Your Account</span>
              </div>
            )}
          </NavLink>
          <NavLink to={{ ...location, pathname: "notifications" }} end>
            {({ isActive }) => (
              <div
                className={classNames(styles.navItem, {
                  [styles.active]: isActive,
                })}
              >
                <Bell />
                <span>Notifications</span>
              </div>
            )}
          </NavLink>
          <NavLink to={{ ...location, pathname: "ratings" }} end>
            {({ isActive }) => (
              <div
                className={classNames(styles.navItem, {
                  [styles.active]: isActive,
                })}
              >
                <Star />
                <span>Ratings</span>
              </div>
            )}
          </NavLink>
          <NavLink to={{ ...location, pathname: "support" }} end>
            {({ isActive }) => (
              <div
                className={classNames(styles.navItem, {
                  [styles.active]: isActive,
                })}
              >
                <ChatBubbleQuestion />
                <span>Support</span>
              </div>
            )}
          </NavLink>
          <div className={styles.navItem} onClick={() => signOut()}>
            <LogOut />
            <span>Sign Out</span>
          </div>
        </div>
        {user && (
          <UserContext
            value={{
              user,
            }}
          >
            <Outlet />
          </UserContext>
        )}
      </div>
    </div>
  );
}
