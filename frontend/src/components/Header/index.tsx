import classNames from "classnames";
import { ArrowRight, Menu, User } from "iconoir-react";
import { Link, NavLink } from "react-router-dom";

import Button from "@/components/Button";
import IconButton from "@/components/IconButton";
import MenuItem from "@/components/MenuItem";
import { useAccount } from "@/hooks/useAccount";
import useWindowDimensions from "@/hooks/useWindowDimensions";

import styles from "./Header.module.scss";

interface HeaderProps {
  invert?: boolean;
}

export default function Header({ invert }: HeaderProps) {
  const { width } = useWindowDimensions();
  const { account, signIn, signOut } = useAccount();

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
                <MenuItem active={isActive} className={styles.item}>
                  Courses
                </MenuItem>
              )}
            </NavLink>
            <NavLink to="/schedules">
              {({ isActive }) => (
                <MenuItem active={isActive} className={styles.item}>
                  My schedules
                </MenuItem>
              )}
            </NavLink>
            <NavLink to="/plan">
              {({ isActive }) => (
                <MenuItem active={isActive} className={styles.item}>
                  My plan
                </MenuItem>
              )}
            </NavLink>
            <NavLink to="/grades">
              {({ isActive }) => (
                <MenuItem active={isActive} className={styles.item}>
                  Grades
                </MenuItem>
              )}
            </NavLink>
            <NavLink to="/enrollment">
              {({ isActive }) => (
                <MenuItem active={isActive} className={styles.item}>
                  Enrollment
                </MenuItem>
              )}
            </NavLink>
            <NavLink to="/resources">
              {({ isActive }) => (
                <MenuItem active={isActive} className={styles.item}>
                  Resources
                </MenuItem>
              )}
            </NavLink>
          </div>
          {account ? (
            <Button onClick={() => signOut()} className={styles.button}>
              {account.email}
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
