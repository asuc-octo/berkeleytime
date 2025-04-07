import { Box, Container, Flex } from "@repo/theme";

import Details from "@/components/Details";
import useClass from "@/hooks/useClass";

import styles from "./Overview.module.scss";

export default function Overview() {
  const { class: _class } = useClass();

  return (
    <Box p="5">
      <Container size="3">
        {_class.decal ? (
          <Flex direction="column" gap="5">
            <p className={styles.label}>Contact</p>
            {_class.decal.website && (
              <p className={styles.description}>
                Course Website{" "}
                <a
                  href={_class.decal.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  {_class.decal.website}
                </a>
              </p>
            )}
            {_class.decal.contact && (
              <p className={styles.description}>
                Contact Information{" "}
                <a
                  href={`mailto:${_class.decal.contact}`}
                  className={styles.link}
                >
                  {_class.decal.contact}
                </a>
              </p>
            )}
            <p className={styles.label}>Description</p>
            <p className={styles.description}>
              {_class.decal.description || "N/A"}
            </p>
          </Flex>
        ) : (
          <Flex direction="column" gap="5">
            <Details {..._class.primarySection.meetings[0]} />
            <Flex direction="column" gap="2">
              <p className={styles.label}>Description</p>
              <p className={styles.description}>
                {_class.description ?? _class.course.description}
              </p>
            </Flex>
            {_class.course.requirements && (
              <Flex direction="column" gap="2">
                <p className={styles.label}>Prerequisites</p>
                <p className={styles.description}>
                  {_class.course.requirements}
                </p>
              </Flex>
            )}
          </Flex>
        )}
      </Container>
    </Box>
  );
}
