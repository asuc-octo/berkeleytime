import { useMemo } from "react";

import { useQuery } from "@apollo/client";
import classNames from "classnames";
import { ArrowRight, Menu, User } from "iconoir-react";
import { Link, NavLink } from "react-router-dom";

import Button from "@/components/Button";
import IconButton from "@/components/IconButton";
import MenuItem from "@/components/MenuItem";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { GET_USER, UserResponse, signIn, signOut } from "@/lib/api";

import styles from "./NavigationBar.module.scss";

interface NavigationBarProps {
  invert?: boolean;
}

export default function NavigationBar({ invert }: NavigationBarProps) {
  const { width } = useWindowDimensions();

  const { data } = useQuery<UserResponse>(GET_USER);

  const user = useMemo(() => data?.user, [data]);

  return (
    <div
      className={classNames(styles.root, {
        [styles.invert]: invert,
      })}
    >
      <Link className={styles.brand} to="/">
        Berkeleytime
      </Link>
      {width <= 992 ? (
        <IconButton className={styles.iconButton}>
          <Menu />
        </IconButton>
      ) : (
        <>
          <div className={styles.menu}>
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
            className={styles.button}
          >
            {user ? user.email : "Sign in"}
            {user ? <User /> : <ArrowRight />}
          </Button>
        </>
      )}
    </div>
  );
}
