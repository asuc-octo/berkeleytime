import classNames from "classnames";
import { ArrowRight, Menu, User } from "iconoir-react";
import { Link, NavLink } from "react-router-dom";

import { Button, Flex, IconButton, MenuItem } from "@repo/theme";

import useUser from "@/hooks/useUser";
import { signIn } from "@/lib/api";

import styles from "./NavigationBar.module.scss";
import SideBar from "./SideBar";

interface NavigationBarProps {
  invert?: boolean;
}

export default function NavigationBar({ invert }: NavigationBarProps) {
  const { user } = useUser();

  return (
    <Flex
      align="center"
      flexShrink="0"
      gap="3"
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
              Scheduler
            </MenuItem>
          )}
        </NavLink>
        <NavLink to="/gradtrak">
          {({ isActive }) => (
            <MenuItem className={styles.item} active={isActive}>
              Gradtrak
            </MenuItem>
          )}
        </NavLink>
        <NavLink to="/grades">
          {({ isActive }) => (
            <MenuItem className={styles.item} active={isActive}>
              Grades
            </MenuItem>
          )}
        </NavLink>
        <NavLink to="/enrollment">
          {({ isActive }) => (
            <MenuItem className={styles.item} active={isActive}>
              Enrollment
            </MenuItem>
          )}
        </NavLink>
        {/* <NavLink to="/about">
          {({ isActive }) => (
            <MenuItem className={styles.item} active={isActive}>
              About
            </MenuItem>
          )}
        </NavLink> */}
      </div>
      {user ? (
        <Button as={Link} to={"/profile"} className={styles.button}>
          {user.email}
          <User />
        </Button>
      ) : (
        <Button onClick={() => signIn()} className={styles.button}>
          Sign in
          <ArrowRight />
        </Button>
      )}
      {/* <PinsDrawer>
        <IconButton>
          <Pin />
        </IconButton>
      </PinsDrawer> */}
    </Flex>
  );
}
