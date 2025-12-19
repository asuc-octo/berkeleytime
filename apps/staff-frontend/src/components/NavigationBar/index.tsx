import {
  ArrowRight,
  HalfMoon,
  LogOut,
  ProfileCircle,
  SunLight,
  User,
} from "iconoir-react";
import { Link } from "react-router-dom";

import {
  Button,
  DropdownMenu,
  Flex,
  IconButton,
  useTheme,
} from "@repo/theme";

import { useUser } from "@/contexts/UserContext";
import { signIn, signOut } from "@/lib/auth";

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
  const { user } = useUser();
  const { theme, setTheme } = useTheme();

  return (
    <Flex
      align="center"
      flexShrink="0"
      gap="3"
      className={styles.root}
    >
      <Link className={styles.brand} to="/">
        Berkeleytime [Staff]
      </Link>
      <div style={{ marginLeft: "auto" }} />
      <ThemeDropdown theme={theme} setTheme={setTheme} />
      {user ? (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button>
              {user.name?.split(" ")[0] ?? "Profile"}
              <User />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content
            sideOffset={5}
            align="end"
            className={styles.profileDropdown}
          >
            <DropdownMenu.Item asChild>
              <Link to="/profile">
                <ProfileCircle width={18} height={18} /> Account
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item onSelect={() => signOut()}>
              <LogOut width={18} height={18} /> Sign Out
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      ) : (
        <Button onClick={() => signIn()}>
          Sign in
          <ArrowRight />
        </Button>
      )}
    </Flex>
  );
}

