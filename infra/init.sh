# This file intended to run once on new cluster and used as reference thereafter
# Run line-by-line during first-time k8s cluster setup -- do not run all at once

# Manually authenticate with gcloud-sdk first if necessary before proceeding
#   echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" > /etc/apt/sources.list.d/google-cloud-sdk.list
#   curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -
#   apt update && apt install -y google-cloud-sdk && gcloud auth login
# Google Bucket (restricted access) --> https://console.cloud.google.com/storage/browser/berkeleytime-218606?authuser=octo.berkeleytime@asuc.org
# GitHub repo's /infra folder should exist at /berkeleytime/infra on filesystem
# Example sync workflow:
# rsync -rav berkeleytime/infra/ root@berkeleytime.com:/berkeleytime/infra/

# During failover, to set domain prefix, eg ocf.berkeleytime.com -> gcp.berkeleytime.com
# find /berkeleytime -type f -name "*" -exec sed -i 's/ocf.berkeleytime.com/gcp.berkeleytime.com/g' "{}" \;
# Benefit of domain prefixing is that you can initialize and test a GCP server in the background while OCF still runs

# Can use command-line to switch between GCP and OCF IPs in case of failover
# gcloud dns record-sets delete --zone berkeleytime --type A berkeleytime.com
# ADDRESS_GCP=34.94.48.10; gcloud dns record-sets create --zone berkeleytime --type A berkeleytime.com --rrdatas $ADDRESS_OCF
# ADDRESS_OCF=169.229.226.55; gcloud dns record-sets create --zone berkeleytime --type A berkeleytime.com --rrdatas $ADDRESS_GCP

# Tested on: Ubuntu 20.04, Kubernetes v1.20.2, single-node architecture
# Specific kernel required for core features like BPF (Berkeley Packet Filter)
# > uname -a (show Linux kernel version)
# Linux hozer-55 5.4.0-65-generic #73-Ubuntu SMP Mon Jan 18 17:25:17 UTC 2021 x86_64 x86_64 x86_64 GNU/Linux
# For issues such as being unable to even ping host or getting block storage,
# consult with one of the OCF site admins
# Slack: http://fco.slack.com
# Slack username: octo.berkeleytime@asuc.org
# Slack password: can be found in Google Bucket
# Public IRC: https://irc.ocf.berkeley.edu
# (Ja Wattanawong <jaw@ocf.berkeley.edu> was BT's first OCF site admin)

# TO-DO / FIXME:
# Currently, all Berkeleytime Kubernetes resources are basically all in the
# "default" namespace. However, what we should do is create a new namespace for
# each Berkeleytime environment ==> "k create ns prod" and then make a
# "$NAMESPACE" env variable in the YAML files, to be substituted with envsubst

# TO-DO / FIXME:
# This is a giant bash script. Make it more reproducible with Ansible or some other tool

export DEVICE_IP=$(ip -4 addr show $(ip -4 route ls | grep default | grep -Po '(?<=dev )(\S+)') | grep -oP '(?<=inet\s)\d+(\.\d+){3}')
apt update
apt install -y curl
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
curl https://baltocdn.com/helm/signing.asc | apt-key add -
echo "deb http://apt.kubernetes.io/ kubernetes-xenial-unstable main" > /etc/apt/sources.list.d/kubernetes.list
echo "deb https://baltocdn.com/helm/stable/debian/ all main" > /etc/apt/sources.list.d/helm-stable-debian.list
apt update
apt install -y docker.io kubeadm kubelet helm
systemctl enable docker
cp ~/.bashrc ~/.bashrc.bak
echo export KUBECONFIG=\$HOME/.kube/config >> ~/.bashrc
echo alias k='kubectl' >> ~/.bashrc
echo shopt -s histverify >> ~/.bashrc
echo "br_netfilter" > /etc/modules-load.d/containerd.conf
echo "net.ipv4.conf.all.route_localnet = 1" >> /etc/sysctl.conf
echo "127.0.0.1 $HOSTNAME" >> /etc/hosts # for some reason, host can have trouble identifying itself
modprobe br_netfilter
swapoff -a && sed -i "s/\/swap/# \/swap/g" /etc/fstab
kubeadm init --skip-phases addon/kube-proxy # BPF replaces kube-proxy, https://docs.cilium.io/en/v1.9/gettingstarted/kubeproxy-free
sed -i '/- kube-apiserver/a\ \ \ \ - --feature-gates=MixedProtocolLBService=true' /etc/kubernetes/manifests/kube-apiserver.yaml # k8s 1.20 Alpha feature
echo "KUBELET_EXTRA_ARGS='--kube-reserved=cpu=100m,memory=100Mi,ephemeral-storage=1Gi,pid=1000 --system-reserved=cpu=100m,memory=100Mi,ephemeral-storage=1Gi,pid=1000 --eviction-hard=memory.available<500Mi'" > /etc/default/kubelet
mkdir -p ~/.kube && cp /etc/kubernetes/admin.conf ~/.kube/config
kubectl taint nodes $(hostname) node-role.kubernetes.io/master-
kubectl apply -f /berkeleytime/infra/k8s/kube-system
timedatectl set-timezone America/Los_Angeles

# example use: istioctl proxy-config cluster deploy/bt-psql-staging -n default
curl -sL https://istio.io/downloadIstioctl | sh - # istioctl is istio util, helps
echo export PATH=\$PATH:\$HOME/.istioctl/bin >> ~/.bashrc
# > Helm >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add cilium https://helm.cilium.io
helm repo add codesim https://helm.codesim.com
helm repo add elastic https://helm.elastic.co
helm repo add gitlab https://charts.gitlab.io/
helm repo add grafana https://grafana.github.io/helm-charts
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo add jetstack https://charts.jetstack.io
helm repo add kubernetes-dashboard https://kubernetes.github.io/dashboard
helm repo add rook-release https://charts.rook.io/release
helm repo add stable https://charts.helm.sh/stable
helm repo update
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Helm <

# > Nightly Backup >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
curl https://deb.nodesource.com/setup_16.x | bash -
apt install -y nodejs
crontab -l | { cat; echo "0 4 * * * /usr/bin/npm --prefix /berkeleytime/infra/backup install && /bin/node /berkeleytime/infra/backup"; } | crontab -
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Nightly Backup <

# > fail2ban >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
# This is necessary because log filenames from Kubernetes pods are dynamic, but
# fail2ban does not have any built-in logic to parse new log files, so use
# crontab to poll the logs and put it in a statically named file
crontab -l | { cat; echo "@reboot /bin/node /berkeleytime/infra/fail2ban-helper"; } | crontab -
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< fail2ban <

# > Cluster networking >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
# If BPF works, policy-related things appear in /sys/fs/bpf
helm install cilium cilium/cilium --version 1.9.6 -n kube-system -f - << EOF
# https://github.com/cilium/cilium/blob/e3f96e3328757f5af394a7e09a2781ce5a1554be/install/kubernetes/cilium/values.yaml
k8sServiceHost: $DEVICE_IP
k8sServicePort: 6443
kubeProxyReplacement: strict
operator:
  replicas: 1
EOF
git clone --single-branch --branch release-1.9 https://github.com/istio/istio.git # https://github.com/istio/istio/commit/5dd2044
helm -n istio install istio-base istio/manifests/charts/base -f /berkeleytime/infra/helm/istio-base.yaml --create-namespace
helm -n istio install istiod istio/manifests/charts/istio-control/istio-discovery -f /berkeleytime/infra/helm/istiod.yaml
kubectl apply -f /berkeleytime/infra/k8s/istio/envoy-filter.yaml
helm -n kube-system install metrics-server bitnami/metrics-server --version 5.8.4 -f /berkeleytime/infra/helm/metrics-server.yaml
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Cluster networking <

# > Import secrets >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
kubectl create ns cert-manager
gsutil cp gs://berkeleytime-218606/secrets/iam-bt-dns01-solver.json - | kubectl create secret generic clouddns-dns01-solver-svc-acct --from-file credentials-clouddns-dns01-solver-svc-acct.json=/dev/stdin -n cert-manager
gsutil cp gs://berkeleytime-218606/secrets/iam-bt-gitlab-runner.json - | kubectl create secret docker-registry docker-registry-gcr --docker-server gcr.io --docker-username _json_key --docker-email bt-gitlab-runner@berkeleytime-218606.iam.gserviceaccount.com --docker-password "$(cat /dev/stdin)"
gsutil cp gs://berkeleytime-218606/secrets/bt-gitlab-runner.env - | kubectl create secret generic bt-gitlab-runner --from-env-file /dev/stdin
gsutil cp gs://berkeleytime-218606/secrets/kubernetes-general-secrets.env - | kubectl create secret generic general-secrets --from-env-file /dev/stdin
gsutil cp gs://berkeleytime-218606/secrets/kubernetes-bt-ingress-protected-routes - | kubectl create secret generic bt-ingress-protected-routes --from-file auth=/dev/stdin
kubectl patch serviceaccount default -p '{"imagePullSecrets":[{"name":"docker-registry-gcr"}]}'
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Import secrets <

# > rook >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
# This handles dynamic pvcs with bare-metal storage. Uses attached block devices
helm install rook rook-release/rook-ceph -n rook --version v1.6.4 --create-namespace -f /berkeleytime/infra/helm/rook.yaml
kubectl apply -f /berkeleytime/infra/k8s/rook --recursive;
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< rook <

# > Ingress >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
envsubst << EOF | helm install metallb bitnami/metallb --version 1.0.2 -n kube-system -f -
configInline:
  address-pools:
    - name: default
      protocol: layer2
      addresses:
        - $DEVICE_IP-$DEVICE_IP
EOF
helm install ingress-nginx ingress-nginx/ingress-nginx --version 3.27.0 -n ingress-nginx --create-namespace -f /berkeleytime/infra/helm/ingress-nginx.yaml
helm install cert-manager jetstack/cert-manager --version v1.1.0 -n cert-manager --create-namespace --set installCRDs=true
until kubectl apply -f /berkeleytime/infra/k8s/default/certificate.yaml && kubectl apply -f /berkeleytime/infra/k8s/cert-manager/clusterissuer.yaml; do sleep 1; done;
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Ingress <

# > Elasticsearch >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
kubectl apply -f /berkeleytime/infra/k8s/default/bt-elasticsearch.yaml
helm install bt-logstash elastic/logstash --version 7.12.1 -f /berkeleytime/infra/helm/logstash.yaml
helm install bt-kibana elastic/kibana --version 7.12.1 -f /berkeleytime/infra/helm/kibana.yaml
helm install bt-filebeat elastic/filebeat --version 7.12.1 -f /berkeleytime/infra/helm/filebeat.yaml
helm install bt-metricbeat elastic/metricbeat --version 7.12.1 -f /berkeleytime/infra/helm/metricbeat.yaml # As of 2021-04-01, still waiting for a fix first noticed in Version 7.10.2: "error getting group status: open /proc/<PID>/cgroup: no such file or directory"
helm install bt-curator stable/elasticsearch-curator -f /berkeleytime/infra/helm/curator.yaml
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Elasticsearch <

# > Slack Webhook >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
export $(gsutil cp gs://berkeleytime-218606/secrets/slack-url-incoming-webhook.env -)
gsutil cp gs://berkeleytime-218606/secrets/slack-url-incoming-webhook.env - | kubectl create secret generic slack-webhooks --from-env-file /dev/stdin
envsubst < /berkeleytime/infra/helm/elastalert.yaml | helm install bt-elastalert codesim/elastalert --version 1.9.0 -f -
gcloud builds submit --project berkeleytime-218606 /berkeleytime/infra/gitlab-notify --tag gcr.io/berkeleytime-218606/gitlab-notify:latest
kubectl apply -f /berkeleytime/infra/k8s/default/bt-gitlab-notify.yaml
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Slack Webhook <

# > GitLab >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
# Cannot deploy BT app manually unless have extracted bt-*-prod YAML manifests
# GitLab injects secrets during build time
gcloud auth configure-docker -q
gcloud config set builds/use_kaniko True # use_kaniko allows for easy-peasy simple caching logic by Google during `gcloud builds submit`
gcloud builds submit --project berkeleytime-218606 /berkeleytime/infra/gitlab-runner --tag gcr.io/berkeleytime-218606/gitlab-runner:latest
gcloud builds submit --project berkeleytime-218606 /berkeleytime/infra/github-notify --tag gcr.io/berkeleytime-218606/github-notify:latest
kubectl apply -f /berkeleytime/infra/k8s/default/bt-gitlab.yaml
kubectl apply -f /berkeleytime/infra/k8s/default/bt-github-notify.yaml
helm install bt-gitlab-runner gitlab/gitlab-runner -f /berkeleytime/infra/helm/gitlab-runner.yaml --version 0.28.0
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< GitLab <

export INGRESS_LABEL=primary;
export BASE_DOMAIN_NAME=berkeleytime.com;
envsubst '$INGRESS_LABEL $BASE_DOMAIN_NAME' < /berkeleytime/infra/k8s/default/bt-ingress-infra.yaml  gv| kubectl apply -f -
envsubst '$INGRESS_LABEL $BASE_DOMAIN_NAME' < /berkeleytime/infra/k8s/default/bt-ingress-status.yaml | kubectl apply -f -


# kubectl get secrets/bt-tls --template='{{index .data "tls.crt"}}' | base64 --decode > tls.crt
# kubectl get secrets/bt-tls --template='{{index .data "tls.key"}}' | base64 --decode > tls.key
# openssl x509 -CA tls.crt -CAKey tls.key -out tls.pem -outform PEM
# cat tls.crt tls.key > tls.pem
# kubectl create secret generic bt-mdb --from-file mongodb-ca-cert=tls.crt --from-file mongodb-ca-key=tls.key --from-file mongodb.pem=tls.pem # need to find out a way to make sure it uses mongodb.pem from tls.pem instead of mongodb.pem genered by initContainer
# > BT App Data Layer >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
for CI_ENVIRONMENT_NAME in "staging" "prod"
do
  export CI_ENVIRONMENT_NAME=$CI_ENVIRONMENT_NAME
  gsutil cp gs://berkeleytime-218606/secrets/bt-psql-$CI_ENVIRONMENT_NAME.env - | kubectl create secret generic bt-psql-$CI_ENVIRONMENT_NAME --from-env-file /dev/stdin;
  gsutil cp gs://berkeleytime-218606/secrets/bt-redis-$CI_ENVIRONMENT_NAME.env - | kubectl create secret generic bt-redis-$CI_ENVIRONMENT_NAME --from-env-file /dev/stdin;
  gsutil cp gs://berkeleytime-218606/secrets/bt-mdb-$CI_ENVIRONMENT_NAME.env - | kubectl create secret generic bt-mdb-$CI_ENVIRONMENT_NAME --from-env-file /dev/stdin;
  envsubst < /berkeleytime/infra/k8s/default/bt-psql.yaml | kubectl apply -f -
  envsubst < /berkeleytime/infra/helm/redis.yaml | helm install bt-redis-$CI_ENVIRONMENT_NAME bitnami/redis --version 14.1.0 -f -
  export MDB_REPLICA_COUNT=3; envsubst '$CI_ENVIRONMENT_NAME $MDB_REPLICA_COUNT' < /berkeleytime/infra/helm/mongodb.yaml | helm install bt-mdb-$CI_ENVIRONMENT_NAME bitnami/mongodb --version 10.19.0 -f -
  if [ $CI_ENVIRONMENT_NAME == "staging" ]; then
    # Expose staging services to the external internet and use istio-proxy sidecars to handle HAProxy Protocol, which preserves client source IPs via annotation TPROXY
    kubectl patch deploy/bt-psql-$CI_ENVIRONMENT_NAME -p '{"spec":{"template":{"metadata":{"annotations":{"sidecar.istio.io/inject":"true","sidecar.istio.io/interceptionMode":"TPROXY"}}}}}'
    kubectl patch sts/bt-redis-$CI_ENVIRONMENT_NAME-master -p '{"spec":{"template":{"metadata":{"annotations":{"sidecar.istio.io/inject":"true","sidecar.istio.io/interceptionMode":"TPROXY"}}}}}'
    kubectl patch sts/bt-mdb-$CI_ENVIRONMENT_NAME -p '{"spec":{"template":{"metadata":{"annotations":{"sidecar.istio.io/inject":"true","sidecar.istio.io/interceptionMode":"TPROXY"}}}}}'
  fi
done
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< BT App Data Layer <

# > Ingress >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
export INGRESS_LABEL=primary; export BASE_DOMAIN_NAME=berkeleytime.com; envsubst '$INGRESS_LABEL $BASE_DOMAIN_NAME' < /berkeleytime/infra/k8s/default/bt-ingress-primary.yaml | kubectl apply -f -
export INGRESS_LABEL=primary; export BASE_DOMAIN_NAME=berkeleytime.com; envsubst '$INGRESS_LABEL $BASE_DOMAIN_NAME' < /berkeleytime/infra/k8s/default/bt-ingress-infra.yaml | kubectl apply -f -
export INGRESS_LABEL=secondary; export BASE_DOMAIN_NAME=ocf.berkeleytime.com; envsubst '$INGRESS_LABEL $BASE_DOMAIN_NAME' < /berkeleytime/infra/k8s/default/bt-ingress-primary.yaml | kubectl apply -f -
export INGRESS_LABEL=secondary; export BASE_DOMAIN_NAME=ocf.berkeleytime.com; envsubst '$INGRESS_LABEL $BASE_DOMAIN_NAME' < /berkeleytime/infra/k8s/default/bt-ingress-infra.yaml | kubectl apply -f -
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Ingress <

openssl genrsa -out signed.key 2048
openssl req -x509 -new -subj "/C=US/ST=NY/L=New York/O=Example Corp/OU=IT Department/CN=berkeleytime.com" -key signed.key -out signed.crt

openssl req -new -nodes -subj "/C=US/ST=NY/L=New York/O=Example Corp/OU=IT Department/CN=berkeleytime.com" -keyout signed-me.key -out signed-me.csr
openssl x509 -req -days 365 -in signed-me.csr -out signed-me.crt -CA signed.crt -CAkey signed.key -CAcreateserial -extensions req
cat signed-me.key signed-me.crt > signed-me.pem

kubectl create secret generic bt-mdb --from-file mongodb-ca-cert=signed-me.crt --from-file mongodb-ca-key=signed-me.pem --from-file client-pem=signed-me.pem
