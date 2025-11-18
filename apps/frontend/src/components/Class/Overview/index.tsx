import { useMemo, useState } from "react";

import { NavArrowDown } from "iconoir-react";

import { Box, Container, Flex } from "@repo/theme";

import Details from "@/components/Details";
import useClass from "@/hooks/useClass";

import styles from "./Overview.module.scss";
import { UserSubmittedData } from "./UserSubmittedData";

export default function Overview() {
  const { class: _class } = useClass();
  const [isClassNoteExpanded, setIsClassNoteExpanded] = useState(false);

  const prereqs = useMemo(() => {
    if (_class.course.requirements && _class.course.requirements.trim()) {
      return _class.course.requirements;
    }
    const requiredCourses = _class.course.requiredCourses;
    if (requiredCourses == null || requiredCourses.length === 0) {
      return "No Prerequisites Listed.";
    }
    return requiredCourses
      .map((course) => `${course.subject} ${course.number}`)
      .join(", ");
  }, [_class]);

  const classNoteLines = useMemo(() => {
    const attributes = _class.primarySection.sectionAttributes ?? [];
    if (!attributes.length) return null;

    const noteAttribute = attributes.find(
      (attribute) => attribute.attribute?.code === "NOTE"
    );

    const text =
      noteAttribute?.value?.formalDescription?.trim() ??
      noteAttribute?.value?.description?.trim() ??
      null;

    if (!text) return null;

    // Get the description for comparison
    const description = (
      _class.description ??
      _class.course.description ??
      ""
    ).trim();

    // Normalize both texts for comparison (remove extra whitespace, normalize newlines)
    const normalizedNoteText = text.replace(/\s+/g, " ").trim();
    const normalizedDescription = description.replace(/\s+/g, " ").trim();

    // If they match exactly, don't show the class note
    if (normalizedNoteText === normalizedDescription) return null;

    return text
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
  }, [
    _class.primarySection.sectionAttributes,
    _class.description,
    _class.course.description,
  ]);

  return (
    <Box p="5">
      <Container size="3">
        <Flex direction="column" gap="5">
          {_class.primarySection.meetings.map((meeting, i) => (
            <Details {...meeting} key={i} />
          ))}
          <Flex direction="column" gap="2">
            <p className={styles.label}>Prerequisites</p>
            <p className={styles.description}>{prereqs}</p>
          </Flex>
          <Flex direction="column" gap="2">
            <p className={styles.label}>Description</p>
            <p className={styles.description}>
              {_class.description ?? _class.course.description}
            </p>
          </Flex>
          {classNoteLines && classNoteLines.length > 0 && (
            <Flex direction="column" gap="2">
              <div
                className={styles.classNoteHeader}
                onClick={() => setIsClassNoteExpanded(!isClassNoteExpanded)}
                style={{ cursor: "pointer" }}
              >
                <p className={styles.label}>
                  Class Note
                  <NavArrowDown
                    className={styles.expandIcon}
                    style={{
                      transform: isClassNoteExpanded
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    }}
                  />
                </p>
              </div>
              {isClassNoteExpanded && (
                <div className={styles.classNoteContent}>
                  <p className={styles.description}>
                    {classNoteLines.map((line, index) => (
                      <span key={`${line}-${index}`}>
                        {line}
                        {index < classNoteLines.length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                </div>
              )}
            </Flex>
          )}
          <UserSubmittedData />
        </Flex>
      </Container>
    </Box>
  );
}
