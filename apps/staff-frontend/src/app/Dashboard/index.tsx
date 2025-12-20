import { useEffect, useMemo, useState } from "react";

import { gql, useQuery } from "@apollo/client";
import {
  EditPencil,
  Plus,
  User,
  UserBadgeCheck,
  WarningTriangleSolid,
} from "iconoir-react";

import { OptionItem, Select } from "@repo/theme";

import styles from "./Dashboard.module.scss";

interface UserSearchResult {
  _id: string;
  name: string;
  email: string;
}

interface SemesterRole {
  _id: string;
  year: number;
  semester: "Spring" | "Summer" | "Fall" | "Winter";
  role: string;
  team?: string;
  photo?: string;
}

interface StaffMember {
  _id: string;
  name: string;
  personalLink?: string;
  isAlumni: boolean;
  semesterRoles: SemesterRole[];
}

// Dummy data for testing UI
const createDummyStaffMember = (photos: string[]): StaffMember => ({
  _id: "dummy-staff-id",
  name: "John Doe",
  personalLink: "https://johndoe.com",
  isAlumni: true,
  semesterRoles: [
    {
      _id: "role-1",
      year: 2024,
      semester: "Fall",
      role: "Engineering Lead",
      team: "Backend",
      photo: photos[0],
    },
    {
      _id: "role-2",
      year: 2024,
      semester: "Spring",
      role: "Software Engineer",
      team: "Backend",
      photo: photos[1],
    },
    {
      _id: "role-3",
      year: 2023,
      semester: "Fall",
      role: "Software Engineer",
      team: "Frontend",
    },
  ],
});

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
  const [dogPhotos, setDogPhotos] = useState<string[]>([]);

  const { data, loading } = useQuery<{ allUsers: UserSearchResult[] }>(
    ALL_USERS
  );

  // Fetch random dog photos for dummy data
  useEffect(() => {
    const fetchDogPhotos = async () => {
      const photos = await Promise.all(
        [1, 2].map(async () => {
          const res = await fetch("https://dog.ceo/api/breeds/image/random");
          const data = await res.json();
          return data.message;
        })
      );
      setDogPhotos(photos);
    };
    fetchDogPhotos();
  }, []);

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

      {selectedUser &&
        (() => {
          // Use dummy data for now
          const staffMember: StaffMember | null =
            createDummyStaffMember(dogPhotos);
          const isStaff = staffMember !== null;

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
                <span
                  className={isStaff ? styles.staffBadge : styles.notStaffBadge}
                >
                  <UserBadgeCheck width={14} height={14} />
                  {isStaff ? "Staff member" : "Not a staff yet"}
                </span>
                {isStaff && staffMember.isAlumni && (
                  <span className={styles.alumniBadge}>Alumni</span>
                )}
              </div>

              {isStaff && staffMember?.personalLink && (
                <div className={styles.personalLink}>
                  <a
                    href={staffMember.personalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {staffMember.personalLink}
                  </a>
                </div>
              )}

              <div className={styles.semesterRoles}>
                <div className={styles.semesterRolesHeader}>Experience</div>
                {isStaff &&
                  staffMember?.semesterRoles.map((role) => (
                    <div key={role._id} className={styles.semesterRole}>
                      {role.photo ? (
                        <img
                          src={role.photo}
                          alt={`${selectedUser.name} - ${role.semester} ${role.year}`}
                          className={styles.semesterRolePhoto}
                        />
                      ) : (
                        <div className={styles.semesterRolePhotoPlaceholder}>
                          <User width={24} height={24} />
                        </div>
                      )}
                      <div className={styles.semesterRoleInfo}>
                        <span className={styles.semesterRoleTerm}>
                          {role.semester} {role.year}
                        </span>
                        <span className={styles.semesterRoleTitle}>
                          {role.role}
                        </span>
                        {role.team && (
                          <span className={styles.semesterRoleTeam}>
                            {role.team}
                          </span>
                        )}
                      </div>
                      <button type="button" className={styles.editButton}>
                        <EditPencil width={16} height={16} />
                      </button>
                    </div>
                  ))}
                <button className={styles.addButton} type="button">
                  <Plus width={16} height={16} />
                  Add new role
                </button>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
