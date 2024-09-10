import { useQuery } from "@apollo/client";
import classNames from "classnames";
import { ArrowRight, Menu, User } from "iconoir-react";
import { Link, NavLink } from "react-router-dom";

import Button from "@/components/Button";
import IconButton from "@/components/IconButton";
import MenuItem from "@/components/MenuItem";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { AccountResponse, GET_ACCOUNT, signIn, signOut } from "@/lib/api";

import styles from "./NavigationBar.module.scss";

interface NavigationBarProps {
  invert?: boolean;
}

export default function NavigationBar({ invert }: NavigationBarProps) {
  const { width } = useWindowDimensions();

  const { data: account } = useQuery<AccountResponse>(GET_ACCOUNT);

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
        <IconButton invert={invert}>
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
            <NavLink to="/plan">
              {({ isActive }) => (
                <MenuItem className={styles.item} active={isActive}>
                  My plan
                </MenuItem>
              )}
            </NavLink>
            <NavLink to="/explore">
              {({ isActive }) => (
                <MenuItem className={styles.item} active={isActive}>
                  Explore
                </MenuItem>
              )}
            </NavLink>
          </div>
          {account ? (
            <Button onClick={() => signOut()} className={styles.button}>
              {account.user.email}
              <User />
            </Button>
          ) : (
            <Button onClick={() => signIn()} className={styles.button}>
              Sign in
              <ArrowRight />
            </Button>
          )}
        </>
      )}
    </div>
  );
}
