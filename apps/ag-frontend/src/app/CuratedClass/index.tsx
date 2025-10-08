import { useMemo, useState } from "react";

import { Box, Button, Container, Flex, Spinner } from "@radix-ui/themes";
import { FloppyDisk } from "iconoir-react";
import { useParams } from "react-router-dom";

import CuratedClassEditor from "@/components/CuratedClassEditor";
import { useReadCuratedClass, useUpdateCuratedClass } from "@/hooks/api";
import {
  CuratedClassIdentifier,
  ICuratedClass,
  ICuratedClassInput,
} from "@/lib/api";

interface ContentProps {
  curatedClass: ICuratedClass;
}

function Content({ curatedClass }: ContentProps) {
  const externalValue = useMemo<Partial<ICuratedClassInput>>(
    () => ({
      image: curatedClass.image,
      text: curatedClass.text,
      courseNumber: curatedClass.courseNumber,
      number: curatedClass.number,
      subject: curatedClass.subject,
      sessionId: curatedClass.sessionId,
      semester: curatedClass.semester,
      year: curatedClass.year,
    }),
    [curatedClass]
  );

  const [value, setValue] = useState(externalValue);

  const [mutate, { loading }] = useUpdateCuratedClass();

  const unsavedChanges = useMemo(
    () =>
      value.courseNumber !== externalValue.courseNumber ||
      value.image !== externalValue.image ||
      value.text !== externalValue.text ||
      value.number !== externalValue.number ||
      value.semester !== externalValue.semester ||
      value.sessionId !== externalValue.sessionId ||
      value.subject !== externalValue.subject ||
      value.year !== externalValue.year,
    [value, externalValue]
  );

  const disabled = useMemo(
    () =>
      loading ||
      !value.courseNumber ||
      !value.image ||
      !value.text ||
      !value.number ||
      !value.semester ||
      !value.sessionId ||
      !value.subject ||
      !value.year,
    [value, loading]
  );

  return (
    <Box p="6">
      <Container>
        <Flex direction="column">
          <Flex justify="end">
            <Button
              loading={loading}
              disabled={disabled || !unsavedChanges}
              onClick={() => mutate(curatedClass._id, value)}
            >
              <FloppyDisk />
              Save
            </Button>
          </Flex>
          <CuratedClassEditor value={value} onChange={setValue} />
        </Flex>
      </Container>
    </Box>
  );
}

export default function CuratedClass() {
  const { curatedClassId } = useParams();

  const { data, loading } = useReadCuratedClass(
    curatedClassId as CuratedClassIdentifier
  );

  if (loading) {
    return (
      <Flex align="center" justify="center" flexGrow="1">
        <Spinner size="3" />
      </Flex>
    );
  }

  if (data) {
    return <Content curatedClass={data} />;
  }

  return <div>Error loading data.</div>;
}
