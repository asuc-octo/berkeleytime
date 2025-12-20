import { useEffect, useMemo, useState } from "react";

import { gql, useQuery } from "@apollo/client";
import {
  EditPencil,
  MediaImagePlus,
  Plus,
  Search,
  User,
  UserBadgeCheck,
  WarningTriangleSolid,
} from "iconoir-react";

import {
  Button,
  Checkbox,
  Dialog,
  Input,
  OptionItem,
  PillSwitcher,
  Select,
} from "@repo/theme";

import styles from "./Dashboard.module.scss";
import StaffCard, { SemesterRole, StaffMember } from "./StaffCard";

interface UserSearchResult {
  _id: string;
  name: string;
  email: string;
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

// Dummy staff list for Staff Search tab
const DUMMY_STAFF_LIST: StaffMember[] = [
  {
    _id: "staff-1",
    name: "Alice Chen",
    email: "alicechen@berkeley.edu",
    personalLink: "https://alicechen.dev",
    isAlumni: false,
    semesterRoles: [
      {
        _id: "r1",
        year: 2024,
        semester: "Fall",
        role: "President",
        team: "Leadership",
      },
      {
        _id: "r2",
        year: 2024,
        semester: "Spring",
        role: "VP Engineering",
        team: "Leadership",
      },
    ],
  },
  {
    _id: "staff-2",
    name: "Bob Martinez",
    email: "bobm@gmail.com",
    isAlumni: false,
    semesterRoles: [
      {
        _id: "r3",
        year: 2024,
        semester: "Fall",
        role: "Software Engineer",
        team: "Backend",
      },
    ],
  },
  {
    _id: "staff-3",
    name: "Carol Kim",
    email: "carol.kim@berkeley.edu",
    personalLink: "https://linkedin.com/in/carolkim",
    isAlumni: true,
    semesterRoles: [
      {
        _id: "r4",
        year: 2023,
        semester: "Fall",
        role: "Design Lead",
        team: "Design",
      },
      {
        _id: "r5",
        year: 2023,
        semester: "Spring",
        role: "Designer",
        team: "Design",
      },
    ],
  },
  {
    _id: "staff-4",
    name: "David Park",
    email: "dpark@berkeley.edu",
    isAlumni: false,
    semesterRoles: [
      {
        _id: "r6",
        year: 2024,
        semester: "Fall",
        role: "Software Engineer",
        team: "Frontend",
      },
      {
        _id: "r7",
        year: 2024,
        semester: "Spring",
        role: "Software Engineer",
        team: "Frontend",
      },
      {
        _id: "r8",
        year: 2023,
        semester: "Fall",
        role: "Junior Developer",
        team: "Frontend",
      },
    ],
  },
  {
    _id: "staff-5",
    name: "Emily Zhang",
    email: "emily.zhang@outlook.com",
    personalLink: "https://emilyzhang.com",
    isAlumni: false,
    semesterRoles: [
      {
        _id: "r9",
        year: 2024,
        semester: "Fall",
        role: "VP Design",
        team: "Leadership",
      },
    ],
  },
  {
    _id: "staff-6",
    name: "Frank Liu",
    email: "frank@berkeley.edu",
    isAlumni: true,
    semesterRoles: [
      {
        _id: "r10",
        year: 2022,
        semester: "Fall",
        role: "President",
        team: "Leadership",
      },
      {
        _id: "r11",
        year: 2022,
        semester: "Spring",
        role: "VP Engineering",
        team: "Leadership",
      },
      {
        _id: "r12",
        year: 2021,
        semester: "Fall",
        role: "Engineering Lead",
        team: "Backend",
      },
      {
        _id: "r13",
        year: 2021,
        semester: "Spring",
        role: "Software Engineer",
        team: "Backend",
      },
    ],
  },
  {
    _id: "staff-7",
    name: "Grace Wang",
    email: "grace.wang@berkeley.edu",
    personalLink: "https://gracewang.dev",
    isAlumni: false,
    semesterRoles: [
      {
        _id: "r14",
        year: 2024,
        semester: "Fall",
        role: "Designer",
        team: "Design",
      },
    ],
  },
  {
    _id: "staff-8",
    name: "Henry Nguyen",
    email: "hnguyen@berkeley.edu",
    isAlumni: false,
    semesterRoles: [
      {
        _id: "r15",
        year: 2024,
        semester: "Fall",
        role: "Software Engineer",
        team: "Infrastructure",
      },
      {
        _id: "r16",
        year: 2024,
        semester: "Spring",
        role: "Software Engineer",
        team: "Infrastructure",
      },
    ],
  },
  {
    _id: "staff-9",
    name: "Iris Thompson",
    email: "iris.t@yahoo.com",
    personalLink: "https://linkedin.com/in/iris-t",
    isAlumni: true,
    semesterRoles: [
      {
        _id: "r17",
        year: 2023,
        semester: "Spring",
        role: "Product Manager",
        team: "Product",
      },
    ],
  },
  {
    _id: "staff-10",
    name: "James Wilson",
    email: "jwilson@berkeley.edu",
    isAlumni: false,
    semesterRoles: [
      {
        _id: "r18",
        year: 2024,
        semester: "Fall",
        role: "Data Engineer",
        team: "Data",
      },
      {
        _id: "r19",
        year: 2024,
        semester: "Spring",
        role: "Data Analyst",
        team: "Data",
      },
      {
        _id: "r20",
        year: 2023,
        semester: "Fall",
        role: "Junior Analyst",
        team: "Data",
      },
    ],
  },
];

const ALL_USERS = gql`
  query AllUsers {
    allUsers {
      _id
      name
      email
    }
  }
`;

type Semester = "Spring" | "Summer" | "Fall" | "Winter";

interface RoleFormData {
  year: string;
  semester: Semester;
  role: string;
  team: string;
  photo: string | null;
}

interface StaffInfoFormData {
  isAlumni: boolean;
  personalLink: string;
}

const SEMESTER_OPTIONS: OptionItem<Semester>[] = [
  { value: "Spring", label: "Spring" },
  { value: "Summer", label: "Summer" },
  { value: "Fall", label: "Fall" },
  { value: "Winter", label: "Winter" },
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS: OptionItem<string>[] = Array.from(
  { length: 10 },
  (_, i) => {
    const year = (currentYear - i).toString();
    return { value: year, label: year };
  }
);

const SEARCH_TABS = [
  { value: "staff", label: "Staff Search" },
  { value: "user", label: "User Search" },
];

type StaffSearchBy = "name" | "role" | "semester" | "team";

const STAFF_SEARCH_BY_OPTIONS: OptionItem<StaffSearchBy>[] = [
  { value: "name", label: "Name" },
  { value: "role", label: "Role" },
  { value: "semester", label: "Semester" },
  { value: "team", label: "Team" },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("staff");
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [staffSearchBy, setStaffSearchBy] = useState<StaffSearchBy>("name");
  const [staffSearchQuery, setStaffSearchQuery] = useState("");
  const [dogPhotos, setDogPhotos] = useState<string[]>([]);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<SemesterRole | null>(null);
  const [roleForm, setRoleForm] = useState<RoleFormData>({
    year: currentYear.toString(),
    semester: "Fall",
    role: "",
    team: "",
    photo: null,
  });
  const [isStaffInfoModalOpen, setIsStaffInfoModalOpen] = useState(false);
  const [staffInfoForm, setStaffInfoForm] = useState<StaffInfoFormData>({
    isAlumni: false,
    personalLink: "",
  });
  const [editingUser, setEditingUser] = useState<{
    name: string;
    email?: string;
  } | null>(null);

  const openAddModal = (user: { name: string; email?: string }) => {
    setEditingUser(user);
    setEditingRole(null);
    setRoleForm({
      year: currentYear.toString(),
      semester: "Fall",
      role: "",
      team: "",
      photo: null,
    });
    setIsRoleModalOpen(true);
  };

  const openEditModal = (
    role: SemesterRole,
    user: { name: string; email?: string }
  ) => {
    setEditingUser(user);
    setEditingRole(role);
    setRoleForm({
      year: role.year.toString(),
      semester: role.semester,
      role: role.role,
      team: role.team || "",
      photo: role.photo || null,
    });
    setIsRoleModalOpen(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const img = new Image();
      img.onload = () => {
        // Crop to square from center
        const size = Math.min(img.width, img.height);
        const x = (img.width - size) / 2;
        const y = (img.height - size) / 2;

        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, x, y, size, size, 0, 0, size, size);
          setRoleForm({
            ...roleForm,
            photo: canvas.toDataURL("image/jpeg", 0.9),
          });
        }
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const handleSaveRole = () => {
    // TODO: Implement save logic with API call
    console.log("Saving role:", {
      ...roleForm,
      year: parseInt(roleForm.year),
      isEdit: editingRole !== null,
      editingRoleId: editingRole?._id,
    });
    setIsRoleModalOpen(false);
  };

  const openStaffInfoModal = (
    staffMember: StaffMember,
    user: { name: string; email?: string }
  ) => {
    setEditingUser(user);
    setStaffInfoForm({
      isAlumni: staffMember.isAlumni,
      personalLink: staffMember.personalLink || "",
    });
    setIsStaffInfoModalOpen(true);
  };

  const handleSaveStaffInfo = () => {
    // TODO: Implement save logic with API call
    console.log("Saving staff info:", staffInfoForm);
    setIsStaffInfoModalOpen(false);
  };

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

  // Get unique past roles from the staff member's history
  // TODO: Replace with actual staff member data from API
  const pastRoles = useMemo(() => {
    const staffMember = createDummyStaffMember(dogPhotos);
    const roles = staffMember.semesterRoles.map((r) => r.role);
    return [...new Set(roles)];
  }, [dogPhotos]);

  const handleChange = (
    value: UserSearchResult | UserSearchResult[] | null
  ) => {
    if (Array.isArray(value)) return;
    setSelectedUser(value);
  };

  return (
    <div className={styles.root}>
      <div className={styles.tabsContainer}>
        <PillSwitcher
          items={SEARCH_TABS}
          value={activeTab}
          onValueChange={setActiveTab}
        />
      </div>

      {activeTab === "staff" && (
        <>
          <div className={styles.staffSearchRow}>
            <div className={styles.searchBySelect}>
              <Select
                options={STAFF_SEARCH_BY_OPTIONS}
                value={staffSearchBy}
                onChange={(value) => {
                  if (value && !Array.isArray(value)) {
                    setStaffSearchBy(value);
                  }
                }}
                placeholder="Search by"
              />
            </div>
            <div className={styles.searchGroup}>
              <label className={styles.searchIcon}>
                <Search />
              </label>
              <input
                type="text"
                placeholder={`Search by ${staffSearchBy}...`}
                className={styles.searchInput}
                autoComplete="off"
                value={staffSearchQuery}
                onChange={(e) => setStaffSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.staffList}>
            {DUMMY_STAFF_LIST.map((staff) => (
              <StaffCard
                key={staff._id}
                staffMember={staff}
                onEditStaffInfo={() =>
                  openStaffInfoModal(staff, {
                    name: staff.name,
                    email: staff.email,
                  })
                }
                onEditRole={(role) =>
                  openEditModal(role, { name: staff.name, email: staff.email })
                }
                onAddRole={() =>
                  openAddModal({ name: staff.name, email: staff.email })
                }
              />
            ))}
          </div>
        </>
      )}

      {activeTab === "user" && (
        <div className={styles.userSearchWrapper}>
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
                  <div className={styles.selectedUserName}>
                    {selectedUser.name}
                  </div>
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
                    <div className={styles.staffStatusInfo}>
                      <div className={styles.staffStatusBadges}>
                        <span
                          className={
                            isStaff ? styles.staffBadge : styles.notStaffBadge
                          }
                        >
                          <UserBadgeCheck width={14} height={14} />
                          {isStaff ? "Staff member" : "Not a staff yet"}
                        </span>
                        {isStaff && staffMember.isAlumni && (
                          <span className={styles.alumniBadge}>Alumni</span>
                        )}
                      </div>
                      {isStaff && staffMember?.personalLink ? (
                        <a
                          href={staffMember.personalLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.personalLink}
                        >
                          {staffMember.personalLink}
                        </a>
                      ) : (
                        <span className={styles.noLink}>
                          No personal link provided
                        </span>
                      )}
                    </div>
                    {isStaff && (
                      <button
                        type="button"
                        className={styles.editButton}
                        onClick={() =>
                          openStaffInfoModal(staffMember, {
                            name: selectedUser.name,
                            email: selectedUser.email,
                          })
                        }
                      >
                        <EditPencil width={16} height={16} />
                      </button>
                    )}
                  </div>

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
                            <div
                              className={styles.semesterRolePhotoPlaceholder}
                            >
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
                          <button
                            type="button"
                            className={styles.editButton}
                            onClick={() =>
                              openEditModal(role, {
                                name: selectedUser.name,
                                email: selectedUser.email,
                              })
                            }
                          >
                            <EditPencil width={16} height={16} />
                          </button>
                        </div>
                      ))}
                    <button
                      className={styles.addButton}
                      type="button"
                      onClick={() =>
                        openAddModal({
                          name: selectedUser.name,
                          email: selectedUser.email,
                        })
                      }
                    >
                      <Plus width={16} height={16} />
                      Add new role
                    </button>
                  </div>
                </div>
              );
            })()}
        </div>
      )}

      <Dialog.Root open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <Dialog.Overlay />
        <Dialog.Card>
          <Dialog.Header
            title={
              editingUser?.name ?? (editingRole ? "Edit Role" : "Add New Role")
            }
            subtitle={
              editingUser?.email ? (
                <span className={styles.modalSubtitle}>
                  {editingUser.email}
                  {!editingUser.email.endsWith("@berkeley.edu") && (
                    <span className={styles.unaffiliatedWarning}>
                      <WarningTriangleSolid width={14} height={14} />
                      Unaffiliated email
                    </span>
                  )}
                </span>
              ) : undefined
            }
            hasCloseButton
          />
          <Dialog.Body>
            <div className={styles.formGrid}>
              <label
                className={`${styles.photoUpload} ${roleForm.photo ? styles.hasPhoto : ""}`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className={styles.photoInput}
                />
                {roleForm.photo ? (
                  <img
                    src={roleForm.photo}
                    alt="Upload preview"
                    className={styles.photoPreview}
                  />
                ) : (
                  <div className={styles.photoPlaceholder}>
                    <MediaImagePlus width={32} height={32} />
                    <span>Upload photo</span>
                  </div>
                )}
              </label>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Semester</label>
                <Select
                  options={SEMESTER_OPTIONS}
                  value={roleForm.semester}
                  onChange={(value) => {
                    if (value && !Array.isArray(value)) {
                      setRoleForm({ ...roleForm, semester: value });
                    }
                  }}
                  placeholder="Select semester"
                />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Year</label>
                <Select
                  options={YEAR_OPTIONS}
                  value={roleForm.year}
                  onChange={(value) => {
                    if (value && !Array.isArray(value)) {
                      setRoleForm({ ...roleForm, year: value });
                    }
                  }}
                  placeholder="Select year"
                />
              </div>
              <div className={styles.formFieldFull}>
                <label className={styles.formLabel}>Role</label>
                <Input
                  type="text"
                  placeholder="e.g., Software Engineer"
                  value={roleForm.role}
                  onChange={(e) =>
                    setRoleForm({ ...roleForm, role: e.target.value })
                  }
                />
                {pastRoles.length > 0 && (
                  <div className={styles.formHint}>
                    Past roles: {pastRoles.join(", ")}
                  </div>
                )}
              </div>
              <div className={styles.formFieldFull}>
                <label className={styles.formLabel}>Team (optional)</label>
                <Input
                  type="text"
                  placeholder="e.g., Infrastructure, User Profile"
                  value={roleForm.team}
                  onChange={(e) =>
                    setRoleForm({ ...roleForm, team: e.target.value })
                  }
                />
              </div>
            </div>
          </Dialog.Body>
          <Dialog.Footer>
            <Button
              variant="secondary"
              onClick={() => setIsRoleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveRole}>
              {editingRole ? "Save Changes" : "Add Role"}
            </Button>
          </Dialog.Footer>
        </Dialog.Card>
      </Dialog.Root>

      <Dialog.Root
        open={isStaffInfoModalOpen}
        onOpenChange={setIsStaffInfoModalOpen}
      >
        <Dialog.Overlay />
        <Dialog.Card>
          <Dialog.Header
            title={editingUser?.name ?? "Edit Staff Info"}
            subtitle={
              editingUser?.email ? (
                <span className={styles.modalSubtitle}>
                  {editingUser.email}
                  {!editingUser.email.endsWith("@berkeley.edu") && (
                    <span className={styles.unaffiliatedWarning}>
                      <WarningTriangleSolid width={14} height={14} />
                      Unaffiliated email
                    </span>
                  )}
                </span>
              ) : undefined
            }
            hasCloseButton
          />
          <Dialog.Body>
            <div className={styles.formGrid}>
              <div className={styles.formFieldFull}>
                <label className={styles.formLabel}>Personal Link</label>
                <Input
                  type="url"
                  placeholder="e.g., https://linkedin.com/in/username"
                  value={staffInfoForm.personalLink}
                  onChange={(e) =>
                    setStaffInfoForm({
                      ...staffInfoForm,
                      personalLink: e.target.value,
                    })
                  }
                />
              </div>
              <div className={styles.formFieldFull}>
                <label className={styles.checkboxField}>
                  <Checkbox
                    checked={staffInfoForm.isAlumni}
                    onCheckedChange={(checked) =>
                      setStaffInfoForm({
                        ...staffInfoForm,
                        isAlumni: checked === true,
                      })
                    }
                  />
                  <span>Alumni</span>
                </label>
              </div>
            </div>
          </Dialog.Body>
          <Dialog.Footer>
            <Button
              variant="secondary"
              onClick={() => setIsStaffInfoModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveStaffInfo}>Save Changes</Button>
          </Dialog.Footer>
        </Dialog.Card>
      </Dialog.Root>
    </div>
  );
}
