import { Link, User } from "iconoir-react";

import styles from "./MemberCard.module.scss";

interface MemberCardProps {
  name: string;
  role: string;
  imageUrl?: string;
  link?: string;
}

export function MemberCard({ name, role, imageUrl, link }: MemberCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        {imageUrl ? (
          <img src={imageUrl} alt={name} className={styles.image} />
        ) : (
          <User className={styles.placeholder} />
        )}
      </div>
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
