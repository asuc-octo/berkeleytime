import { useMemo, useState } from "react";

import { gql, useQuery } from "@apollo/client";

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

      {selectedUser && (
        <div className={styles.selectedUser}>
          <div className={styles.selectedUserName}>{selectedUser.name}</div>
          <div className={styles.selectedUserEmail}>{selectedUser.email}</div>
          <div className={styles.selectedUserId}>ID: {selectedUser._id}</div>
        </div>
      )}
    </div>
  );
}
