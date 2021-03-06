import { spawn } from "promisify-child-process";
const tee = async (...args) => {
  const child = spawn(...args, {
    env: process.env,
    encoding: "utf8",
    shell: true,
    stdio: "pipe",
  });
  child.stdin.pipe(process.stdin);
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
  return child.catch((e) => e);
};

const {
  CI_COMMIT_BRANCH,
  FILEPATH_DEPLOY_BACKEND,
  FILEPATH_DEPLOY_FRONTEND,
  FILEPATH_DEPLOY_INGRESS,
  SECRET_KUBERNETES_CREDENTIALS,
  TRICYCLE_MAX_NUMBER_OF_LIVE_DEV_BRANCHES,
} = process.env;
const BASE_NAME_DEPLOYMENT_BACKEND = `bt-backend-dev-`;
const ILLEGAL_BRANCH_NAMES = ["gcp", "ocf", "staging", "www"];
const SUBDOMAIN_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9\-]{0,61}[A-Za-z0-9])?$/; // RFC-1123 subdomain name compliance
if (ILLEGAL_BRANCH_NAMES.includes(CI_COMMIT_BRANCH)) {
  throw Error(
    `'${CI_COMMIT_BRANCH}' is an illegal branch name: '${ILLEGAL_BRANCH_NAMES.map(
      (branch) => branch + ".berkeleytime.com"
    ).join(", ")}' are special reserved URLs`
  );
}
if (!SUBDOMAIN_PATTERN.test(CI_COMMIT_BRANCH)) {
  throw Error(
    `'${CI_COMMIT_BRANCH}' is an illegal branch name: it does not conform to RFC-1123 domain name standards`
  );
}
await tee(
  `export CI_ENVIRONMENT_NAME=dev-${CI_COMMIT_BRANCH}; envsubst < ${FILEPATH_DEPLOY_BACKEND} | kubectl apply -f - --kubeconfig ${SECRET_KUBERNETES_CREDENTIALS}`
);
await tee(
  `export CI_ENVIRONMENT_NAME=dev-${CI_COMMIT_BRANCH}; envsubst < ${FILEPATH_DEPLOY_FRONTEND} | kubectl apply -f - --kubeconfig ${SECRET_KUBERNETES_CREDENTIALS}`
);
await tee(
  `export CI_ENVIRONMENT_NAME=${CI_COMMIT_BRANCH}; envsubst < ${FILEPATH_DEPLOY_INGRESS} | kubectl apply -f - --kubeconfig ${SECRET_KUBERNETES_CREDENTIALS}`
);
const backendDeployments = (
  await tee(
    `kubectl get deployment --no-headers --sort-by=.metadata.creationTimestamp -o name`
  )
).stdout
  .trim()
  .split("\n")
  .filter((name) => name.includes(BASE_NAME_DEPLOYMENT_BACKEND));
if (backendDeployments.length > TRICYCLE_MAX_NUMBER_OF_LIVE_DEV_BRANCHES) {
  const branchesToPrune = backendDeployments
    .slice(
      0,
      backendDeployments.length - TRICYCLE_MAX_NUMBER_OF_LIVE_DEV_BRANCHES
    ) // ^ Integer arithmetic with integer-like strings (env var) in JS is fine
    .map((line) => line.split("/")[1].split("-").slice(3).join("-"));
  for (let branch of branchesToPrune) {
    await tee(
      `export CI_ENVIRONMENT_NAME=dev-${branch}; envsubst < ${FILEPATH_DEPLOY_BACKEND} | kubectl delete -f -`
    );
    await tee(
      `export CI_ENVIRONMENT_NAME=dev-${branch}; envsubst < ${FILEPATH_DEPLOY_FRONTEND} | kubectl delete -f -`
    );
    await tee(
      `export CI_ENVIRONMENT_NAME=${branch}; envsubst < ${FILEPATH_DEPLOY_INGRESS} | kubectl delete -f -`
    );
  }
}
