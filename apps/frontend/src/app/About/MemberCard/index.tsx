import { useState } from "react";

import { Link, User } from "iconoir-react";

import styles from "./MemberCard.module.scss";

interface MemberCardProps {
  name: string;
  role: string;
  imageUrl?: string;
  altImageUrl?: string;
  link?: string;
  showBadge?: boolean;
  badgeLabel?: string;
  hideImage?: boolean;
}

export function MemberCard({
  name,
  role,
  imageUrl,
  altImageUrl,
  link,
  showBadge = false,
  badgeLabel = "P",
  hideImage = false,
}: MemberCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Use altImageUrl on hover if available, otherwise use imageUrl
  const displayImageUrl = isHovered && altImageUrl ? altImageUrl : imageUrl;

  return (
    <div className={styles.card}>
      {!hideImage && (
        <div
          className={styles.imageContainer}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {displayImageUrl ? (
            <img src={displayImageUrl} alt={name} className={styles.image} />
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
