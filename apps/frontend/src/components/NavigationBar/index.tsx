import { useEffect, useMemo, useState } from "react";

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
import { Link, NavLink, useLocation } from "react-router-dom";

import {
  Button,
  DropdownMenu,
  Flex,
  IconButton,
  MenuItem,
  useTheme,
} from "@repo/theme";

import { useAllNavItems } from "@/hooks/api/nav-item";
import useUser from "@/hooks/useUser";
import { signIn, signOut } from "@/lib/api";
import { BERKELEY_GOGGLES_URL } from "@/lib/berkeley-goggles";
import { RecentType, getPageUrl } from "@/lib/recent";

import styles from "./NavigationBar.module.scss";

interface ExtraNavItem {
  key: string;
  label: string;
  badgeText?: string | null;
  href: string;
}

// Shown only while the nav items query is loading or has failed, so hiding the
// item from the staff dashboard does not resurrect this copy.
const FALLBACK_NAV_ITEMS: ExtraNavItem[] = [
  {
    key: "fallback-clubs",
    label: "Clubs",
    badgeText: "NEW",
    href: BERKELEY_GOGGLES_URL,
  },
];

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
  const {
    data: navItems,
    loading: navItemsLoading,
    error: navItemsError,
  } = useAllNavItems();
  const location = useLocation();
  const isLandingPage = location.pathname === "/";
  const savedGradesUrl = getPageUrl(RecentType.GradesPage);
  const gradesPath = savedGradesUrl ? `/grades${savedGradesUrl}` : "/grades";
  const savedEnrollmentUrl = getPageUrl(RecentType.EnrollmentPage);
  const enrollmentPath = savedEnrollmentUrl
    ? `/enrollment${savedEnrollmentUrl}`
    : "/enrollment";

  const extraNavItems = useMemo<ExtraNavItem[]>(() => {
    if (navItemsLoading || navItemsError) return FALLBACK_NAV_ITEMS;

    return (navItems ?? []).map((navItem) => ({
      key: navItem.id,
      label: navItem.label,
      badgeText: navItem.badgeText,
      // Clicks are counted server-side before redirecting to the real url
      href: `/nav-item/click/${navItem.id}`,
    }));
  }, [navItems, navItemsLoading, navItemsError]);

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
                { to: gradesPath, label: "Grades" },
                { to: enrollmentPath, label: "Enrollment" },
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
              {extraNavItems.map((navItem) => (
                <motion.div
                  key={navItem.key}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <a
                    href={navItem.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.menuNavExternal}
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className={styles.extraItemLabel}>
                      {navItem.label}
                      {navItem.badgeText && (
                        <span className={styles.newBadge}>
                          {navItem.badgeText}
                        </span>
                      )}
                    </span>
                  </a>
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
          [styles.noBorder]: noBorder || isLandingPage,
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
          <NavLink to={gradesPath}>
            {({ isActive }) => (
              <MenuItem className={styles.item} active={isActive}>
                Grades
              </MenuItem>
            )}
          </NavLink>
          <NavLink to={enrollmentPath}>
            {({ isActive }) => (
              <MenuItem className={styles.item} active={isActive}>
                Enrollment
              </MenuItem>
            )}
          </NavLink>
          {extraNavItems.map((navItem) => (
            <MenuItem
              key={navItem.key}
              as="a"
              href={navItem.href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.item}
            >
              <span className={styles.extraItemLabel}>
                {navItem.label}
                {navItem.badgeText && (
                  <span className={styles.newBadge}>{navItem.badgeText}</span>
                )}
              </span>
            </MenuItem>
          ))}
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
