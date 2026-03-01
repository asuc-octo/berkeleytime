import { Card, Skeleton } from "@repo/theme";

import cardStyles from "./ClassCard.module.scss";
import styles from "./Skeleton.module.scss";

export default function ClassCardSkeleton() {
  return (
    <Card.RootColumn className={styles.root} hoverColorChange={false}>
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
                <Skeleton className={styles.grade} />
              </div>
            </div>
            <Card.Footer className={cardStyles.infoRow}>
              <Skeleton className={styles.enrolled} />
              <Skeleton className={styles.units} />
            </Card.Footer>
          </div>
        </Card.Body>
      </Card.ColumnHeader>
    </Card.RootColumn>
  );
}
