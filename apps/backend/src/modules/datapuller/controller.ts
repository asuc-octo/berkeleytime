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

const TTL_SECONDS = 300; // 5 minutes

function getBatchApi() {
  const kc = new KubeConfig();
  // loadFromDefault uses in-cluster service account when deployed to k8s
  kc.loadFromDefault();
  return kc.makeApiClient(BatchV1Api);
}

function getCronJobName(job: DatapullerJob): string {
  const prefix = process.env.DATAPULLER_CRONJOB_PREFIX ?? "bt-prod-datapuller";
  return `${prefix}-${JOB_SUFFIX[job]}`;
}

function getNamespace(): string {
  return process.env.K8S_NAMESPACE ?? "bt";
}

export async function triggerDatapuller(
  job: DatapullerJob
): Promise<{ jobName: string; success: boolean; message: string }> {
  // set SKIP_K8S=true in .env to skip the real k8s call
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

  // check for existing job
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

  // get job spec + job name from original cronjob
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

export async function getDatapullerJobStatus(
  jobName: string
): Promise<{ jobName: string; phase: string; message: string | null }> {
  if (process.env.SKIP_K8S === "true") {
    return { jobName, phase: "Succeeded", message: "[MOCK] Job completed." };
  }

  const batchApi = getBatchApi();
  const namespace = getNamespace();

  try {
    const job = await batchApi.readNamespacedJob({ name: jobName, namespace });
    const status = job.status ?? {};

    let phase = "Pending";
    if ((status.active ?? 0) > 0) phase = "Running";
    else if ((status.succeeded ?? 0) > 0) phase = "Succeeded";
    else if ((status.failed ?? 0) > 0) phase = "Failed";

    return { jobName, phase, message: null };
  } catch (e: unknown) {
    const status = (e as { response?: { statusCode?: number } })?.response
      ?.statusCode;
    if (status === 404) {
      return {
        jobName,
        phase: "NotFound",
        message: "Job not found or already cleaned up.",
      };
    }
    throw e;
  }
}
