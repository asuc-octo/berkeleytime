import { Card, Skeleton } from "@repo/theme";

// eslint-disable-next-line css-modules/no-unused-class
import cardStyles from "./ClassCard.module.scss";
import styles from "./Skeleton.module.scss";

interface ClassCardSkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function ClassCardSkeleton({
  className,
  style,
}: ClassCardSkeletonProps) {
  return (
    <Card.RootColumn
      className={className ? `${styles.root} ${className}` : styles.root}
      hoverColorChange={false}
      style={style}
    >
      <Card.ColumnHeader>
        <Card.Body>
          <div className={cardStyles.cardContent}>
            <div className={cardStyles.topRow}>
              <div className={cardStyles.titleDescription}>
                <Card.Heading>
                  <Skeleton className={styles.title} />
                </Card.Heading>
                <Card.Description>
                  <Skeleton className={styles.description} />
                </Card.Description>
              </div>
              <div className={cardStyles.gradeContainer}>
                <div className={styles.grade} />
              </div>
            </div>
            <Card.Footer className={cardStyles.infoRow}>
              <div className={styles.enrolled} />
              <div className={styles.units} />
            </Card.Footer>
          </div>
        </Card.Body>
      </Card.ColumnHeader>
    </Card.RootColumn>
  );
}
