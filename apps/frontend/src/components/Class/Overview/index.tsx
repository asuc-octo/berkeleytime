import { useMemo } from "react";

import { Box, Container, Flex } from "@repo/theme";

import Details from "@/components/Details";
import EnrollmentDisplay from "@/components/EnrollmentDisplay";
import useClass from "@/hooks/useClass";
import { linkify } from "@/utils/linkify";

import styles from "./Overview.module.scss";
import TargetedMessageBanner from "./TargetedMessageBanner";
import { UserSubmittedData } from "./UserSubmittedData";

export default function Overview() {
  const { class: _class, course } = useClass();
  const decal: any = (_class as any)?.decal ?? null;

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
    if (decal?.description?.trim()) {
      return decal.description;
    }
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
  }, [course.description, decal?.description, sectionAttributes]);

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
          {decal && (
            <>
              {decal.applicationDueDate && (
                <Flex direction="column" gap="2">
                  <p className={styles.label}>Application Deadline</p>
                  <p className={styles.description}>
                    {decal.applicationDueDate}
                  </p>
                </Flex>
              )}
              {decal.applicationUrl && (
                <Flex direction="column" gap="2">
                  <p className={styles.label}>Application</p>
                  <p className={styles.description}>
                    <a
                      href={decal.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.link}
                    >
                      Course Website / Start Application
                    </a>
                    {decal.syllabusUrl && (
                      <>
                        {" · "}
                        <a
                          href={decal.syllabusUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.link}
                        >
                          Syllabus
                        </a>
                      </>
                    )}
                  </p>
                </Flex>
              )}
              {decal.syllabusUrl && !decal.applicationUrl && (
                <Flex direction="column" gap="2">
                  <p className={styles.label}>Syllabus</p>
                  <p className={styles.description}>
                    <a
                      href={decal.syllabusUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.link}
                    >
                      View syllabus
                    </a>
                  </p>
                </Flex>
              )}
              {decal.instructors && decal.instructors.length > 0 && (
                <Flex direction="column" gap="2">
                  <p className={styles.label}>Contact Information</p>
                  <p className={styles.description}>
                    {decal.instructors.map((inst: any, i: number) => (
                      <span key={i}>
                        {inst.email ? (
                          <a
                            href={`mailto:${inst.email}`}
                            className={styles.link}
                          >
                            {inst.name || inst.email}
                          </a>
                        ) : (
                          inst.name
                        )}
                        {i < decal.instructors!.length - 1 && ", "}
                      </span>
                    ))}
                  </p>
                </Flex>
              )}
            </>
          )}
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
