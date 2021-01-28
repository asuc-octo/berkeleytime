# This file intended to run once on new cluster and used as reference after
# Recommend run these lines manually during first-time node setup

# Manually authenticate with gcloud-sdk first if necessary before proceeding
#   apt install -y google-cloud-sdk && gcloud auth login
# Google Bucket is restricted access only https://console.cloud.google.com/storage/browser/berkeleytime-218606?authuser=octo.berkeleytime@asuc.org
# GitHub repo must exist at /berkeleytime

# To switch domain prefix, ocf.berkeleytime.com -> gcp.berkeleytime.com
# find /berkeleytime -type f -name "*" -exec sed -i 's/ocf.berkeleytime.com/gcp.berkeleytime.com/g' "{}" \;

# Can use command-line to switch between GCP and OCF IPs in case of failover
# Point berkeleytime.com from OCF node to GCP node:
# export OCF_IP=169.229.226.55; export GCP_IP=34.94.48.10; gcloud dns record-sets transaction start --zone berkeleytime; gcloud dns record-sets transaction remove --zone berkeleytime --name berkeleytime.com --ttl 300 --type A $OCF_IP; gcloud dns record-sets transaction add --zone berkeleytime --name berkeleytime.com --ttl 300 --type A $GCP_IP; gcloud dns record-sets transaction execute --zone berkeleytime # OCF to GCP
# Point berkeleytime.com from GCP node to OCF node;
# export OCF_IP=169.229.226.55; export GCP_IP=34.94.48.10; gcloud dns record-sets transaction start --zone berkeleytime; gcloud dns record-sets transaction remove --zone berkeleytime --name berkeleytime.com --ttl 300 --type A $GCP_IP; gcloud dns record-sets transaction add --zone berkeleytime --name berkeleytime.com --ttl 300 --type A $OCF_IP; gcloud dns record-sets transaction execute --zone berkeleytime # GCP to OCF

# (OCF only)
# Prevent Puppet from root password reset
# puppet agent --disable
# systemctl disable node_exporter munin-node postfix

# Tested on: Ubuntu 20.04, Debian 10 (Buster), install apt pkgs if errors occur
# Specific kernel required for core features like BPF (Berkeley Packet Filter)
# > uname -a (show Linux kernel version)
# Linux hozer-55 5.9.0-0.bpo.2-rt-amd64 #1 SMP PREEMPT_RT Debian 5.9.6-1~bpo10+1 (2020-11-19) x86_64 GNU/Linux
# Kubernetes v1.20

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
modprobe br_netfilter
kubeadm init --skip-phases addon/kube-proxy # BPF replaces kube-proxy, https://docs.cilium.io/en/v1.9/gettingstarted/kubeproxy-free
sed -i '/- kube-apiserver/a\ \ \ \ - --feature-gates=MixedProtocolLBService=true' /etc/kubernetes/manifests/kube-apiserver.yaml # k8s 1.20 Alpha feature
mkdir -p ~/.kube && cp /etc/kubernetes/admin.conf ~/.kube/config
kubectl taint nodes $(hostname) node-role.kubernetes.io/master-
kubectl apply -f /berkeleytime/infra/k8s/kube-system

# > Backup >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
curl -sL https://deb.nodesource.com/setup_14.x | bash -
apt install -y nodejs
crontab -l | { cat; echo "0 11 * * * /usr/bin/npm --prefix /berkeleytime/infra/backup install && /bin/node /berkeleytime/infra/backup"; } | crontab -
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Backup <

# > fail2ban >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
# This is necessary because log filenames from Kubernetes pods are dynamic, but
# fail2ban does not have any built-in logic to parse new log files, so use
# crontab to poll the logs and put it in a statically named file
crontab -l | { cat; echo "* * * * * /bin/node /berkeleytime/infra/fail2ban-helper"; } | crontab -
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< fail2ban <

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
helm repo update
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Helm <

# > Cluster networking >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
# If BPF works, policy-related things appear in /sys/fs/bpf
helm install cilium cilium/cilium --version 1.9.1 --namespace kube-system -f - << EOF
# https://github.com/cilium/cilium/blob/e3f96e3328757f5af394a7e09a2781ce5a1554be/install/kubernetes/cilium/values.yaml
k8sServiceHost: $DEVICE_IP
k8sServicePort: 6443
kubeProxyReplacement: strict
operator:
  replicas: 1
EOF
git clone --single-branch --branch master https://github.com/istio/istio.git # https://github.com/istio/istio/commit/5ea614d48ee3887884922789985f6cef88346ecf
cd istio; git checkout 5ea614d; cd -;
kubectl create ns istio
helm -n istio install istio-base istio/manifests/charts/base -f /berkeleytime/infra/helm/istio-base.yaml
helm -n istio install istiod istio/manifests/charts/istio-control/istio-discovery -f /berkeleytime/infra/helm/istiod.yaml
kubectl label namespace default istio-injection=disabled
# Make sidecar injection opt-in for a namespace with istio-injection=disabled
kubectl patch mutatingwebhookconfigurations istio-sidecar-injector-istio --type json -p '[{"op": "replace", "path": "/webhooks/0/namespaceSelector", "value": {"matchExpressions":[{"key":"istio-injection","operator":"In","values":["disabled","enabled"]}]} }]'
kubectl get cm istio-sidecar-injector -n istio -o yaml | sed "s/policy: enabled/policy: disabled/g" | k apply -f -
kubectl apply -f /berkeleytime/infra/k8s/istio/istio.yaml
# Add metrics-server so 'kubectl top <pod>' is available
helm install metrics-server bitnami/metrics-server -n kube-system --set rbac.create=false --set apiService.create=true --set extraArgs.kubelet-insecure-tls=true
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Cluster networking <

# > Import secrets >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
kubectl create ns cert-manager || true
gsutil cp gs://berkeleytime-218606/secrets/iam-bt-dns01-solver.json - | kubectl create secret generic clouddns-dns01-solver-svc-acct --from-file credentials-clouddns-dns01-solver-svc-acct.json=/dev/stdin --namespace cert-manager
gsutil cp gs://berkeleytime-218606/secrets/iam-bt-gitlab-runner.json - | kubectl create secret docker-registry docker-registry-gcr --docker-server gcr.io --docker-username _json_key --docker-email bt-gitlab-runner@berkeleytime-218606.iam.gserviceaccount.com --docker-password "$(cat /dev/stdin)"
gsutil cp gs://berkeleytime-218606/secrets/helm-bt-gitlab-runner.env - | kubectl create secret generic bt-gitlab-runner --from-env-file /dev/stdin
gsutil cp gs://berkeleytime-218606/secrets/kubernetes-general-secrets.env - | kubectl create secret generic general-secrets --from-env-file /dev/stdin
gsutil cp gs://berkeleytime-218606/secrets/kubernetes-bt-ingress-protected-routes - | kubectl create secret generic bt-ingress-protected-routes --from-file auth=/dev/stdin
kubectl patch serviceaccount default -p '{"imagePullSecrets":[{"name":"docker-registry-gcr"}]}'
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Import secrets <

# > rook-ceph >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
# This handles dynamic pvcs with bare-metal storage. Uses attached block devices
helm install rook-ceph rook-release/rook-ceph --namespace rook-ceph --version v1.5.3 --create-namespace
kubectl apply -f /berkeleytime/infra/k8s/rook-ceph --recursive;
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< rook-ceph <

# > Ingress >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
envsubst << EOF | helm install metallb bitnami/metallb --version 1.0.2 --namespace kube-system -f -
configInline:
  address-pools:
    - name: default
      protocol: layer2
      addresses:
        - $DEVICE_IP-$DEVICE_IP
EOF
helm install ingress-nginx ingress-nginx/ingress-nginx --version 3.19.0 --namespace ingress-nginx --create-namespace -f /berkeleytime/infra/helm/ingress-nginx.yaml
helm install cert-manager jetstack/cert-manager --version v1.1.0 --namespace cert-manager --create-namespace --set installCRDs=true
until kubectl apply -f /berkeleytime/infra/k8s/default/certificate.yaml && kubectl apply -f /berkeleytime/infra/k8s/cert-manager/clusterissuer.yaml; do sleep 1; done;
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Ingress <

# > Elasticsearch >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
# helm install bt-metricbeat elastic/metricbeat --version 7.9.3 -f /berkeleytime/infra/helm/metricbeat.yaml # Consumes a lot of space on Elasticsearch, still unsure how to use
kubectl apply -f /berkeleytime/infra/k8s/default/bt-elasticsearch.yaml
helm install bt-logstash elastic/logstash -f /berkeleytime/infra/helm/logstash.yaml --version 7.9.3
helm install bt-kibana elastic/kibana --version 7.9.3 -f /berkeleytime/infra/helm/kibana.yaml
helm install bt-filebeat elastic/filebeat -f /berkeleytime/infra/helm/filebeat.yaml --version 7.9.3
helm install bt-elastalert codesim/elastalert --version 1.8.3 -f /berkeleytime/infra/helm/elastalert.yaml
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Elasticsearch <

# > GitLab >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
# Cannot deploy BT app manually unless have extracted bt-*-prod YAML manifests
# GitLab injects secrets during build time
gcloud auth configure-docker -q
gcloud config set builds/use_kaniko True
gcloud builds submit --project berkeleytime-218606 /berkeleytime/infra/gitlab-runner --tag gcr.io/berkeleytime-218606/gitlab-runner:latest
gcloud builds submit --project berkeleytime-218606 /berkeleytime/infra/gitlab-notify --tag gcr.io/berkeleytime-218606/gitlab-notify:latest
gcloud builds submit --project berkeleytime-218606 /berkeleytime/infra/github-notify --tag gcr.io/berkeleytime-218606/github-notify:latest
kubectl apply -f /berkeleytime/infra/k8s/default/bt-gitlab.yaml
kubectl apply -f /berkeleytime/infra/k8s/default/bt-gitlab-notify.yaml
kubectl apply -f /berkeleytime/infra/k8s/default/bt-github-notify.yaml
helm install bt-gitlab-runner gitlab/gitlab-runner -f /berkeleytime/infra/helm/gitlab-runner.yaml --version 0.24.0
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< GitLab <

# > BT App Data Layer >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
for CI_ENVIRONMENT_NAME in "staging" "prod"
do
  export CI_ENVIRONMENT_NAME=$CI_ENVIRONMENT_NAME
  gsutil cp gs://berkeleytime-218606/secrets/helm-bt-psql-$CI_ENVIRONMENT_NAME.env - | kubectl create secret generic bt-psql-$CI_ENVIRONMENT_NAME --from-env-file /dev/stdin;
  gsutil cp gs://berkeleytime-218606/secrets/helm-bt-redis-$CI_ENVIRONMENT_NAME.env - | kubectl create secret generic bt-redis-$CI_ENVIRONMENT_NAME --from-env-file /dev/stdin;
  envsubst < /berkeleytime/infra/k8s/default/bt-psql.yaml | kubectl apply -f -
  envsubst < /berkeleytime/infra/helm/redis.yaml | helm install bt-redis-$CI_ENVIRONMENT_NAME bitnami/redis --version 12.1.1 -f -
  if [ $CI_ENVIRONMENT_NAME == "staging" ]; then
    # Expose staging services to the external internet and use istio-proxy sidecars to handle HAProxy Protocol, which preserves client source IPs via annotation TPROXY
    kubectl patch deploy/bt-psql-$CI_ENVIRONMENT_NAME -p '{"spec":{"template":{"metadata":{"annotations":{"sidecar.istio.io/inject":"true","sidecar.istio.io/interceptionMode":"TPROXY"}}}}}'
    kubectl patch sts/bt-redis-$CI_ENVIRONMENT_NAME-master -p '{"spec":{"template":{"metadata":{"annotations":{"sidecar.istio.io/inject":"true","sidecar.istio.io/interceptionMode":"TPROXY"}}}}}'
  fi
done
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< BT App Data Layer <

# > Ingress >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
export INGRESS_LABEL=primary; export BASE_DOMAIN_NAME=berkeleytime.com; envsubst '$INGRESS_LABEL $BASE_DOMAIN_NAME' < /berkeleytime/infra/k8s/default/bt-ingress-primary.yaml | kubectl apply -f -
export INGRESS_LABEL=secondary; export BASE_DOMAIN_NAME=ocf.berkeleytime.com; envsubst '$INGRESS_LABEL $BASE_DOMAIN_NAME' < /berkeleytime/infra/k8s/default/bt-ingress-primary.yaml | kubectl apply -f -
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Ingress <
