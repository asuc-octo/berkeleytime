import { Minus, Plus } from "iconoir-react";

import Container from "@/components/Container";
import Footer from "@/components/Footer";

import styles from "./Organization.module.scss";

export default function Organization() {
  return (
    <div className={styles.root}>
      <Container>
        <h3 className={styles.heading}>Get involved</h3>
        <div className={styles.accordion}>
          <details className={styles.details}>
            <summary className={styles.summary}>
              <h3 className={styles.title}>Join our team</h3>
              <Plus height={24} width={24} />
              <Minus height={24} width={24} />
            </summary>
            <p className={styles.content}>
              Become part of a dynamic and innovative group dedicated to helping
              students navigate Berkeley! Roles on the Berkeleytime team include
              backend & frontend development, product design, user research, and
              marketing. We are always looking for passionate and talented
              students.
            </p>
          </details>
          <details className={styles.details}>
            <summary className={styles.summary}>
              <h3 className={styles.title}>Contribute</h3>
              <Plus height={24} width={24} />
              <Minus height={24} width={24} />
            </summary>
            <p className={styles.description}>
              Become part of a dynamic and innovative group dedicated to helping
              students navigate Berkeley! Roles on the Berkeleytime team include
              backend & frontend development, product design, user research, and
              marketing. We are always looking for passionate and talented
              students.
            </p>
          </details>
          <details className={styles.details}>
            <summary className={styles.summary}>
              <h3 className={styles.title}>Provide feedback</h3>
              <Plus height={24} width={24} />
              <Minus height={24} width={24} />
            </summary>
            <p className={styles.description}>
              Berkeleytime is an open-source project. If you are interested in
              contributing to the project, check out our
            </p>
          </details>
        </div>
      </Container>
      <Footer invert />
    </div>
  );
}
