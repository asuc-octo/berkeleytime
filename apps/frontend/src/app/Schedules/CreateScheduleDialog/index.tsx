import { ReactNode, useMemo, useState } from "react";

import { ArrowRight, Xmark } from "iconoir-react";
import moment from "moment";
import { useNavigate } from "react-router-dom";

import { Select } from "@repo/theme";
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
import { Semester, TemporalPosition } from "@/lib/api";
import { sortByTermDescending } from "@/lib/classes";

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

    const ugrdTerms = terms?.filter(
      (term) => term.academicCareerCode === "UGRD"
    );

    const currentTerm = ugrdTerms?.find(
      (term) => term.temporalPosition === TemporalPosition.Current
    );

    const now = moment();

    const nextTerm = ugrdTerms
      ?.filter((term) => term.selfServiceEnrollBeginDate && term.startDate)
      .toSorted((a, b) => {
        return moment(a.selfServiceEnrollBeginDate).diff(
          moment(b.selfServiceEnrollBeginDate)
        );
      })
      .find((term) => {
        const enrollmentHasStarted = now.isAfter(
          moment(term.selfServiceEnrollBeginDate)
        );
        const semesterHasntStarted = moment(term.startDate).isAfter(now);

        return (
          term.temporalPosition === TemporalPosition.Future &&
          enrollmentHasStarted &&
          semesterHasntStarted
        );
      });

    // Priority: smart enrollment-based selection > current term > any term
    const defaultTerm = nextTerm ?? currentTerm ?? ugrdTerms?.[0];

    if (!defaultTerm) return;

    return `${defaultTerm.semester} ${defaultTerm.year}`;
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
        .toSorted(sortByTermDescending)
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
          <Dialog.Header>
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
          </Dialog.Header>
          <Dialog.Body gap="4">
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
              <Select
                options={options}
                placeholder="Select a semester"
                disabled={loading || pending}
                value={options?.find(({ value }) => value == term)?.value}
                onChange={(value) =>
                  // @ts-expect-error - ReactSelect does not have a type for the value
                  setLocalTerm(value)
                }
              />
            </Flex>
          </Dialog.Body>
          <Dialog.Footer>
            <Button disabled={loading || pending} onClick={() => handleClick()}>
              Create
              <LoadingIndicator loading={loading}>
                <ArrowRight />
              </LoadingIndicator>
            </Button>
          </Dialog.Footer>
        </Dialog.Card>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
