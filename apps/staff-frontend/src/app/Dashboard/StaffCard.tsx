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
  roles: SemesterRole[];
}

interface StaffCardProps {
  staffMember: StaffMember;
  onEditStaffInfo?: () => void;
  onEditRole?: (role: SemesterRole) => void;
  onAddRole?: () => void;
}

export default function StaffCard({
  staffMember,
  onEditStaffInfo,
  onEditRole,
  onAddRole,
}: StaffCardProps) {
  return (
    <div className={styles.staffCard}>
      <div className={styles.staffCardHeader}>
        <div className={styles.staffCardName}>{staffMember.name}</div>
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
        {staffMember.roles.map((role) => (
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
