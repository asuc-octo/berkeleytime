import moment from "moment";
import { spawn } from "promisify-child-process";

/**
 * TO-DO: Convert this from a regular cron to k8s Cronjob, but slightly tricky 
 * since it requires gcloud auth and rook-ceph-tools pod
 */

const NUMBER_OF_BACKUPS_TO_STORE = 30;

const tee = async (...args) => {
  const child = spawn(...args, {
    env: process.env,
    encoding: "utf8",
    shell: true,
    stdio: "pipe",
    // signal: null,
  });
  child.stdin.pipe(process.stdin);
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
  return child.catch((e) => e);
};

const upload = async (obj) => {
  const { label, pvc } = obj;
  const volumeName = JSON.parse(
    (await tee(`kubectl get pvc/${pvc} -o json`)).stdout
  ).spec.volumeName;
  const volumeHandle = JSON.parse(
    (await tee(`kubectl get pv/${volumeName} -o json`)).stdout
  )
    .spec.csi.volumeHandle.split("-")
    .splice(-5)
    .join("-");
  const timestamp = moment(new Date()).format("YYYY-MM-DD_HH-mm-ss");
  const volumeSnapshotCompressed = `snapshot_${label}_${timestamp}.img.gz`;
  await tee(
    `kubectl -n rook-ceph exec deploy/rook-ceph-tools -- rbd export rook-cephrbd/csi-vol-${volumeHandle} - | gzip | gsutil cp - gs://berkeleytime-218606/${label}/${volumeSnapshotCompressed}`
  );
  const backups = (
    await tee(
      `gsutil ls -l gs://berkeleytime-218606/${label} | sort --key 2 --reverse`
    )
  ).stdout
    .trim()
    .split("\n");
  const deletes = [];
  for (const [index, line] of backups.entries()) {
    if (index > NUMBER_OF_BACKUPS_TO_STORE) {
      deletes.push(line.split(/\s+/).slice(-1)[0]);
    }
  }
  if (deletes.length) {
    await tee(`gsutil rm ${deletes.join(" ")}`);
  }
};
await upload({
  label: "bt-psql-prod",
  pvc: "bt-psql-prod",
});
await upload({
  label: "bt-psql-staging",
  pvc: "bt-psql-staging",
});
await upload({
  label: "bt-gitlab",
  pvc: "bt-gitlab",
});
await upload({
  label: "bt-elasticsearch",
  pvc: "bt-elasticsearch",
});
