import classNames from "classnames";
import { LogOut, ProfileCircle } from "iconoir-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";



import { useReadUser } from "@/hooks/api";

import { signOut } from "@/lib/api";

import styles from "./Profile.module.scss";
import UserContext from "@/contexts/UserContext";

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
              <div className={classNames(styles.navItem, {
                [styles.active]: isActive,
              })}>
                <ProfileCircle />
                <span>Your Account</span>
              </div>
            )}
          </NavLink>
          <NavLink to={{ ...location, pathname: "support" }} end>
            {({ isActive }) => (
              <div className={classNames(styles.navItem, {
                [styles.active]: isActive,
              })}>
                <ProfileCircle />
                <span>Support</span>
              </div>
            )}
          </NavLink>
          <div className={styles.navItem} onClick={() => signOut()}>
            <LogOut />
            <span>Sign Out</span>
          </div>
        </div>
        { user && <UserContext
          value={{
            user
          }}
        >
          <Outlet/>
        </UserContext> }
      </div>
    </div>
  );
}