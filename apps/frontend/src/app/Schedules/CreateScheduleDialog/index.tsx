import { ReactNode, useMemo, useState } from "react";

import { ArrowRight, Xmark } from "iconoir-react";
import { useNavigate } from "react-router-dom";
import ReactSelect from "react-select";

import {
  Button,
  Dialog,
  Flex,
  Heading,
  IconButton,
  Input,
  Label,
  LoadingIndicator,
  Text,
} from "@repo/theme";

import { useCreateSchedule, useReadTerms } from "@/hooks/api";
import { Semester } from "@/lib/api";

import styles from "./styles";

interface CreateScheduleDialogProps {
  defaultName: string;
  children: ReactNode;
}

export default function CreateScheduleDialog({
  children,
  defaultName,
}: CreateScheduleDialogProps) {
  const navigate = useNavigate();
  const [createSchedule] = useCreateSchedule();

  const [name, setName] = useState(defaultName);
  const [localTerm, setLocalTerm] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: terms, loading: pending } = useReadTerms();

  const term = useMemo(() => {
    if (localTerm) return localTerm;

    if (!terms?.[0]) return;

    return `${terms[0].semester} ${terms[0].year}`;
  }, [localTerm, terms]);

  const options = useMemo(
    () =>
      terms
        ?.filter(
          (t, index) =>
            index ===
            terms.findIndex(
              (term) => term.year === t.year && term.semester === t.semester
            )
        )
        .map((term) => {
          const value = `${term.semester} ${term.year}`;

          return {
            value,
            label: value,
          };
        }),
    [terms]
  );

  const handleClick = async () => {
    if (!term) return;

    const [semester, year] = term.split(" ");

    const _term = terms?.find(
      (t) => t.semester === semester && t.year === Number(year)
    );

    if (!_term) return;

    setLoading(true);

    // TODO: Error handling, loading state
    const { data } = await createSchedule({
      name: name,
      year: Number(year),
      semester: semester as Semester,
      sessionId: _term.sessions[0].id,
    });

    setLoading(false);

    if (!data) return;

    navigate(data.createSchedule._id);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && loading) return;

    setOpen(open);
  };

  return (
    <Dialog.Root onOpenChange={handleOpenChange} open={open}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Overlay />
      <Dialog.Portal>
        <Dialog.Card>
          <Flex direction="column" gap="4" p="4">
            <Flex gap="4">
              <Flex direction="column" gap="1" flexGrow="1">
                <Dialog.Title asChild>
                  <Heading>Create a schedule</Heading>
                </Dialog.Title>
                <Dialog.Description asChild>
                  <Text>Select the semester and enter a name</Text>
                </Dialog.Description>
              </Flex>
              <Dialog.Close asChild>
                <IconButton disabled={loading}>
                  <Xmark />
                </IconButton>
              </Dialog.Close>
            </Flex>
            <Flex direction="column" gap="2">
              <Label>Name</Label>
              <Input
                disabled={loading}
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </Flex>
            <Flex direction="column" gap="2">
              <Label>Semester</Label>
              <ReactSelect
                options={options}
                placeholder="Select a semester"
                isDisabled={loading || pending}
                value={options?.find(({ value }) => value == term)}
                onChange={(value) =>
                  // @ts-expect-error - ReactSelect does not have a type for the value
                  setLocalTerm(value?.value)
                }
                styles={styles}
              />
            </Flex>
            <Button
              disabled={loading || pending}
              variant="solid"
              onClick={() => handleClick()}
            >
              Create
              <LoadingIndicator loading={loading}>
                <ArrowRight />
              </LoadingIndicator>
            </Button>
          </Flex>
        </Dialog.Card>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
