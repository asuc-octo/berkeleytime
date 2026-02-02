import { LogOut, User, WebWindow } from "iconoir-react";
import { Link, NavLink } from "react-router-dom";

import { Button, DropdownMenu, Flex, MenuItem } from "@repo/theme";

import { BASE } from "@/helper";

import { useReadUser } from "../../hooks/api/users";
import { signOut } from "../../lib/api/users";
import styles from "./NavigationBar.module.scss";

export default function NavigationBar() {
  const { data: user } = useReadUser();

  return (
    <Flex align="center" flexShrink="0" gap="3" className={styles.root}>
      <Link className={styles.brand} to="/">
        Bt Staff
      </Link>
      <div className={styles.group}>
        <NavLink to="/" end>
          {({ isActive }) => <MenuItem active={isActive}>Analytics</MenuItem>}
        </NavLink>
        <NavLink to="/members">
          {({ isActive }) => <MenuItem active={isActive}>Members</MenuItem>}
        </NavLink>
        <NavLink to="/outreach">
          {({ isActive }) => <MenuItem active={isActive}>Outreach</MenuItem>}
        </NavLink>
        <NavLink to="/advertisements">
          {({ isActive }) => <MenuItem active={isActive}>Ads</MenuItem>}
        </NavLink>
      </div>
      {user && (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button>
              {user.name?.split(" ")[0] ?? "Profile"}
              <User />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content sideOffset={5} align="end">
            <DropdownMenu.Item asChild>
              <a href={BASE}>
                <WebWindow width={18} height={18} /> Return to Bt
              </a>
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item onSelect={() => signOut()}>
              <LogOut width={18} height={18} /> Sign Out
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      )}
    </Flex>
  );
}
