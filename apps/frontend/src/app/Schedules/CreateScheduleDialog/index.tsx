import { ReactNode, useEffect, useMemo, useState } from "react";

import { Xmark } from "iconoir-react";
import { useNavigate } from "react-router-dom";
import ReactSelect from "react-select";

import { Button, Dialog, IconButton } from "@repo/theme";

import { useCreateSchedule, useReadTerms } from "@/hooks/api";
import { ITerm, Semester } from "@/lib/api";

import styles from "./CreateScheduleDialog.module.scss";
import { termSelectStyle } from "./selectStyle";

interface CreateScheduleDialogProps {
  defaultName: string;
  children: ReactNode;
}

// TODO: Collaborative editing
// TODO: Invite collaborators

function termString(term: ITerm) {
  return `${term.semester} ${term.year}`;
}

export default function CreateScheduleDialog({
  children,
  defaultName,
}: CreateScheduleDialogProps) {
  const [name, setName] = useState(defaultName);
  const [term, setTerm] = useState<ITerm | null>(null);

  const [createSchedule] = useCreateSchedule();

  const { data: terms, loading: termsLoading } = useReadTerms();

  const navigate = useNavigate();

  useEffect(() => {
    if (!terms) return;
    setTerm(terms[0]);
  }, [terms]);

  const options = useMemo(() => {
    return !termsLoading && terms
      ? terms
          .filter(
            (t, index) =>
              index ===
              terms.findIndex(
                (term) => term.year === t.year && term.semester === t.semester
              )
          )
          .map((term) => ({
            value: term,
            label: termString(term),
          }))
      : [];
  }, [terms]);

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Content className={styles.content}>
        <div className={styles.header}>
          <div className={styles.text}>
            <Dialog.Title asChild>
              <p className={styles.title}>Create New Schedule</p>
            </Dialog.Title>
            <Dialog.Description asChild>
              <p className={styles.description}>
                Select a name and a semester for this schedule
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
            <label style={{ lineHeight: "38px" }}>Semester</label>
            <ReactSelect
              options={options}
              value={term ? options.find(({ value }) => value == term) : null}
              onChange={(e: any) => setTerm(e?.value || null)}
              styles={termSelectStyle}
            />
          </div>
          <div className={styles.buttonCont}>
            <Button
              variant="solid"
              onClick={async () => {
                if (term == null) return;
                const res = await createSchedule({
                  name: name,
                  year: Number(termString(term).split(" ")[1]),
                  semester: termString(term).split(" ")[0] as Semester,
                  sessionId: term.sessions[0].id,
                });
                if (res.data?.createSchedule._id)
                  navigate(res.data?.createSchedule._id);
              }}
            >
              Create
            </Button>
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
