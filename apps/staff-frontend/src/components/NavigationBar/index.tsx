import { HalfMoon, SunLight } from "iconoir-react";
import { Link, useLocation } from "react-router-dom";

import { DropdownMenu, Flex, IconButton, useTheme } from "@repo/theme";

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
  const location = useLocation();

  return (
    <Flex align="center" flexShrink="0" gap="3" className={styles.root}>
      <Link className={styles.brand} to="/">
        Berkeleytime [Staff]
      </Link>
      <div style={{ marginLeft: "auto" }} />
      <nav className={styles.nav}>
        <Link
          to="/"
          className={`${styles.navLink} ${
            location.pathname === "/" ? styles.navLinkActive : ""
          }`}
        >
          Members
        </Link>
        <Link
          to="/stats"
          className={`${styles.navLink} ${
            location.pathname === "/stats" ? styles.navLinkActive : ""
          }`}
        >
          Stats
        </Link>
      </nav>
      <ThemeDropdown theme={theme} setTheme={setTheme} />
    </Flex>
  );
}
