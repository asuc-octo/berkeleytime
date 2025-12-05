import classNames from "classnames";
import {
  ArrowRight,
  Bookmark,
  ChatBubbleQuestion,
  HalfMoon,
  LogOut,
  Menu,
  ProfileCircle,
  Star,
  SunLight,
  User,
} from "iconoir-react";
import { Link, NavLink } from "react-router-dom";

import {
  Button,
  DropdownMenu,
  Flex,
  IconButton,
  MenuItem,
  useTheme,
} from "@repo/theme";

import useUser from "@/hooks/useUser";
import { signIn, signOut } from "@/lib/api";

import styles from "./NavigationBar.module.scss";
import SideBar from "./SideBar";

interface NavigationBarProps {
  invert?: boolean;
  accentColor?: string;
}

const ThemeDropdown = ({
  theme,
  setTheme,
  forceTheme,
}: {
  theme: "light" | "dark" | null;
  setTheme: (theme: "light" | "dark" | null) => void;
  forceTheme?: "light" | "dark";
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
        forceTheme={forceTheme}
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

export default function NavigationBar({
  invert,
  accentColor,
}: NavigationBarProps) {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();

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
      <ThemeDropdown
        theme={theme}
        setTheme={setTheme}
        forceTheme={invert ? "light" : undefined}
      />
      {user ? (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button className={styles.button} style={{ color: accentColor }}>
              {user.name?.split(" ")[0] ?? "Profile"}
              <User />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content
            sideOffset={5}
            align="end"
            forceTheme={invert ? "light" : undefined}
          >
            <DropdownMenu.Item asChild>
              <Link to="/profile">
                <ProfileCircle width={18} height={18} /> Account
              </Link>
            </DropdownMenu.Item>
            {/* <DropdownMenu.Sub>
              <DropdownMenu.SubTrigger>
                <ThemeIcon theme={theme} /> Appearance
              </DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent>
                <DropdownMenu.Item onSelect={() => setTheme(null)}>
                  <MacOsWindow width={18} height={18} /> System
                </DropdownMenu.Item>
                <DropdownMenu.Item onSelect={() => setTheme("dark")}>
                  <HalfMoon width={18} height={18} /> Dark
                </DropdownMenu.Item>
                <DropdownMenu.Item onSelect={() => setTheme("light")}>
                  <SunLight width={18} height={18} /> Light
                </DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub> */}
            <DropdownMenu.Item asChild>
              <Link to="/profile/bookmarks">
                <Bookmark width={18} height={18} /> Bookmarks
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <Link to="/profile/ratings">
                <Star width={18} height={18} /> Ratings
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <Link to="/profile/support">
                <ChatBubbleQuestion width={18} height={18} /> Support
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item onSelect={() => signOut()}>
              <LogOut width={18} height={18} /> Sign Out
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      ) : (
        <Button
          onClick={() => signIn()}
          className={styles.button}
          style={{ color: accentColor }}
        >
          Sign in
          <ArrowRight />
        </Button>
      )}
    </Flex>
  );
}
