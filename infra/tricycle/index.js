import { spawn } from "promisify-child-process";
const tee = async (...args) => {
  const child = spawn(...args, {
    env: process.env,
    encoding: "utf8",
    shell: true,
    stdio: "pipe",
    signal: null,
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
  SECRET_KUBERNETES_CREDENTIALS,
  TRICYCLE_MAX_NUMBER_OF_LIVE_DEV_BRANCHES,
} = process.env;

const BASE_NAME_DEPLOYMENT_BACKEND = `bt-backend-dev-`;
const FILEPATH_DEPLOY_INGRESS = `infra/k8s/default/bt-ingress-tricycle.yaml`;

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
  const prunedBranch = backendDeployments[0]
    .split("/")[1]
    .split("-")
    .slice(3)
    .join("-");
  await tee(
    `export CI_ENVIRONMENT_NAME=dev-${prunedBranch}; envsubst < ${FILEPATH_DEPLOY_BACKEND} | kubectl delete -f -`
  );
  await tee(
    `export CI_ENVIRONMENT_NAME=dev-${prunedBranch}; envsubst < ${FILEPATH_DEPLOY_FRONTEND} | kubectl delete -f -`
  );
  await tee(
    `export CI_ENVIRONMENT_NAME=${prunedBranch}; envsubst < ${FILEPATH_DEPLOY_INGRESS} | kubectl delete -f -`
  );
}
