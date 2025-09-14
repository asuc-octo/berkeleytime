Do not use `sudo reboot` when on the OCF node, use `echo b > /proc/sysrq-trigger`. Using the former results in a long hang-time, and we suspect this is due to OCF's VM setup

# Oh-Shit Pit
The "Oh-Shit Pit" is the set of feelings you get when you have an "oh shit" reaction to some bad thing in production and it makes your heart sink to the bottom pit of your stomach 💔

Infrastructure is the last floodgate determining whether the server is in catastrophic failure mode or not. If the backend has some weird edge case that made it crash, it's not catastrophic because the container can restart with something like `k rollout restart deploy/bt-backend-prod` or production deploy manually rolled back on GitLab to a previously known working version

If core infra has failed, it's now the Wild West, all hands on deck, *< more generic phrases to express dire situation >*

note: references to `k` is a bash alias to `kubectl`

Assuming proper notification channels, [status.berkeleytime.com](https://status.berkeleytime.com) aids in automatically detecting issues ([@kevinzwang](https://github.com/kevinzwang) initialized in [#451](https://github.com/asuc-octo/berkeleytime/pull/451) [449](https://github.com/asuc-octo/berkeleytime/pull/449))

![image](https://user-images.githubusercontent.com/22272118/115147175-97b2dd00-a00e-11eb-96bc-b7fcf9ac2d90.png)

## Get into the Kubernetes environment
You can troubleshoot by first getting into the cluster: `ssh root@berkeleytime.com`

Login credentials at [https://console.cloud.google.com/storage/browser/berkeleytime-218606/secrets?prefix=&project=berkeleytime-218606&authuser=YOUR-EMAIL-HERE](https://console.cloud.google.com/storage/browser/berkeleytime-218606/secrets?prefix=&project=berkeleytime-218606&authuser=octo.berkeleytime@asuc.org) in the **ocf-vm-hozer-55** file or do it [the CLI way](https://github.com/asuc-octo/berkeleytime/wiki/OCF-Slack)

If you're in a production trouble spot right now, try to ssh in now as that is a major baseline prerequisite. If the system is low on RAM or CPU, it could take a while

If you can't even ssh, have the node reset by OCF or stop it on GCP `gcloud compute instances reset bt-gcp`

## Why isn't Postgres starting or responding? And why is the Elasticsearch container failing to start?
Both rely on a persistent disk. If all files in PVCs inside containers are inaccessible (can't mount, can't read/write), there's a good chance there's a problem with Rook. `k -n rook get po` to see all the pods in the Rook namespace

One example troubleshooting step is to just restart the Object Storage Daemon (OSD) responsible for the actual handling of files in PVCs `k -n rook rollout restart deploy/rook-ceph-osd-0`

The namespace **rook** refers to **Rook**, the Kubernetes operator for rolling your own storage on bare-metal-like nodes, and **Ceph**, the open-source object storage system that knows how to use block storage really well in an (ideally) distributed cluster

Knowing more than that requires deep rabbit-hole search engine-ing on distributed file systems (e.g. CephFS vs RADOS Block Devices, or Ceph vs GlusterFS)

## How to backup/restore the application layers's persistent files?
[Nightly](https://github.com/asuc-octo/berkeleytime/blob/a49ae44c13f957979ea718ca68042f8e36284a38/infra/backup/index.js), we use a rook utility pod to pipe to a file in Google Cloud Storage (GCS) thereby making an offline backup that can import into Kubernetes

With a little bit of jank, here is how a manual restore might look like:

![image](https://user-images.githubusercontent.com/22272118/113522148-232e6780-9553-11eb-97d3-a3212ca242b8.png)

A PNG image is pasted and the above commands are not in text format because with this kind of interaction, you **really** need to understand at a lower-level what is happening if you do a manual import from our gzip backup. It's hard to copy-paste on purpose.

It's worth testing this process on a test PVC (`bt-psql-staging`) so that on the unfortunate day you have to do it on `bt-gitlab`, `bt-psql-prod`, or `bt-elasticsearch`, you'll be familiar with the procedure (🤞 if you're here looking for guidance mid-crisis and haven't explored before). We do not use Kubernetes's [PVC snapshot and restore](https://kubernetes.io/docs/concepts/storage/volume-snapshots/) because pulling slices of application data out of self-hosted storage and pushing it to reliable storage so that we can one day use it in a catastrophic scenario is the raison d'être for making back-ups. As of now, the VolumeSnapshot resource in Kubernetes doesn't provide an easy way to get your persistent files into and out of the cluster. If single-node Kubernetes fails entirely and the backup can't be accessed, that presents a nightmare scenario for failover

The exported gzip made via `deploy/rook-ceph-tools` can mount as an ordinary ext4 volume, which is a big deal for working with UNIX files. To inspect the files, you can do `export SNAP=snapshot_xyz.img.gz; gunzip $SNAP`, and `mount -o x-mount.mkdir -t ext4 <snapshot_xyz.img> hello-world`. To unmount a raw image once done, `umount hello-world`.

## Help! The Node is being really slow, it takes a while to ssh, or berkeleytime.com just doesn't respond
It's hard to get a functioning Elasticsearch while imposing absolute resource limits, so sometimes it can get out of control and hang the node. Most big Node response issues happen due to Elasticsearch

If possible, `ssh root@berkeleytime.com -t 'pgrep -af elasticsearch | grep -v bash | cut -d" " -f1 | xargs -r kill -9 && kubectl scale --replicas=0 deploy/bt-elasticsearch'`. Diagnose RAM and CPU usage with `free -m`, `htop -s PERCENT_CPU`, `htop -s PERCENT_MEM`, or `ps aux | sort -n -k 3`. If it's not elasticsearch, you should be comfortable diagnosing which resource is deprived and how to temporarily free up that resource to buy extra time

## Help x2! I really can't ssh into the node, there's no way to communicate
This is a worst-case scenario. Message one of the site managers at OCF, [https://github.com/asuc-octo/berkeleytime/wiki/OCF-Slack](instructions)

## GitLab doesn't respond or something is wrong with the CI/CD pipeline
Troubleshoot with `k logs -f deploy/bt-gitlab`, `k exec -it deploy/bt-gitlab -- gitlab-ctl status` or `k rollout restart deploy/bt-gitlab`. Once GitLab is at least running, try to investigate at `berkeleytime.com/git`

## I want to investigate an incident related to any container, whether related to application or infrastructure. Where are the logs?
If Elasticsearch is working, berkeleytime.com/kibana

## Is it safe to wipe /dev/vdb (vdb may be something else, check with fdisk -l)?
Yes. Note this block device is the literal entirety of where persistent application data in Kubernetes PVCs is stored. If you wipe all info from this device, make sure to triple check some good backups exist in cloud storage, then you can delete Ceph volume mappings, zero the block device, and restore said backups
```
zap() {
  echo "Clearing /dev/mapper/ceph-* ..."
  ls /dev/mapper/ceph-* | xargs -I% -- dmsetup remove %
  rm -rfv /dev/ceph-* /var/lib/rook
  sgdisk --zap-all $1
  dd if=/dev/zero of="$1" bs=1M
}
zap /dev/vdb
k -n rook delete po --all # makes Rook detect the device faster
```

## This is a weird process
It's true. Moving out of GCP GKE, fulfilling 2x greater hardware demand, and rolling everything yourself has its ups and downs. Overall, it's easy to move file systems across virtual machines, but it's not easy to move a proprietary storage system with massive cloud vendor lock-in. Having said that, all suggestions welcome, please suggest ways to improve stability

# Random Cool Tricks
Even while Kubernetes file storage is fairly abstracted, there are some cool things you can do from being able to mount a regular raw image and do low-level things using Rook-Ceph, like:
- converting the raw img's filesystem from ext4 to XFS in-place: `export SNAP=snapshot_xyz.img; export DEVICE=$(losetup --partscan --find --show "$SNAP"); fstransform $DEVICE ext4` which you can then import to Rook after Rook cluster YAML has been changed to use XFS instead of ext4
- `export SNAP=snapshot_xyz.img; export DEVICE=$(losetup --partscan --find --show "$SNAP"); dd if=/dev/zero bs=1GB count=<number of GB to add> >> $SNAP; resize2fs $DEVICE` to manually resize a raw image. Import to Rook/Kubernetes will work as long as PVC in Kubernetes has been resized to the new size, exact number of bytes required
- `losetup -d $DEVICE` to remove virtual block devices