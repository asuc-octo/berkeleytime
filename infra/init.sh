# This file intended to run only once on new cluster and used as reference after
# Manually authenticate with gcloud first before proceeding

# > Import secrets >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
kubectl create ns cert-manager || true
gsutil cp gs://berkeleytime-218606/secrets/credentials-clouddns-dns01-solver-svc-acct.json - | kubectl create secret generic clouddns-dns01-solver-svc-acct --from-file credentials-clouddns-dns01-solver-svc-acct.json=/dev/stdin --namespace cert-manager
gsutil cp gs://berkeleytime-218606/secrets/docker-registry-gcr.yaml - | kubectl apply -f -
gsutil cp gs://berkeleytime-218606/secrets/helm-bt-gitlab-runner.env - | kubectl create secret generic bt-gitlab-runner --from-env-file /dev/stdin
gsutil cp gs://berkeleytime-218606/secrets/kubernetes-docker-registry-gcr.json - | kubectl create secret docker-registry docker-registry-gcr --docker-server gcr.io --docker-username _json_key --docker-email jenkins-gcr-creds@berkeleytime-218606.iam.gserviceaccount.com --docker-password "$(cat /dev/stdin)"
gsutil cp gs://berkeleytime-218606/secrets/kubernetes-general-secrets.env - | kubectl create secret generic general-secrets --from-env-file /dev/stdin
gsutil cp gs://berkeleytime-218606/secrets/kubernetes-ingress-nginx-bt-protected-routes - | kubectl create secret generic ingress-nginx-bt-protected-routes --from-file auth=/dev/stdin
kubectl patch serviceaccount default -p '{"imagePullSecrets":[{"name":"docker-registry-gcr"}]}'
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Import secrets <

# > Helm >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add codesim https://helm.codesim.com
helm repo add elastic https://helm.elastic.co
helm repo add grafana https://grafana.github.io/helm-charts
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo add jetstack https://charts.jetstack.io
helm repo add kubernetes-dashboard https://kubernetes.github.io/dashboard
helm repo add rook-release https://charts.rook.io/release
helm repo update
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Helm <

# > Ingress >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
helm install ingress-nginx ingress-nginx/ingress-nginx --version 3.8.0 --namespace ingress-nginx --create-namespace -f /berkeleytime/infra/helm/ingress-nginx.yaml
helm install cert-manager jetstack/cert-manager --version v1.0.4 --namespace cert-manager --create-namespace --set installCRDs=true
until kubectl apply -f /berkeleytime/k8s/default/certificate.yaml && kubectl apply -f /berkeleytime/k8s/cert-manager/clusterissuer.yaml; do sleep 1; done;
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Ingress <

# > rook-ceph >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
# External snapshotter from source:
# git clone --single-branch --branch v3.0.0 https://github.com/kubernetes-csi/external-snapshotter.git
# kubectl apply -f external-snapshotter/client/config/crd
# kubectl apply -f external-snapshotter/deploy/kubernetes/snapshot-controller
kubectl apply -f /berkeleytime/k8s/kubernetes-csi
helm install rook-ceph rook-release/rook-ceph --namespace rook-ceph --version v1.4.7 --create-namespace
# Three lines below necessary due to some race condition after rook-ceph install
kubectl wait --for condition=established --timeout 120s crd/cephfilesystems.ceph.rook.io
kubectl wait --for condition=established --timeout 120s crd/cephcluster.ceph.rook.io
kubectl wait --for condition=established --timeout 120s crd/cephblockpool.ceph.rook.io
kubectl apply -f /berkeleytime/k8s/rook-ceph/setup --recursive;
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< rook-ceph <

# > Monitoring >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
helm install bt-elasticsearch elastic/elasticsearch --version 7.9.3 -f /berkeleytime/infra/helm/elasticsearch.yaml
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
crontab -l | { cat; echo "0 11 * * * /usr/bin/npm --prefix /berkeleytime/backup install && /bin/node /berkeleytime/backup"; } | crontab -
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Backup <

# > Regular k8s apps >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
gcloud builds submit /berkeleytime/infra/docker/gitlab-runner --tag gcr.io/berkeleytime-218606/gitlab-runner:latest
gcloud auth configure-docker
kubectl apply -f /berkeleytime/infra/k8s/default
helm install bt-gitlab-runner gitlab/gitlab-runner -f /berkeleytime/infra/helm/gitlab-runner.yaml --version 0.22.0
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Regular k8s apps <
