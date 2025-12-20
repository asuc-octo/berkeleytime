import { useMemo, useState } from "react";

import { gql, useQuery } from "@apollo/client";
import {
  BadgeCheck,
  EditPencil,
  MediaImagePlus,
  Plus,
  Search,
  Trash,
  User,
  WarningTriangleSolid,
  Xmark,
  XmarkCircle,
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

import {
  useAllStaffMembers,
  useDeleteSemesterRole,
  useDeleteStaffMember,
  useEnsureStaffMember,
  useStaffMemberByUserId,
  useUpdateStaffInfo,
  useUpsertSemesterRole,
} from "../../hooks/api/staff";
import { useReadUser } from "../../hooks/api/users";
import { Semester } from "../../lib/api/staff";
import styles from "./Dashboard.module.scss";
import StaffCard, { SemesterRole, StaffMember } from "./StaffCard";

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

interface RoleFormData {
  year: string;
  semester: Semester;
  role: string;
  team: string;
  photo: string | null;
  altPhoto: string | null;
  isLeadership: boolean;
}

interface StaffInfoFormData {
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
  const [searchSelectedUser, setSearchSelectedUser] =
    useState<UserSearchResult | null>(null);
  const [viewedUsers, setViewedUsers] = useState<UserSearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [staffSearchBy, setStaffSearchBy] = useState<StaffSearchBy>("name");
  const [staffSearchQuery, setStaffSearchQuery] = useState("");
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<SemesterRole | null>(null);
  const [editingStaffMemberId, setEditingStaffMemberId] = useState<
    string | null
  >(null);
  const [roleForm, setRoleForm] = useState<RoleFormData>({
    year: "",
    semester: "" as Semester,
    role: "",
    team: "",
    photo: null,
    altPhoto: null,
    isLeadership: false,
  });
  const [isStaffInfoModalOpen, setIsStaffInfoModalOpen] = useState(false);
  const [isAddingNewStaff, setIsAddingNewStaff] = useState(false);
  const [staffInfoForm, setStaffInfoForm] = useState<StaffInfoFormData>({
    personalLink: "",
  });
  const [editingUser, setEditingUser] = useState<{
    name: string;
    email?: string;
  } | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // API hooks
  const { data: currentUser } = useReadUser();
  const {
    data: staffMembers,
    loading: staffLoading,
    refetch: refetchStaff,
  } = useAllStaffMembers();
  const { data: currentUserStaffMember } = useStaffMemberByUserId({
    userId: currentUser?._id ?? null,
  });
  const { ensureStaffMember } = useEnsureStaffMember();
  const { upsertSemesterRole } = useUpsertSemesterRole();
  const { updateStaffInfo } = useUpdateStaffInfo();
  const { deleteSemesterRole } = useDeleteSemesterRole();
  const { deleteStaffMember } = useDeleteStaffMember();

  const openAddModal = (
    user: { name: string; email?: string },
    staffMemberId: string
  ) => {
    setEditingUser(user);
    setEditingRole(null);
    setEditingStaffMemberId(staffMemberId);
    setRoleForm({
      year: "",
      semester: "" as Semester,
      role: "",
      team: "",
      photo: null,
      altPhoto: null,
      isLeadership: false,
    });
    setIsRoleModalOpen(true);
  };

  const openEditModal = (
    role: SemesterRole,
    user: { name: string; email?: string },
    staffMemberId: string
  ) => {
    setEditingUser(user);
    setEditingRole(role);
    setEditingStaffMemberId(staffMemberId);
    setRoleForm({
      year: role.year.toString(),
      semester: role.semester,
      role: role.role,
      team: role.team || "",
      photo: role.photo || null,
      altPhoto: role.altPhoto || null,
      isLeadership: role.isLeadership,
    });
    setIsRoleModalOpen(true);
  };

  const handlePhotoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "photo" | "altPhoto"
  ) => {
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
            [type]: canvas.toDataURL("image/jpeg", 0.9),
          });
        }
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const handleRemovePhoto = (type: "photo" | "altPhoto") => {
    setRoleForm({
      ...roleForm,
      [type]: null,
    });
  };

  const handleSaveRole = async () => {
    if (!editingStaffMemberId) return;

    await upsertSemesterRole(editingStaffMemberId, {
      year: parseInt(roleForm.year),
      semester: roleForm.semester,
      role: roleForm.role,
      team: roleForm.team || undefined,
      photo: roleForm.photo || undefined,
      altPhoto: roleForm.altPhoto || undefined,
      isLeadership: roleForm.isLeadership,
    });

    setIsRoleModalOpen(false);
    refetchStaff();
  };

  const openStaffInfoModal = (
    staffMember: StaffMember,
    user: { _id: string; name: string; email?: string }
  ) => {
    setEditingUser(user);
    setEditingUserId(user._id);
    setEditingStaffMemberId(staffMember.id);
    setIsAddingNewStaff(false);
    setStaffInfoForm({
      personalLink: staffMember.personalLink || "",
    });
    setIsStaffInfoModalOpen(true);
  };

  const handleSaveStaffInfo = async () => {
    if (isAddingNewStaff) {
      if (!editingUserId || !editingUser) return;

      const confirmed = window.confirm(
        `Add ${editingUser.name} as staff?\n\nThis will grant them admin access to the staff dashboard.`
      );
      if (!confirmed) return;

      const member = await ensureStaffMember(editingUserId);
      if (member) {
        await updateStaffInfo(
          member.id,
          {
            personalLink: staffInfoForm.personalLink || undefined,
          },
          editingUserId
        );
      }
    } else {
      if (!editingStaffMemberId) return;

      await updateStaffInfo(
        editingStaffMemberId,
        {
          personalLink: staffInfoForm.personalLink || undefined,
        },
        editingUserId ?? undefined
      );
    }

    setIsStaffInfoModalOpen(false);
    refetchStaff();
  };

  const handleDeleteRole = async () => {
    if (!editingRole) return;

    const confirmed = window.confirm(
      `Delete this role?\n\n${editingRole.role} — ${editingRole.semester} ${editingRole.year}\n\nThis will remove this experience entry from their profile. This action cannot be undone.`
    );
    if (!confirmed) return;

    await deleteSemesterRole(editingRole.id);
    setIsRoleModalOpen(false);
    refetchStaff();
  };

  const handleDeleteStaffMember = async () => {
    if (!editingStaffMemberId || !editingUser) return;

    const confirmed = window.confirm(
      `Remove ${editingUser.name} from staff?\n\nThis action cannot be undone.\n\nThis will:\n• Revoke their admin access to the staff dashboard\n• Delete all their experience entries\n• Remove them from the About page`
    );
    if (!confirmed) return;

    await deleteStaffMember(editingStaffMemberId, editingUserId ?? undefined);
    setIsStaffInfoModalOpen(false);
    refetchStaff();
  };

  const handleAddAsStaff = (user: UserSearchResult) => {
    setEditingUser({
      name: user.name,
      email: user.email,
    });
    setEditingUserId(user._id);
    setEditingStaffMemberId(null);
    setIsAddingNewStaff(true);
    setStaffInfoForm({
      personalLink: "",
    });
    setIsStaffInfoModalOpen(true);
  };

  const handleAddToView = () => {
    if (!searchSelectedUser) return;
    // Don't add duplicates
    if (viewedUsers.some((u) => u._id === searchSelectedUser._id)) {
      setSearchSelectedUser(null);
      setSearchQuery("");
      return;
    }
    setViewedUsers([...viewedUsers, searchSelectedUser]);
    setSearchSelectedUser(null);
    setSearchQuery("");
  };

  const getStaffMemberByUserId = (userId: string) => {
    return staffMembers.find((m) => m.userId === userId);
  };

  const handleRemoveFromView = (userId: string) => {
    setViewedUsers(viewedUsers.filter((u) => u._id !== userId));
  };

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

    const sliced = filtered.slice(0, 50);

    // Ensure selected user is always in options
    if (
      searchSelectedUser &&
      !sliced.some((u) => u._id === searchSelectedUser._id)
    ) {
      sliced.unshift(searchSelectedUser);
    }

    return sliced.map((user) => ({
      value: user,
      label: user.name,
      meta: user.email,
    }));
  }, [data?.allUsers, searchQuery, searchSelectedUser]);

  // Get unique past roles from the staff member's history
  const pastRoles = useMemo(() => {
    const staffMember = staffMembers.find((m) => m.id === editingStaffMemberId);
    if (!staffMember) return [];
    const roles = staffMember.roles.map((r) => r.role);
    return [...new Set(roles)];
  }, [staffMembers, editingStaffMemberId]);

  // Filter staff members based on search criteria
  const filteredStaff = useMemo(() => {
    if (!staffSearchQuery) return staffMembers;

    const query = staffSearchQuery.toLowerCase();
    return staffMembers.filter((staff) => {
      switch (staffSearchBy) {
        case "name":
          return staff.name.toLowerCase().includes(query);
        case "role":
          return staff.roles.some((r) => r.role.toLowerCase().includes(query));
        case "semester":
          return staff.roles.some(
            (r) =>
              r.semester.toLowerCase().includes(query) ||
              r.year.toString().includes(query)
          );
        case "team":
          return staff.roles.some((r) => r.team?.toLowerCase().includes(query));
        default:
          return true;
      }
    });
  }, [staffMembers, staffSearchQuery, staffSearchBy]);

  const handleChange = (
    value: UserSearchResult | UserSearchResult[] | null
  ) => {
    if (Array.isArray(value)) return;
    setSearchSelectedUser(value);
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
            {staffLoading ? (
              <div className={styles.emptyState}>Loading staff members...</div>
            ) : filteredStaff.length === 0 ? (
              <div className={styles.emptyState}>No staff members found.</div>
            ) : (
              filteredStaff.map((staff) => (
                <StaffCard
                  key={staff.id}
                  staffMember={staff}
                  onEditStaffInfo={() =>
                    openStaffInfoModal(staff, {
                      _id: staff.userId ?? staff.id,
                      name: staff.name,
                    })
                  }
                  onEditRole={(role) =>
                    openEditModal(role, { name: staff.name }, staff.id)
                  }
                  onAddRole={() => openAddModal({ name: staff.name }, staff.id)}
                />
              ))
            )}
          </div>
        </>
      )}

      {activeTab === "user" && (
        <div className={styles.userSearchWrapper}>
          <div className={styles.userSearchRow}>
            <div className={styles.searchContainer}>
              <Select
                searchable
                options={options}
                value={searchSelectedUser}
                onChange={handleChange}
                onSearchChange={setSearchQuery}
                placeholder="Search by name..."
                searchPlaceholder="Type a name or email..."
                emptyMessage={loading ? "Loading users..." : "No users found."}
                loading={loading}
              />
            </div>
            <Button
              variant="secondary"
              onClick={handleAddToView}
              style={{ height: 44, flexShrink: 0 }}
            >
              <Plus width={16} height={16} />
              Add to view
            </Button>
          </div>

          {viewedUsers.length > 0 && (
            <div className={styles.staffList}>
              {viewedUsers.map((user) => {
                const staffMember = getStaffMemberByUserId(user._id);

                return (
                  <div key={user._id} className={styles.selectedUser}>
                    <div className={styles.selectedUserHeader}>
                      <div className={styles.selectedUserName}>{user.name}</div>
                      <button
                        type="button"
                        className={styles.editButton}
                        onClick={() => handleRemoveFromView(user._id)}
                      >
                        <Xmark width={16} height={16} />
                      </button>
                    </div>
                    <div className={styles.selectedUserEmail}>
                      {user.email}
                      {!user.email.endsWith("@berkeley.edu") && (
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
                              staffMember
                                ? styles.staffBadge
                                : styles.notStaffBadge
                            }
                          >
                            {staffMember ? (
                              <BadgeCheck width={14} height={14} />
                            ) : (
                              <XmarkCircle width={14} height={14} />
                            )}
                            {staffMember ? "Staff member" : "Not a staff yet"}
                          </span>
                          {staffMember?.addedByName && (
                            <span className={styles.addedByText}>
                              Added by {staffMember.addedByName}
                            </span>
                          )}
                        </div>
                        {staffMember ? (
                          staffMember.personalLink ? (
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
                          )
                        ) : (
                          <span className={styles.noLink}>
                            Adding as staff grants admin access
                          </span>
                        )}
                      </div>
                      {staffMember ? (
                        <button
                          type="button"
                          className={styles.editButton}
                          onClick={() =>
                            openStaffInfoModal(staffMember, {
                              _id: user._id,
                              name: user.name,
                              email: user.email,
                            })
                          }
                        >
                          <EditPencil width={16} height={16} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={styles.editButton}
                          onClick={() => handleAddAsStaff(user)}
                        >
                          <Plus width={16} height={16} />
                        </button>
                      )}
                    </div>

                    {staffMember && (
                      <div className={styles.semesterRoles}>
                        <div className={styles.semesterRolesHeader}>
                          Experience
                        </div>
                        {staffMember.roles.map((role) => (
                          <div key={role.id} className={styles.semesterRole}>
                            {role.photo ? (
                              <img
                                src={role.photo}
                                alt={`${user.name} - ${role.semester} ${role.year}`}
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
                              <div className={styles.semesterRoleMain}>
                                <span className={styles.semesterRoleTerm}>
                                  {role.semester} {role.year}
                                </span>
                                <span className={styles.semesterRoleTitle}>
                                  {role.role}
                                </span>
                              </div>
                              <div className={styles.semesterRoleTags}>
                                {role.isLeadership && (
                                  <span className={styles.leadBadge}>Lead</span>
                                )}
                                {role.team && (
                                  <span className={styles.semesterRoleTeam}>
                                    {role.team}
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              className={styles.editButton}
                              onClick={() =>
                                openEditModal(
                                  role,
                                  {
                                    name: user.name,
                                    email: user.email,
                                  },
                                  staffMember.id
                                )
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
                            openAddModal(
                              {
                                name: user.name,
                                email: user.email,
                              },
                              staffMember.id
                            )
                          }
                        >
                          <Plus width={16} height={16} />
                          Add new role
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <Dialog.Root open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <Dialog.Overlay />
        <Dialog.Card>
          <Dialog.Header
            title={
              editingUser?.name ?? (editingRole ? "Edit Role" : "Add New Role")
            }
            subtitle={editingUser?.email}
            hasCloseButton
          />
          <Dialog.Body>
            <div className={styles.formGrid}>
              <div className={styles.photoUploadRow}>
                <div className={styles.photoUploadContainer}>
                  <div className={styles.photoUploadLabel}>
                    <span>Primary photo</span>
                    {roleForm.photo && (
                      <button
                        type="button"
                        className={styles.photoRemoveButton}
                        onClick={() => handleRemovePhoto("photo")}
                      >
                        <Trash width={14} height={14} />
                      </button>
                    )}
                  </div>
                  <label
                    className={`${styles.photoUpload} ${roleForm.photo ? styles.hasPhoto : ""}`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, "photo")}
                      className={styles.photoInput}
                    />
                    {roleForm.photo ? (
                      <img
                        src={roleForm.photo}
                        alt="Primary photo preview"
                        className={styles.photoPreview}
                      />
                    ) : (
                      <div className={styles.photoPlaceholder}>
                        <MediaImagePlus width={32} height={32} />
                        <span>Upload photo</span>
                      </div>
                    )}
                  </label>
                </div>
                <div className={styles.photoUploadContainer}>
                  <div className={styles.photoUploadLabel}>
                    <span>Alt photo</span>
                    {roleForm.altPhoto && (
                      <button
                        type="button"
                        className={styles.photoRemoveButton}
                        onClick={() => handleRemovePhoto("altPhoto")}
                      >
                        <Trash width={14} height={14} />
                      </button>
                    )}
                  </div>
                  <label
                    className={`${styles.photoUpload} ${roleForm.altPhoto ? styles.hasPhoto : ""}`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, "altPhoto")}
                      className={styles.photoInput}
                    />
                    {roleForm.altPhoto ? (
                      <img
                        src={roleForm.altPhoto}
                        alt="Alt photo preview"
                        className={styles.photoPreview}
                      />
                    ) : (
                      <div className={styles.photoPlaceholder}>
                        <MediaImagePlus width={32} height={32} />
                        <span>Upload photo</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
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
                  style={{ minHeight: 32, padding: "0 12px" }}
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
                  style={{ minHeight: 32, padding: "0 12px" }}
                />
              </div>
              <div className={styles.formFieldFull}>
                <label className={styles.checkboxField}>
                  <Checkbox
                    checked={roleForm.isLeadership}
                    onCheckedChange={(checked) =>
                      setRoleForm({
                        ...roleForm,
                        isLeadership: checked === true,
                      })
                    }
                  />
                  <span>This is a leadership role</span>
                </label>
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
                <label className={styles.formLabel}>Pod/Team</label>
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
            {editingRole && (
              <Button
                variant="secondary"
                onClick={handleDeleteRole}
                style={{ marginRight: "auto", color: "var(--red-500)" }}
              >
                <Trash width={16} height={16} />
                Delete Role
              </Button>
            )}
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
            title={
              isAddingNewStaff
                ? "Add Staff"
                : (editingUser?.name ?? "Edit Staff Info")
            }
            subtitle={editingUser?.email}
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
            </div>
          </Dialog.Body>
          <Dialog.Footer>
            {!isAddingNewStaff &&
              editingStaffMemberId !== currentUserStaffMember?.id && (
                <Button
                  variant="secondary"
                  onClick={handleDeleteStaffMember}
                  style={{ marginRight: "auto", color: "var(--red-500)" }}
                >
                  <Trash width={16} height={16} />
                  Remove Staff
                </Button>
              )}
            <Button
              variant="secondary"
              onClick={() => setIsStaffInfoModalOpen(false)}
            >
              Cancel
            </Button>
            {isAddingNewStaff ? (
              <Button
                variant="secondary"
                onClick={handleSaveStaffInfo}
                style={{ color: "var(--red-500)" }}
              >
                Add Staff
              </Button>
            ) : (
              <Button onClick={handleSaveStaffInfo}>Save Changes</Button>
            )}
          </Dialog.Footer>
        </Dialog.Card>
      </Dialog.Root>
    </div>
  );
}
