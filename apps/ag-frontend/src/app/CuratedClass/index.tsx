import { useMemo, useState } from "react";

import {
  Box,
  Button,
  Container,
  Dialog,
  DropdownMenu,
  Flex,
  IconButton,
  Spinner,
} from "@radix-ui/themes";
import { FloppyDisk, MoreVert, Trash } from "iconoir-react";
import { useNavigate, useParams } from "react-router-dom";

import CuratedClassEditor from "@/components/CuratedClassEditor";
import {
  useDeleteCuratedClass,
  useReadCuratedClass,
  useUpdateCuratedClass,
} from "@/hooks/api";
import {
  CuratedClassIdentifier,
  ICuratedClass,
  ICuratedClassInput,
} from "@/lib/api";

interface ContentProps {
  curatedClass: ICuratedClass;
}

function Content({ curatedClass }: ContentProps) {
  const navigate = useNavigate();

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
  const [open, setOpen] = useState(false);

  const [mutate, { loading }] = useUpdateCuratedClass();
  const [remove, { loading: removing }] = useDeleteCuratedClass();

  const confirm = () => {
    remove(curatedClass._id);

    navigate("/curated-classes");
  };

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
          <Flex justify="end" gap="3">
            <Button
              loading={loading}
              disabled={disabled || !unsavedChanges}
              onClick={() => mutate(curatedClass._id, value)}
            >
              <FloppyDisk />
              Save
            </Button>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <IconButton variant="outline" color="gray">
                  <MoreVert />
                </IconButton>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="end">
                <Dialog.Root
                  onOpenChange={(open) => !loading && setOpen(open)}
                  open={open}
                >
                  <Dialog.Trigger>
                    <DropdownMenu.Item
                      color="red"
                      onSelect={(event) => event.preventDefault()}
                    >
                      <Trash />
                      Remove curated class
                    </DropdownMenu.Item>
                  </Dialog.Trigger>
                  <Dialog.Content>
                    <Flex direction="column" gap="5">
                      <Flex direction="column">
                        <Dialog.Title size="4">Are you sure?</Dialog.Title>
                        <Dialog.Description size="3">
                          This curated class will be permanently deleted and
                          cannot be recovered.
                        </Dialog.Description>
                      </Flex>
                      <Flex gap="4">
                        <Dialog.Close>
                          <Button disabled={removing}>
                            No, keep the curated class
                          </Button>
                        </Dialog.Close>
                        <Button
                          variant="outline"
                          color="gray"
                          onClick={() => confirm()}
                          loading={removing}
                        >
                          Yes, remove the curated class
                        </Button>
                      </Flex>
                    </Flex>
                  </Dialog.Content>
                </Dialog.Root>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
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
