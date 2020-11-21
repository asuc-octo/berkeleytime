import moment from "moment";
import { spawn } from "promisify-child-process";
import sleep from "sleep-promise";

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

const upload = async (serviceName) => {
  const SNAPSHOT_NAME = `${serviceName}-snapshot`;
  const SNAPSHOT_PATH = `/berkeleytime/infra/k8s/snapshots/${SNAPSHOT_NAME}.yaml`;
  try {
    await tee(`kubectl delete volumeSnapshot/${SNAPSHOT_NAME}`);
  } catch (error) {
    console.log(error);
  }
  await tee(`kubectl apply -f ${SNAPSHOT_PATH}`);
  let snapshot;
  do {
    snapshot = JSON.parse(
      (await tee(`kubectl get volumeSnapshot/${SNAPSHOT_NAME} -o=json`)).stdout
    );
    await sleep(5000);
  } while (!snapshot || !snapshot.status || !snapshot.status.readyToUse);
  const volumeSnapshotContentLabel =
    snapshot.status.boundVolumeSnapshotContentName;
  const volumeSnapshotContent = JSON.parse(
    (
      await tee(
        `kubectl get volumesnapshotcontent/${volumeSnapshotContentLabel} -o=json`
      )
    ).stdout
  );
  const snapshotHandle = volumeSnapshotContent.status.snapshotHandle
    .split("-")
    .splice(-5)
    .join("-");
  const rookCephToolsPod = JSON.parse(
    (await tee(`kubectl get pod -n rook-ceph -l app=rook-ceph-tools -o json`))
      .stdout
  ).items[0].metadata.name;
  const timestamp = moment(new Date()).format("YYYY-MM-DD_HH-mm-ss");
  const snapshotFilenameCompressed = `snapshot_${serviceName}_${timestamp}.img.gz`;
  await tee(
    `kubectl -n rook-ceph exec ${rookCephToolsPod} -- rbd export rook-cephrbd/csi-snap-${snapshotHandle} - | gzip | gsutil cp - gs://berkeleytime-218606/${serviceName}/${snapshotFilenameCompressed}`
  );
};
upload("bt-psql-prod");
upload("bt-gitlab");
upload("bt-elasticsearch");
