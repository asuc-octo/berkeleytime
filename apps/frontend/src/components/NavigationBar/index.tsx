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
            <MenuItem as={NavLink} to="/discover" className={styles.item}>
              Discover
            </MenuItem>
            <MenuItem as={NavLink} to="/catalog" className={styles.item}>
              Catalog
            </MenuItem>
            <MenuItem as={NavLink} to="/enrollment" className={styles.item}>
              Enrollment
            </MenuItem>
            <MenuItem as={NavLink} to="/grades" className={styles.item}>
              Grades
            </MenuItem>
            <MenuItem as={NavLink} to="/schedules" className={styles.item}>
              My schedules
            </MenuItem>
            <MenuItem as={NavLink} to="/plan" className={styles.item}>
              My plan
            </MenuItem>
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