import { useEffect, useState } from "react";

import classNames from "classnames";
import { motion } from "framer-motion";
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
  Xmark,
} from "iconoir-react";
import { createPortal } from "react-dom";
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

interface NavigationBarProps {
  invert?: boolean;
  accentColor?: string;
  noBorder?: boolean;
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
          <motion.div
            key={effectiveTheme}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
            style={{ display: "flex" }}
          >
            {effectiveTheme === "light" ? (
              <SunLight width={18} height={18} />
            ) : (
              <HalfMoon width={18} height={18} />
            )}
          </motion.div>
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
  noBorder,
}: NavigationBarProps) {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      {menuOpen &&
        createPortal(
          <motion.div
            className={styles.menuOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <motion.nav
              className={styles.menuNav}
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: { staggerChildren: 0.05, delayChildren: 0.1 },
                },
              }}
            >
              {[
                { to: "/catalog", label: "Catalog" },
                { to: "/schedules", label: "Scheduler" },
                { to: "/gradtrak", label: "Gradtrak" },
                { to: "/grades", label: "Grades" },
                { to: "/enrollment", label: "Enrollment" },
              ].map(({ to, label }) => (
                <motion.div
                  key={to}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <NavLink to={to} onClick={() => setMenuOpen(false)}>
                    {label}
                  </NavLink>
                </motion.div>
              ))}
            </motion.nav>
          </motion.div>,
          document.body
        )}
      <Flex
        align="center"
        flexShrink="0"
        gap="3"
        className={classNames(styles.root, {
          [styles.invert]: invert,
          [styles.noBorder]: noBorder,
        })}
      >
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
          <NavLink to="/about">
            {({ isActive }) => (
              <MenuItem className={styles.item} active={isActive}>
                About
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
        <IconButton
          className={styles.compactMenuButton}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <motion.div
            animate={{ rotate: menuOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ display: "flex" }}
          >
            {menuOpen ? <Xmark /> : <Menu />}
          </motion.div>
        </IconButton>
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
              className={styles.profileDropdown}
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
    </>
  );
}
