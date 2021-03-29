import moment from "moment";
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
