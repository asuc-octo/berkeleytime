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
            <MenuItem as={NavLink} to="/catalog" className={styles.item}>
              Courses
            </MenuItem>
            <MenuItem as={NavLink} to="/schedules" className={styles.item}>
              My schedules
            </MenuItem>
            <MenuItem as={NavLink} to="/plan" className={styles.item}>
              My plan
            </MenuItem>
            <MenuItem as={NavLink} to="/grades" className={styles.item}>
              Grades
            </MenuItem>
            <MenuItem as={NavLink} to="/enrollment" className={styles.item}>
              Enrollment
            </MenuItem>
            <MenuItem as={NavLink} to="/resources" className={styles.item}>
              Resources
            </MenuItem>
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
