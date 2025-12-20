import { Link, User } from "iconoir-react";

import styles from "./MemberCard.module.scss";

interface MemberCardProps {
  name: string;
  role: string;
  imageUrl?: string;
  link?: string;
  showBadge?: boolean;
  badgeLabel?: string;
  hideImage?: boolean;
}

export function MemberCard({
  name,
  role,
  imageUrl,
  link,
  showBadge = false,
  badgeLabel = "P",
  hideImage = false,
}: MemberCardProps) {
  return (
    <div className={styles.card}>
      {!hideImage && (
        <div className={styles.imageContainer}>
          {imageUrl ? (
            <img src={imageUrl} alt={name} className={styles.image} />
          ) : (
            <User className={styles.placeholder} />
          )}
          {showBadge && (
            <div className={styles.badge}>
              <span className={styles.badgeLabel}>{badgeLabel}</span>
            </div>
          )}
        </div>
      )}
      <div className={styles.footer}>
        <div className={styles.nameRow}>
          <h3 className={styles.name}>{name}</h3>
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.linkButton}
            >
              <Link />
            </a>
          )}
        </div>
        <p className={styles.role}>{role}</p>
      </div>
    </div>
  );
}
