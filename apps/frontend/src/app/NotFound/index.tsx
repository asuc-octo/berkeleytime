import { Container, Flex } from "@repo/theme";

import styles from "./NotFound.module.scss";

export default function NotFound() {
  return (
    <Container className={styles.root}>
      <Flex
        direction="column"
        align="center"
        gap="24px"
        className={styles.content}
      >
        <div className={styles.errorCode}>404</div>
        <h1 className={styles.title}>Page Not Found</h1>
        <p className={styles.description}>
          Oops! There is nothing here. Check the{" "}
          <a
            href="https://berkeleytime.com/catalog"
            style={{ color: "var(--blue-500)" }}
          >
            catalog
          </a>{" "}
          instead?
        </p>
      </Flex>
    </Container>
  );
}
