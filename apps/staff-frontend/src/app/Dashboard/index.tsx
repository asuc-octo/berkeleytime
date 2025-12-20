import { useMemo, useState } from "react";

import { gql, useQuery } from "@apollo/client";
import { Plus, UserBadgeCheck, WarningTriangleSolid } from "iconoir-react";

import { OptionItem, Select } from "@repo/theme";

import styles from "./Dashboard.module.scss";

interface UserSearchResult {
  _id: string;
  name: string;
  email: string;
}

const ALL_USERS = gql`
  query AllUsers {
    allUsers {
      _id
      name
      email
    }
  }
`;

export default function Dashboard() {
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");

  const { data, loading } = useQuery<{ allUsers: UserSearchResult[] }>(
    ALL_USERS
  );

  const options = useMemo<OptionItem<UserSearchResult>[]>(() => {
    if (!data?.allUsers) return [];

    const query = searchQuery.toLowerCase();
    const filtered = query
      ? data.allUsers.filter(
          (user) =>
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
        )
      : data.allUsers;

    return filtered.slice(0, 50).map((user) => ({
      value: user,
      label: user.name,
      meta: user.email,
    }));
  }, [data?.allUsers, searchQuery]);

  const handleChange = (
    value: UserSearchResult | UserSearchResult[] | null
  ) => {
    if (Array.isArray(value)) return;
    setSelectedUser(value);
  };

  return (
    <div className={styles.root}>
      <h1 className={styles.title}>Member Search</h1>
      <div className={styles.searchContainer}>
        <Select
          searchable
          options={options}
          value={selectedUser}
          onChange={handleChange}
          onSearchChange={setSearchQuery}
          placeholder="Search by name..."
          searchPlaceholder="Type a name or email..."
          emptyMessage={loading ? "Loading users..." : "No users found."}
          loading={loading}
          clearable
        />
      </div>

      {selectedUser && (() => {
        const isStaff = false; // TODO: Replace with actual logic
        return (
          <div className={styles.selectedUser}>
            <div className={styles.selectedUserName}>{selectedUser.name}</div>
            <div className={styles.selectedUserEmail}>
              {selectedUser.email}
              {!selectedUser.email.endsWith("@berkeley.edu") && (
                <span className={styles.unaffiliatedWarning}>
                  <WarningTriangleSolid width={14} height={14} />
                  Unaffiliated email
                </span>
              )}
            </div>
            <div className={styles.staffStatus}>
              <span className={isStaff ? styles.staffBadge : styles.notStaffBadge}>
                <UserBadgeCheck width={14} height={14} />
                {isStaff ? "Staff member" : "Not a staff yet"}
              </span>
            </div>
            {!isStaff && (
              <div className={styles.addStaffRow}>
                <button className={styles.addStaffButton} type="button">
                  <Plus width={16} height={16} />
                </button>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
