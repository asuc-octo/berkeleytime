import classNames from "classnames";
import {
  Bookmark,
  ChatBubbleQuestion,
  ProfileCircle,
  Star,
} from "iconoir-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import UserContext from "@/contexts/UserContext";
import { useReadUser } from "@/hooks/api";

// eslint-disable-next-line css-modules/no-unused-class
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
          <div className={styles.navGroup}>
            <NavLink to={{ ...location, pathname: "." }} end>
              {({ isActive }) => (
                <div
                  className={classNames(styles.navItem, {
                    [styles.active]: isActive,
                  })}
                >
                  <ProfileCircle />
                  <span>Account</span>
                </div>
              )}
            </NavLink>
            <NavLink to={{ ...location, pathname: "bookmarks" }} end>
              {({ isActive }) => (
                <div
                  className={classNames(styles.navItem, {
                    [styles.active]: isActive,
                  })}
                >
                  <Bookmark />
                  <span>Bookmarks</span>
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
          </div>
        </div>
        <div className={styles.content}>
          {user && (
            <UserContext
              value={{
                user,
                loading: userLoading,
              }}
            >
              <Outlet />
            </UserContext>
          )}
        </div>
      </div>
    </div>
  );
}
