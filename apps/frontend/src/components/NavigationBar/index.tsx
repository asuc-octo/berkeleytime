import { useEffect, useState } from "react";

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
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import {
  Button,
  DropdownMenu,
  Flex,
  IconButton,
  MenuItem,
  Select,
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

const navItems = [
  { path: "/catalog", label: "Catalog" },
  { path: "/schedules", label: "Scheduler" },
  { path: "/gradtrak", label: "Gradtrak" },
  { path: "/grades", label: "Grades" },
  { path: "/enrollment", label: "Enrollment" },
];

export default function NavigationBar({
  invert,
  accentColor,
}: NavigationBarProps) {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const [isNarrow, setIsNarrow] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 992px)");
    setIsNarrow(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsNarrow(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const currentNavItem = navItems.find((item) =>
    location.pathname.startsWith(item.path)
  );

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
        <span className={styles.brandFull}>Berkeleytime</span>
        <span className={styles.brandShort}>Bt</span>
      </Link>
      <div className={styles.navSelect}>
        <Select
          options={navItems.map((item) => ({
            value: item.path,
            label: item.label,
          }))}
          value={currentNavItem?.path ?? null}
          onChange={(path) => {
            if (path) navigate(path as string);
          }}
          placeholder="Navigate"
        />
      </div>
      <div className={styles.group}>
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path}>
            {({ isActive }) => (
              <MenuItem className={styles.item} active={isActive}>
                {item.label}
              </MenuItem>
            )}
          </NavLink>
        ))}
      </div>
      {user ? (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button className={styles.button} style={{ color: accentColor }}>
              {isNarrow
                ? (() => {
                    const firstName = user.name?.split(" ")[0] ?? "Profile";
                    return firstName.length > 10
                      ? firstName.slice(0, 10) + "..."
                      : firstName;
                  })()
                : (user.name ?? "Profile")}
              <User />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content
            sideOffset={5}
            align={isNarrow ? "end" : "center"}
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
      <ThemeDropdown theme={theme} setTheme={setTheme} />
      {/* <PinsDrawer>
        <IconButton>
          <Pin />
        </IconButton>
      </PinsDrawer> */}
    </Flex>
  );
}
