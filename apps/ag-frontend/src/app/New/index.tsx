import { useMemo, useState } from "react";

import { Box, Button, Container, Flex } from "@radix-ui/themes";
import { ArrowRight } from "iconoir-react";
import { useNavigate } from "react-router-dom";

import CuratedClassEditor from "@/components/CuratedClassEditor";
import { useCreateCuratedClass } from "@/hooks/api";
import { ICuratedClassInput } from "@/lib/api";

export default function New() {
  const [value, setValue] = useState<Partial<ICuratedClassInput>>({});

  const [mutate, { loading }] = useCreateCuratedClass();
  const navigate = useNavigate();

  const publish = async () => {
    if (loading) return;

    const response = await mutate(value);
    if (!response.data?.createCuratedClass) return;

    navigate(`/curated-classes/${response.data.createCuratedClass._id}`);
  };

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
              disabled={disabled}
              onClick={() => publish()}
            >
              Publish
              <ArrowRight />
            </Button>
          </Flex>
          <CuratedClassEditor value={value} onChange={setValue} />
        </Flex>
      </Container>
    </Box>
  );
}
