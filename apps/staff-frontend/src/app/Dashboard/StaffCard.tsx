import { useEffect, useRef, useState } from "react";

import {
  BadgeCheck,
  EditPencil,
  User,
  WarningTriangleSolid,
} from "iconoir-react";

import styles from "./Dashboard.module.scss";

export interface SemesterRole {
  id: string;
  year: number;
  semester: "Spring" | "Summer" | "Fall" | "Winter";
  role: string;
  team?: string;
  photo?: string;
  altPhoto?: string;
  isLeadership: boolean;
}

export interface StaffMember {
  id: string;
  userId?: string;
  name: string;
  email?: string;
  personalLink?: string;
  addedByName?: string;
  createdAt?: string;
  roles: SemesterRole[];
}

interface StaffCardProps {
  staffMember: StaffMember;
  onEditStaffInfo?: () => void;
  onEditRole?: (role: SemesterRole) => void;
  onAddRole?: () => void;
  onUpdateName?: (name: string) => Promise<void>;
}

export default function StaffCard({
  staffMember,
  onEditStaffInfo,
  onEditRole,
  onAddRole,
  onUpdateName,
}: StaffCardProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(staffMember.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setNameValue(staffMember.name);
  }, [staffMember.name]);

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingName]);

  const handleNameClick = () => {
    if (onUpdateName) {
      setIsEditingName(true);
    }
  };

  const handleNameBlur = async () => {
    if (
      onUpdateName &&
      nameValue.trim() &&
      nameValue.trim() !== staffMember.name
    ) {
      await onUpdateName(nameValue.trim());
    }
    setIsEditingName(false);
    setNameValue(staffMember.name);
  };

  const handleNameKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (
        onUpdateName &&
        nameValue.trim() &&
        nameValue.trim() !== staffMember.name
      ) {
        await onUpdateName(nameValue.trim());
      }
      setIsEditingName(false);
      setNameValue(staffMember.name);
    } else if (e.key === "Escape") {
      setIsEditingName(false);
      setNameValue(staffMember.name);
    }
  };

  return (
    <div className={styles.staffCard}>
      <div className={styles.staffCardHeader}>
        {isEditingName ? (
          <input
            ref={inputRef}
            type="text"
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={handleNameKeyDown}
            className={styles.staffCardNameInput}
          />
        ) : (
          <div
            className={styles.staffCardName}
            onClick={handleNameClick}
            style={onUpdateName ? { cursor: "pointer" } : undefined}
          >
            {staffMember.name}
          </div>
        )}
        {staffMember.email && (
          <div className={styles.staffCardEmail}>
            {staffMember.email}
            {!staffMember.email.endsWith("@berkeley.edu") && (
              <span className={styles.unaffiliatedWarning}>
                <WarningTriangleSolid width={14} height={14} />
                Unaffiliated email
              </span>
            )}
          </div>
        )}
      </div>

      <div className={styles.staffStatus}>
        <div className={styles.staffStatusInfo}>
          <div className={styles.staffStatusBadges}>
            <span className={styles.staffBadge}>
              <BadgeCheck width={14} height={14} />
              Staff member
            </span>
            {staffMember.addedByName && (
              <span className={styles.addedByText}>
                Added by {staffMember.addedByName}
              </span>
            )}
          </div>
          {staffMember.personalLink ? (
            <a
              href={staffMember.personalLink}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.personalLink}
            >
              {staffMember.personalLink}
            </a>
          ) : (
            <span className={styles.noLink}>No personal link provided</span>
          )}
        </div>
        {onEditStaffInfo && (
          <button
            type="button"
            className={styles.editButton}
            onClick={onEditStaffInfo}
          >
            <EditPencil width={16} height={16} />
          </button>
        )}
      </div>

      <div className={styles.semesterRoles}>
        <div className={styles.semesterRolesHeader}>
          Experience ({staffMember.roles.length})
        </div>
        {[...staffMember.roles]
          .sort((a, b) => {
            // Sort by year descending (most recent first)
            if (a.year !== b.year) {
              return b.year - a.year;
            }
            // If same year, sort by semester: Winter > Fall > Summer > Spring
            const semesterOrder: Record<
              "Spring" | "Summer" | "Fall" | "Winter",
              number
            > = {
              Spring: 1,
              Summer: 2,
              Fall: 3,
              Winter: 4,
            };
            return semesterOrder[b.semester] - semesterOrder[a.semester];
          })
          .map((role) => (
            <div key={role.id} className={styles.semesterRole}>
              {role.photo ? (
                <img
                  src={role.photo}
                  alt={`${staffMember.name} - ${role.semester} ${role.year}`}
                  className={styles.semesterRolePhoto}
                />
              ) : (
                <div className={styles.semesterRolePhotoPlaceholder}>
                  <User width={24} height={24} />
                </div>
              )}
              <div className={styles.semesterRoleInfo}>
                <div className={styles.semesterRoleMain}>
                  <span className={styles.semesterRoleTerm}>
                    {role.semester} {role.year}
                  </span>
                  <span className={styles.semesterRoleTitle}>{role.role}</span>
                </div>
                <div className={styles.semesterRoleTags}>
                  {role.isLeadership && (
                    <span className={styles.leadBadge}>Lead</span>
                  )}
                  {role.team && (
                    <span className={styles.semesterRoleTeam}>{role.team}</span>
                  )}
                </div>
              </div>
              {onEditRole && (
                <button
                  type="button"
                  className={styles.editButton}
                  onClick={() => onEditRole(role)}
                >
                  <EditPencil width={16} height={16} />
                </button>
              )}
            </div>
          ))}
        {onAddRole && (
          <button
            className={styles.addButton}
            type="button"
            onClick={onAddRole}
          >
            + Add new role
          </button>
        )}
      </div>
    </div>
  );
}
