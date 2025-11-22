import { useMemo } from "react";

import { Box, Container, Flex } from "@repo/theme";

import Details from "@/components/Details";
import useClass from "@/hooks/useClass";
import { linkify } from "@/utils/linkify";

import styles from "./Overview.module.scss";
import { UserSubmittedData } from "./UserSubmittedData";

export default function Overview() {
  const { class: _class, course } = useClass();

  const prereqs = useMemo(() => {
    if (course.requirements && course.requirements.trim()) {
      return course.requirements;
    }
    return null;
  }, [course.requirements]);

  const classNoteLines = useMemo(() => {
    const attributes = _class.primarySection?.sectionAttributes ?? [];
    if (!attributes.length) return null;

    const noteAttribute = attributes.find(
      (attribute) => attribute.attribute?.code === "NOTE"
    );

    const text =
      noteAttribute?.value?.formalDescription?.trim() ??
      noteAttribute?.value?.description?.trim() ??
      null;

    if (!text) return null;

    const description = (course.description ?? "").trim();
    const title = (course.title ?? "").trim();

    const normalizedNoteText = text.replace(/\s+/g, " ").trim();
    const normalizedDescription = description.replace(/\s+/g, " ").trim();
    const normalizedTitle = title.replace(/\s+/g, " ").trim();

    if (
      normalizedNoteText === normalizedDescription ||
      normalizedNoteText === normalizedTitle
    ) {
      return null;
    }

    return text
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
  }, [
    _class.primarySection?.sectionAttributes,
    course.description,
    course.title,
  ]);

  return (
    <Box p="5">
      <Container size="3">
        <Flex direction="column" gap="5">
          {_class.primarySection?.meetings.map((meeting, i) => (
            <Details {...meeting} key={i} />
          ))}
          {prereqs && (
            <Flex direction="column" gap="2">
              <p className={styles.label}>Prerequisites</p>
              <p className={styles.description}>{prereqs}</p>
            </Flex>
          )}
          <Flex direction="column" gap="2">
            <p className={styles.label}>Description</p>
            <p className={styles.description}>{course.description}</p>
          </Flex>
          {classNoteLines && classNoteLines.length > 0 && (
            <Flex direction="column" gap="2">
              <p className={styles.label}>Class Notes</p>
              <p className={styles.description}>
                {classNoteLines.map((line, index) => (
                  <span key={`${line}-${index}`}>
                    {linkify(line, styles.link)}
                    {index < classNoteLines.length - 1 && <br />}
                  </span>
                ))}
              </p>
            </Flex>
          )}
          <UserSubmittedData />
        </Flex>
      </Container>
    </Box>
  );
}
