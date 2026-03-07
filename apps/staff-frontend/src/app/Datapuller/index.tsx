import { useState } from "react";

import { Button, Flex, PillSwitcher, Select } from "@repo/theme";

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
  const [message, setMessage] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);
  const [activeJobName, setActiveJobName] = useState<string | null>(null);

  const { trigger, loading } = useTriggerDatapuller();
  const { status: jobStatus } = useDatapullerJobStatus(activeJobName);

  const isRunning =
    loading ||
    jobStatus?.phase === "Pending" ||
    jobStatus?.phase === "Running";

  const handleTrigger = async () => {
    setMessage(null);
    setActiveJobName(null);
    try {
      const result = await trigger(selectedJob);
      if (result?.jobName) setActiveJobName(result.jobName);
      setMessage({
        text: result?.message ?? "Job created successfully.",
        isError: false,
      });
    } catch (e) {
      setMessage({
        text: e instanceof Error ? e.message : "Error running job",
        isError: true,
      });
    }
  };

  const statusPhase = jobStatus?.phase;
  const statusText =
    statusPhase === "Pending"
      ? "Pending"
      : statusPhase === "Running"
        ? "Running..."
        : statusPhase === "Succeeded"
          ? "Succeeded"
          : statusPhase === "Failed"
            ? "Failed"
            : statusPhase === "NotFound"
              ? "Job cleaned up"
              : null;

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.tabsContainer}>
          <PillSwitcher items={[{ value: "datapuller", label: "Datapuller" }]} />
        </div>
        <p className={styles.subtitle}>
          Manually trigger a datapuller job to sync data from external sources.
          A Kubernetes Job will be created and run immediately.
        </p>
      </div>

      <div className={styles.card}>
        <p className={styles.cardLabel}>Job</p>
        <Flex gap="3" align="center" className={styles.row}>
          <div className={styles.selectWrapper}>
            <Select
              value={selectedJob}
              onChange={(v) => {
                setSelectedJob(v as DatapullerJob);
                setMessage(null);
              }}
              options={DATAPULLER_JOB_OPTIONS}
              searchable
              searchPlaceholder="Search jobs..."
            />
          </div>
          <Button disabled={isRunning} onClick={handleTrigger}>
            {isRunning ? "Running..." : "Run job"}
          </Button>
        </Flex>

        {message && (
          <p
            className={
              message.isError ? styles.statusError : styles.statusSuccess
            }
          >
            {message.text}
          </p>
        )}

        {jobStatus && statusText && (
          <p
            className={
              statusPhase === "Succeeded"
                ? styles.statusSuccess
                : statusPhase === "Failed"
                  ? styles.statusError
                  : styles.statusInfo
            }
          >
            Job status: {statusText}
            {jobStatus.message ? ` — ${jobStatus.message}` : ""}
          </p>
        )}
      </div>
    </div>
  );
}
