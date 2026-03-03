import { useEffect, useState } from "react";

import { NavArrowDown, NavArrowUp, RefreshDouble, User } from "iconoir-react";

import { DropdownMenu } from "@repo/theme";

import useUser from "@/hooks/useUser";

import styles from "./DevAuthBanner.module.scss";

interface DevUser {
  _id: string;
  email: string;
  name: string;
  staff: boolean;
}

const DEV_AUTH_STORAGE_KEY = "bt.devAuth.userId";
const DEV_AUTH_COLLAPSED_KEY = "bt.devAuth.collapsed";

export default function DevAuthBanner() {
  const { user, loading: userLoading } = useUser();
  const [devUsers, setDevUsers] = useState<DevUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem(DEV_AUTH_COLLAPSED_KEY) === "true";
  });

  useEffect(() => {
    fetch("/api/dev/users")
      .then((res) => res.json())
      .then((users) => {
        setDevUsers(users);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const selectUser = (userId: string) => {
    localStorage.setItem(DEV_AUTH_STORAGE_KEY, userId);
    const redirectUri = window.location.pathname + window.location.search;
    window.location.href = `/api/dev/login?userId=${userId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  };

  const clearSelection = () => {
    localStorage.removeItem(DEV_AUTH_STORAGE_KEY);
    window.location.href = `/api/logout?redirect_uri=${encodeURIComponent(window.location.pathname)}`;
  };

  const toggleCollapsed = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    localStorage.setItem(DEV_AUTH_COLLAPSED_KEY, String(newCollapsed));
  };

  const filteredUsers = devUsers.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.name.toLowerCase().includes(search.toLowerCase())
  );

  if (collapsed) {
    return (
      <div className={styles.collapsed}>
        <button
          type="button"
          className={styles.expandButton}
          onClick={toggleCollapsed}
          aria-label="Expand dev auth banner"
        >
          <NavArrowDown width={12} height={12} />
        </button>
      </div>
    );
  }

  if (loading || userLoading) {
    return (
      <>
        <div className={styles.root}>
          <span className={styles.badge}>DEV</span>
          <span className={styles.text}>Loading...</span>
          <button
            type="button"
            className={styles.minimizeButton}
            onClick={toggleCollapsed}
            aria-label="Minimize dev auth banner"
          >
            <NavArrowUp width={16} height={16} />
          </button>
        </div>
        <div className={styles.spacer} />
      </>
    );
  }

  return (
    <>
      <div className={styles.root}>
        <span className={styles.badge}>DEV</span>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button type="button" className={styles.trigger}>
              <User width={14} height={14} />
              <span>{user ? user.email : "Select User"}</span>
              <NavArrowDown width={14} height={14} />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content
            align="start"
            sideOffset={5}
            className={styles.dropdown}
          >
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                className={styles.searchInput}
              />
            </div>

            <DropdownMenu.Separator />

            <div className={styles.userList}>
              {filteredUsers.slice(0, 20).map((devUser) => (
                <DropdownMenu.Item
                  key={devUser._id}
                  onSelect={() => selectUser(devUser._id)}
                  className={styles.userItem}
                >
                  <span className={styles.userName}>{devUser.name}</span>
                  <span className={styles.userEmail}>{devUser.email}</span>
                  {devUser.staff && (
                    <span className={styles.staffBadge}>Staff</span>
                  )}
                </DropdownMenu.Item>
              ))}
              {filteredUsers.length === 0 && (
                <div className={styles.noResults}>No users found</div>
              )}
            </div>

            {user && (
              <>
                <DropdownMenu.Separator />
                <DropdownMenu.Item
                  onSelect={clearSelection}
                  className={styles.switchUser}
                >
                  <RefreshDouble width={14} height={14} />
                  <span>Sign Out / Switch User</span>
                </DropdownMenu.Item>
              </>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Root>

        <button
          type="button"
          className={styles.minimizeButton}
          onClick={toggleCollapsed}
          aria-label="Minimize dev auth banner"
        >
          <NavArrowUp width={16} height={16} />
        </button>
      </div>
      <div className={styles.spacer} />
    </>
  );
}
