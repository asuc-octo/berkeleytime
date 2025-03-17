import { ReactNode, useMemo, useState } from "react";

import { ArrowRight, Xmark } from "iconoir-react";
import { useNavigate } from "react-router-dom";
import ReactSelect from "react-select";

import { Button, Dialog, IconButton } from "@repo/theme";

import { useCreateSchedule, useReadTerms } from "@/hooks/api";
import { Semester } from "@/lib/api";

import styles from "./CreateScheduleDialog.module.scss";
import { termSelectStyle } from "./selectStyle";

interface CreateScheduleDialogProps {
  defaultName: string;
  children: ReactNode;
}

// TODO: Collaborative editing
// TODO: Invite collaborators

export default function CreateScheduleDialog({
  children,
  defaultName,
}: CreateScheduleDialogProps) {
  const navigate = useNavigate();
  const [createSchedule] = useCreateSchedule();

  const [name, setName] = useState(defaultName);
  const [localTerm, setLocalTerm] = useState<string | null>(null);

  const { data, loading } = useReadTerms();

  const term = useMemo(() => {
    if (localTerm) return localTerm;

    if (!data?.[0]) return;

    return `${data[0].semester} ${data[0].year}`;
  }, [localTerm, data]);

  const options = useMemo(
    () =>
      data
        ?.filter(
          (t, index) =>
            index ===
            data.findIndex(
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
    [data]
  );

  const handleClick = async () => {
    if (!term) return;

    const [semester, year] = term.split(" ");

    const _term = data?.find(
      (t) => t.semester === semester && t.year === Number(year)
    );

    if (!_term) return;

    // TODO: Error handling, loading state
    const response = await createSchedule({
      name: name,
      year: Number(year),
      semester: semester as Semester,
      sessionId: _term.sessions[0].id,
    });

    if (!response.data?.createSchedule._id) return;

    navigate(response.data.createSchedule._id);
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Overlay />
      <Dialog.Portal>
        <Dialog.Card className={styles.content}>
          <div className={styles.header}>
            <div className={styles.text}>
              <Dialog.Title asChild>
                <p className={styles.title}>Create a schedule</p>
              </Dialog.Title>
              <Dialog.Description asChild>
                <p className={styles.description}>
                  Select the semester and enter a name
                </p>
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <IconButton>
                <Xmark />
              </IconButton>
            </Dialog.Close>
          </div>
          <div className={styles.column}>
            <div className={styles.row}>
              <label>Name</label>
              <input
                type="url"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className={styles.row}>
              <label>Semester</label>
              <ReactSelect
                options={options}
                value={options?.find(({ value }) => value == term)}
                onChange={(value) =>
                  // @ts-expect-error - ReactSelect does not have a type for the value
                  setLocalTerm(value?.value)
                }
                styles={termSelectStyle}
              />
            </div>
            <div className={styles.buttonCont}>
              <Button
                disabled={loading}
                variant="solid"
                onClick={() => handleClick()}
              >
                Create
                <ArrowRight />
              </Button>
            </div>
          </div>
        </Dialog.Card>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
