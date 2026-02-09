import { useMemo } from "react";

import { Box, Container, Flex } from "@repo/theme";

import Details from "@/components/Details";
import useClass from "@/hooks/useClass";
import { linkify } from "@/utils/linkify";

import styles from "./Overview.module.scss";
import TargetedMessageBanner from "./TargetedMessageBanner";
import { UserSubmittedData } from "./UserSubmittedData";

export default function Overview() {
  const { class: _class, course } = useClass();

  const sectionAttributes = useMemo(
    () => _class.primarySection?.sectionAttributes ?? [],
    [_class.primarySection?.sectionAttributes]
  );

  const prereqs = useMemo(() => {
    if (course.requirements && course.requirements.trim()) {
      return course.requirements;
    }
    return null;
  }, [course.requirements]);

  const classDescription = useMemo(() => {
    const classDescriptionAttribute = sectionAttributes.find(
      (attribute) =>
        attribute.attribute?.code === "NOTE" &&
        attribute.attribute?.formalDescription === "Class Description"
    );

    const text =
      classDescriptionAttribute?.value?.formalDescription?.trim() ??
      classDescriptionAttribute?.value?.description?.trim() ??
      null;

    return text ?? course.description ?? "";
  }, [course.description, sectionAttributes]);

  const classNoteLines = useMemo(() => {
    if (!sectionAttributes.length) return null;

    const classNotesAttribute = sectionAttributes.find(
      (attribute) =>
        attribute.attribute?.code === "NOTE" &&
        attribute.attribute?.formalDescription === "Class Notes"
    );

    const text =
      classNotesAttribute?.value?.formalDescription?.trim() ??
      classNotesAttribute?.value?.description?.trim() ??
      null;

    if (!text) return null;

    const normalize = (value: string): string =>
      value.replace(/\s+/g, " ").trim();

    const normalizedNoteText = normalize(text);
    const normalizedDescription = normalize(classDescription ?? "");
    const normalizedTitle = normalize(course.title ?? "");

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
  }, [classDescription, course.title, sectionAttributes]);

  const displayedDescription = useMemo(() => {
    const trimmed = classDescription.trim();
    return trimmed.length > 0 ? trimmed : "No description provided.";
  }, [classDescription]);

  return (
    <Box p="5">
      <Container size="3">
        <Flex direction="column" gap="5">
          <TargetedMessageBanner courseId={_class.courseId} />
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
            <p className={styles.description}>{displayedDescription}</p>
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
