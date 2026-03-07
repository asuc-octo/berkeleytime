import { useState } from "react";

import {
  useDatapullerJobStatus,
  useTriggerDatapuller,
} from "../../hooks/api/datapuller";
import {
  DATAPULLER_JOB_OPTIONS,
  DatapullerJob,
} from "../../lib/api/datapuller";
import styles from "./Datapuller.module.scss";

export default function Datapuller() {
  const [selectedJob, setSelectedJob] = useState<DatapullerJob>("COURSES");
  const [datapullerDropdownOpen, setDatapullerDropdownOpen] = useState(false);
  const [datapullerMessage, setDatapullerMessage] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);
  const [activeJobName, setActiveJobName] = useState<string | null>(null);
  const { trigger: triggerDatapuller, loading: datapullerLoading } =
    useTriggerDatapuller();
  const { status: jobStatus } = useDatapullerJobStatus(activeJobName);

  return (
    <div className={styles.root}>
      <div className={styles.dataTab}>
        <h2 className={styles.dataTabTitle}>Datapuller</h2>
        <p className={styles.dataTabDescription}>
          Manually trigger a datapuller job. A Kubernetes Job will be created
          and run immediately.
        </p>
        <div className={styles.splitButton}>
          <button
            className={styles.splitButtonMain}
            disabled={
              datapullerLoading ||
              jobStatus?.phase === "Pending" ||
              jobStatus?.phase === "Running"
            }
            onClick={async () => {
              setDatapullerMessage(null);
              setActiveJobName(null);
              try {
                const result = await triggerDatapuller(selectedJob);
                if (result?.jobName) setActiveJobName(result.jobName);
                setDatapullerMessage({
                  text: result?.message ?? "Job created successfully.",
                  isError: false,
                });
              } catch (e) {
                setDatapullerMessage({
                  text: e instanceof Error ? e.message : "Error running job",
                  isError: true,
                });
              }
              setDatapullerDropdownOpen(false);
            }}
          >
            {datapullerLoading
              ? "Starting..."
              : `Run ${DATAPULLER_JOB_OPTIONS.find((o) => o.value === selectedJob)?.label ?? selectedJob}`}
          </button>
          <button
            className={styles.splitButtonCaret}
            disabled={datapullerLoading}
            onClick={() => setDatapullerDropdownOpen((prev) => !prev)}
            aria-label="select datapuller job"
          >
            ▾
          </button>
          {datapullerDropdownOpen && (
            <ul className={styles.splitButtonDropdown}>
              {DATAPULLER_JOB_OPTIONS.map((option) => (
                <li
                  key={option.value}
                  className={`${styles.splitButtonDropdownItem} ${
                    option.value === selectedJob
                      ? styles.splitButtonDropdownItemActive
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedJob(option.value);
                    setDatapullerDropdownOpen(false);
                    setDatapullerMessage(null);
                  }}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          )}
        </div>
        {datapullerMessage && (
          <p
            className={
              datapullerMessage.isError
                ? styles.datapullerError
                : styles.datapullerSuccess
            }
          >
            {datapullerMessage.text}
          </p>
        )}
        {jobStatus && (
          <p
            className={
              jobStatus.phase === "Succeeded"
                ? styles.datapullerSuccess
                : jobStatus.phase === "Failed"
                  ? styles.datapullerError
                  : styles.datapullerStatus
            }
          >
            Job status: {jobStatus.phase === "Pending" && "Pending"}
            {jobStatus.phase === "Running" && "Running..."}
            {jobStatus.phase === "Succeeded" && "Succeeded"}
            {jobStatus.phase === "Failed" && "Failed"}
            {jobStatus.phase === "NotFound" && "Job cleaned up"}
            {jobStatus.message ? ` — ${jobStatus.message}` : ""}
          </p>
        )}
      </div>
    </div>
  );
}
