import classNames from "classnames";
import { ArrowRight } from "iconoir-react";
import { Link, NavLink } from "react-router-dom";

import MenuItem from "@/components/MenuItem";

import Button from "../Button";
import styles from "./Header.module.scss";

interface HeaderProps {
  transparent?: boolean;
}

export default function Header({ transparent }: HeaderProps) {
  return (
    <div
      className={classNames(styles.root, {
        [styles.transparent]: transparent,
      })}
    >
      <Link className={styles.brand} to="/">
        Berkeleytime
      </Link>
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
              Grades
            </MenuItem>
          )}
        </NavLink>
        <NavLink to="/grades">
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
        <NavLink to="/enrollment">
          {({ isActive }) => (
            <MenuItem active={isActive} className={styles.item}>
              Schedules
            </MenuItem>
          )}
        </NavLink>
      </div>
      <Button as="a" href="/sign-in" className={styles.button}>
        Sign in
        <ArrowRight />
      </Button>
    </div>
  );
}
