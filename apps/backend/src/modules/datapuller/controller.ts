import { BatchV1Api, KubeConfig, V1Job } from "@kubernetes/client-node";
import { GraphQLError } from "graphql";

export type DatapullerJob =
  | "TERMS_ALL"
  | "TERMS_NEARBY"
  | "COURSES"
  | "SECTIONS_ACTIVE"
  | "SECTIONS_LAST_FIVE_YEARS"
  | "CLASSES_ACTIVE"
  | "CLASSES_LAST_FIVE_YEARS"
  | "GRADES_RECENT"
  | "GRADES_LAST_FIVE_YEARS"
  | "ENROLLMENTS"
  | "ENROLLMENT_TIMEFRAME";

const JOB_SUFFIX: Record<DatapullerJob, string> = {
  TERMS_ALL: "terms-all",
  TERMS_NEARBY: "terms-nearby",
  COURSES: "courses",
  SECTIONS_ACTIVE: "sections-active",
  SECTIONS_LAST_FIVE_YEARS: "sections-l5y",
  CLASSES_ACTIVE: "classes-active",
  CLASSES_LAST_FIVE_YEARS: "classes-l5y",
  GRADES_RECENT: "grades-recent",
  GRADES_LAST_FIVE_YEARS: "grades-l5y",
  ENROLLMENTS: "enrollments",
  ENROLLMENT_TIMEFRAME: "enrollment-timeframe",
};

const TTL_SECONDS = 300; // 5 minutes — change as needed

function getBatchApi() {
  const kc = new KubeConfig();
  kc.loadFromCluster();
  return kc.makeApiClient(BatchV1Api);
}

function getCronJobName(job: DatapullerJob): string {
  const prefix =
    process.env.DATAPULLER_CRONJOB_PREFIX ?? "bt-prod-datapuller";
  return `${prefix}-${JOB_SUFFIX[job]}`;
}

function getNamespace(): string {
  return process.env.K8S_NAMESPACE ?? "bt";
}

export async function triggerDatapuller(
  job: DatapullerJob
): Promise<{ jobName: string; success: boolean; message: string }> {
  // Local dev bypass: set SKIP_K8S=true in .env to skip the real k8s call
  if (process.env.SKIP_K8S === "true") {
    const mockJobName = `${getCronJobName(job)}-manual-${Math.floor(Date.now() / 1000)}`;
    return {
      jobName: mockJobName,
      success: true,
      message: `[MOCK] Job ${mockJobName} would have been created.`,
    };
  }

  const batchApi = getBatchApi();
  const namespace = getNamespace();
  const cronJobName = getCronJobName(job);
  const jobName = `${cronJobName}-manual-${Math.floor(Date.now() / 1000)}`;

  // Check if a job for this puller is already active
  const existingJobs = await batchApi.listNamespacedJob({ namespace });
  const alreadyRunning = existingJobs.items.some(
    (j) =>
      j.metadata?.annotations?.["cronjob.kubernetes.io/instantiate"] ===
        "manual" &&
      j.metadata?.name?.startsWith(cronJobName) &&
      (j.status?.active ?? 0) > 0
  );

  if (alreadyRunning) {
    throw new GraphQLError(
      `A job for ${JOB_SUFFIX[job]} is already running. Wait for it to finish before triggering again.`,
      { extensions: { code: "CONFLICT" } }
    );
  }

  // Read the CronJob to get its job template
  const cronJob = await batchApi.readNamespacedCronJob({
    name: cronJobName,
    namespace,
  });

  const jobSpec = cronJob.spec?.jobTemplate?.spec;
  if (!jobSpec) {
    throw new GraphQLError(`Could not read spec for CronJob ${cronJobName}`, {
      extensions: { code: "INTERNAL_SERVER_ERROR" },
    });
  }

  const newJob: V1Job = {
    apiVersion: "batch/v1",
    kind: "Job",
    metadata: {
      name: jobName,
      namespace,
      annotations: {
        "cronjob.kubernetes.io/instantiate": "manual",
      },
    },
    spec: {
      ...jobSpec,
      ttlSecondsAfterFinished: TTL_SECONDS,
    },
  };

  await batchApi.createNamespacedJob({ namespace, body: newJob });

  return {
    jobName,
    success: true,
    message: `Job ${jobName} created successfully.`,
  };
}