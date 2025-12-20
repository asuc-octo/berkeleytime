import { HalfMoon, LogOut, SunLight, User, WebWindow } from "iconoir-react";
import { Link, NavLink } from "react-router-dom";

import { Button, DropdownMenu, Flex, IconButton, MenuItem, useTheme } from "@repo/theme";

import { BASE } from "../../App";
import { useReadUser } from "../../hooks/api/users";
import { signOut } from "../../lib/api/users";
import styles from "./NavigationBar.module.scss";

const ThemeDropdown = ({
  theme,
  setTheme,
}: {
  theme: "light" | "dark" | null;
  setTheme: (theme: "light" | "dark" | null) => void;
}) => {
  const systemPrefersDark =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const effectiveTheme =
    theme === null ? (systemPrefersDark ? "dark" : "light") : theme;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <IconButton className={styles.themeButton} aria-label="Toggle theme">
          {effectiveTheme === "light" ? (
            <SunLight width={18} height={18} />
          ) : (
            <HalfMoon width={18} height={18} />
          )}
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        sideOffset={5}
        align="end"
        className={styles.themeDropdown}
      >
        <DropdownMenu.Item
          className={styles.themeDropdownItem}
          onSelect={() => setTheme("light")}
        >
          Light
        </DropdownMenu.Item>
        <DropdownMenu.Item
          className={styles.themeDropdownItem}
          onSelect={() => setTheme("dark")}
        >
          Dark
        </DropdownMenu.Item>
        <DropdownMenu.Item
          className={styles.themeDropdownItem}
          onSelect={() => setTheme(null)}
        >
          System
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export default function NavigationBar() {
  const { theme, setTheme } = useTheme();
  const { data: user } = useReadUser();

  return (
    <Flex align="center" flexShrink="0" gap="3" className={styles.root}>
      <Link className={styles.brand} to="/">
        Berkeleytime [Staff]
      </Link>
      <div className={styles.group}>
        <NavLink to="/" end>
          {({ isActive }) => (
            <MenuItem active={isActive}>Members</MenuItem>
          )}
        </NavLink>
        <NavLink to="/stats">
          {({ isActive }) => (
            <MenuItem active={isActive}>Stats</MenuItem>
          )}
        </NavLink>
      </div>
      <ThemeDropdown theme={theme} setTheme={setTheme} />
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
