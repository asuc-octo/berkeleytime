import classNames from "classnames";
import { ArrowRight, Menu, Pin, User } from "iconoir-react";
import { Link, NavLink } from "react-router-dom";

import { Button, IconButton, MenuItem } from "@repo/theme";

import { useReadUser } from "@/hooks/api";
import { signIn, signOut } from "@/lib/api";

import PinsDrawer from "../Layout/Pins";
import styles from "./NavigationBar.module.scss";
import SideBar from "./SideBar";

interface NavigationBarProps {
  invert?: boolean;
}

export default function NavigationBar({ invert }: NavigationBarProps) {
  const { data: user } = useReadUser();

  return (
    <div
      className={classNames(styles.root, {
        [styles.invert]: invert,
      })}
    >
      <SideBar>
        <IconButton className={styles.iconButton}>
          <Menu />
        </IconButton>
      </SideBar>
      <Link className={styles.brand} to="/">
        Berkeleytime
      </Link>
      <div className={styles.group}>
        <NavLink to="/catalog">
          {({ isActive }) => (
            <MenuItem className={styles.item} active={isActive}>
              Catalog
            </MenuItem>
          )}
        </NavLink>
        <NavLink to="/schedules">
          {({ isActive }) => (
            <MenuItem className={styles.item} active={isActive}>
              My schedules
            </MenuItem>
          )}
        </NavLink>
        <NavLink to="/about">
          {({ isActive }) => (
            <MenuItem className={styles.item} active={isActive}>
              About
            </MenuItem>
          )}
        </NavLink>
      </div>
      <Button
        onClick={() => (user ? signOut() : signIn())}
        variant="solid"
        className={styles.button}
      >
        {user ? user.email : "Sign in"}
        {user ? <User /> : <ArrowRight />}
      </Button>
      <PinsDrawer>
        <IconButton>
          <Pin />
        </IconButton>
      </PinsDrawer>
    </div>
  );
}
