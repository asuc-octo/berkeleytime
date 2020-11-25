# This file intended to run only ONCE on new cluster and used as reference after
# Manually authenticate with gcloud-sdk first if necessary before proceeding
# gcloud auth login
# Assume that github repo = /berkeleytime

# To switch domain prefix (ex: ocf.berkeleytime.com -> gcp.berkeleytime.com)
# PREVIOUS=ocf.berkeleytime.com
# NEW=gcp.berkeleytime.com
# find /berkeleytime -type f -name "*" -exec sed -i "s/$PREVIOUS/$NEW/g" "{}" \;

# OCF only (stops resetting root password and account credentials)
# sudo puppet agent --disable

apt update
apt install -y curl pv
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
echo "deb http://apt.kubernetes.io/ kubernetes-xenial-unstable main" > /etc/apt/sources.list.d/kubernetes.list
curl https://baltocdn.com/helm/signing.asc | apt-key add -
echo "deb https://baltocdn.com/helm/stable/debian/ all main" | tee /etc/apt/sources.list.d/helm-stable-debian.list
apt update
apt install -y docker.io=19.03.8-0ubuntu1 kubeadm=1.19.2-00 kubelet=1.19.2-00 helm=3.3.4-1
systemctl enable docker
systemctl daemon-reload
cp ~/.bashrc ~/.bashrc.bak
echo export KUBECONFIG=\$HOME/.kube/config >> ~/.bashrc
echo alias k='kubectl' >> ~/.bashrc
echo shopt -s histverify >> ~/.bashrc
echo "br_netfilter" > /etc/modules-load.d/containerd.conf
modprobe br_netfilter
kubeadm init
mkdir -p ~/.kube && cp /etc/kubernetes/admin.conf ~/.kube/config

kubectl apply -f /berkeleytime/infra/k8s/kube-system
kubectl taint nodes $(hostname) node-role.kubernetes.io/master-

# > Import secrets >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
kubectl create ns cert-manager || true
gsutil cp gs://berkeleytime-218606/secrets/credentials-clouddns-dns01-solver-svc-acct.json - | kubectl create secret generic clouddns-dns01-solver-svc-acct --from-file credentials-clouddns-dns01-solver-svc-acct.json=/dev/stdin --namespace cert-manager
gsutil cp gs://berkeleytime-218606/secrets/helm-bt-gitlab-runner.env - | kubectl create secret generic bt-gitlab-runner --from-env-file /dev/stdin
gsutil cp gs://berkeleytime-218606/secrets/kubernetes-docker-registry-gcr.json - | kubectl create secret docker-registry docker-registry-gcr --docker-server gcr.io --docker-username _json_key --docker-email jenkins-gcr-creds@berkeleytime-218606.iam.gserviceaccount.com --docker-password "$(cat /dev/stdin)"
gsutil cp gs://berkeleytime-218606/secrets/kubernetes-general-secrets.env - | kubectl create secret generic general-secrets --from-env-file /dev/stdin
gsutil cp gs://berkeleytime-218606/secrets/kubernetes-ingress-nginx-bt-protected-routes - | kubectl create secret generic ingress-nginx-bt-protected-routes --from-file auth=/dev/stdin
kubectl patch serviceaccount default -p '{"imagePullSecrets":[{"name":"docker-registry-gcr"}]}'
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Import secrets <

# > Create base images >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
gcloud config set builds/use_kaniko True
gcloud builds submit --project berkeleytime-218606 /berkeleytime/infra/docker/gitlab-runner --tag gcr.io/berkeleytime-218606/gitlab-runner:latest
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Create base images <

# > Helm >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
helm repo add bitnami https://charts.bitnami.com/bitnami
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

# > Ingress >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
helm install ingress-nginx ingress-nginx/ingress-nginx --version 3.11.0 --namespace ingress-nginx --create-namespace -f /berkeleytime/infra/helm/ingress-nginx.yaml
helm install cert-manager jetstack/cert-manager --version v1.0.4 --namespace cert-manager --create-namespace --set installCRDs=true
until kubectl apply -f /berkeleytime/infra/k8s/default/certificate.yaml && kubectl apply -f /berkeleytime/infra/k8s/cert-manager/clusterissuer.yaml; do sleep 1; done;
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Ingress <

# > rook-ceph >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
# External snapshotter from source:
# git clone --single-branch --branch v3.0.0 https://github.com/kubernetes-csi/external-snapshotter.git
# kubectl apply -f external-snapshotter/client/config/crd
# kubectl apply -f external-snapshotter/deploy/kubernetes/snapshot-controller
kubectl apply -f /berkeleytime/infra/k8s/kubernetes-csi
helm install rook-ceph rook-release/rook-ceph --namespace rook-ceph --version v1.5.1 --create-namespace
kubectl apply -f /berkeleytime/infra/k8s/rook-ceph/setup --recursive;
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< rook-ceph <

# > Monitoring >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
helm install bt-logstash elastic/logstash -f /berkeleytime/infra/helm/logstash.yaml --version 7.9.3
helm install bt-kibana elastic/kibana --version 7.9.3 -f /berkeleytime/infra/helm/kibana.yaml
helm install bt-metricbeat elastic/metricbeat --version 7.9.3 -f /berkeleytime/infra/helm/metricbeat.yaml
helm install bt-filebeat elastic/filebeat -f /berkeleytime/infra/helm/filebeat.yaml --version 7.9.3
helm install bt-elastalert codesim/elastalert --version 1.8.1 -f /berkeleytime/infra/helm/elastalert.yaml
# helm install kubernetes-metrics-server bitnami/metrics-server --version bitnami/metrics-server --version 4.5.2
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Databases <

# > Application DB >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
for CI_ENVIRONMENT_NAME in "staging" "prod"
do
  export CI_ENVIRONMENT_NAME=$CI_ENVIRONMENT_NAME
  gsutil cp gs://berkeleytime-218606/secrets/helm-bt-psql-$CI_ENVIRONMENT_NAME.env - | kubectl create secret generic bt-psql-$CI_ENVIRONMENT_NAME --from-env-file /dev/stdin;
  envsubst < /berkeleytime/infra/helm/postgres.yaml | helm install bt-psql-$CI_ENVIRONMENT_NAME bitnami/postgresql-ha --version 5.2.4 -f -
  helm install bt-redis-$CI_ENVIRONMENT_NAME bitnami/redis -f /berkeleytime/infra/helm/redis.yaml --version 11.3.4
done
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Application DB <

# > Backup >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
curl -sL https://deb.nodesource.com/setup_14.x | sudo bash -
apt install -y nodejs
crontab -l | { cat; echo "0 11 * * * /usr/bin/npm --prefix /berkeleytime/infra/backup install && /bin/node /berkeleytime/infra/backup"; } | crontab -
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Backup <

# > Regular k8s apps >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
kubectl apply -f /berkeleytime/infra/k8s/default/bt-elasticsearch.yaml
kubectl apply -f /berkeleytime/infra/k8s/default/bt-gitlab.yaml
kubectl apply -f /berkeleytime/infra/k8s/default/certificate.yaml
kubectl apply -f /berkeleytime/infra/k8s/default/limitrange.yaml
kubectl apply -f /berkeleytime/infra/k8s/default/ingress.yaml
gcloud auth configure-docker -q
helm install bt-gitlab-runner gitlab/gitlab-runner -f /berkeleytime/infra/helm/gitlab-runner.yaml --version 0.23.0
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Regular k8s apps <
