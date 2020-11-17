# > Helm >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add cilium https://helm.cilium.io
helm repo add codesim https://helm.codesim.com
helm repo add elastic https://helm.elastic.co
helm repo add grafana https://grafana.github.io/helm-charts
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo add jetstack https://charts.jetstack.io
helm repo add kubernetes-dashboard https://kubernetes.github.io/dashboard
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add rook-release https://charts.rook.io/release
helm repo add stable https://kubernetes-charts.storage.googleapis.com
helm repo update
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Helm <

# > Ingress >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
helm install ingress-nginx ingress-nginx/ingress-nginx --version 3.8.0 --namespace ingress-nginx --create-namespace -f helm/ingress-nginx.yaml
helm install cert-manager jetstack/cert-manager --version v1.0.4 --namespace cert-manager --create-namespace --set installCRDs=true
gsutil cp gs://berkeleytime-218606/secrets/credentials-clouddns-dns01-solver-svc-acct.json - | kubectl create secret generic clouddns-dns01-solver-svc-acct --from-file credentials-clouddns-dns01-solver-svc-acct.json=/dev/stdin --namespace cert-manager
until kubectl apply -f /berkeleytime/k8s/default/certificate.yaml && kubectl apply -f /berkeleytime/k8s/cert-manager/clusterissuer.yaml; do sleep 1; done;
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Ingress <

# > rook-ceph >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
# External snapshotter from source:
# git clone --single-branch --branch v3.0.0 https://github.com/kubernetes-csi/external-snapshotter.git
# kubectl apply -f external-snapshotter/client/config/crd
# kubectl apply -f external-snapshotter/deploy/kubernetes/snapshot-controller
kubectl apply -f /berkeleytime/k8s/kubernetes-csi
helm install rook-ceph rook-release/rook-ceph --namespace rook-ceph --version v1.4.7 --create-namespace
# Three lines below necessary due to race condition after rook-ceph install
kubectl wait --for condition=established --timeout 120s crd/cephfilesystems.ceph.rook.io
kubectl wait --for condition=established --timeout 120s crd/cephcluster.ceph.rook.io
kubectl wait --for condition=established --timeout 120s crd/cephblockpool.ceph.rook.io
kubectl apply -f /berkeleytime/k8s/rook-ceph/setup --recursive;
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< rook-ceph <

# > Monitoring >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
helm install bt-elasticsearch elastic/elasticsearch --version 7.9.3 -f helm/elasticsearch.yaml
helm install bt-logstash elastic/logstash -f helm/logstash.yaml --version 7.9.3
helm install bt-kibana elastic/kibana --version 7.9.3 -f helm/kibana.yaml
helm install bt-metricbeat elastic/metricbeat --version 7.9.3 -f helm/metricbeat.yaml
helm install bt-filebeat elastic/filebeat -f helm/filebeat.yaml --version 7.9.3
helm install bt-elastalert codesim/elastalert --version 1.8.1 -f helm/elastalert.yaml
helm install kubernetes-metrics-server bitnami/metrics-server --version bitnami/metrics-server --version 4.5.2
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Databases <

# > Application DB >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
helm install bt-psql-staging bitnami/postgresql-ha -f helm/postgres.yaml --version 5.2.4
helm install bt-psql-prod bitnami/postgresql-ha -f helm/postgres.yaml --version 5.2.4
helm install bt-redis-staging bitnami/redis -f helm/redis.yaml --version 11.3.4
helm install bt-redis-prod bitnami/redis -f helm/redis.yaml --version 11.3.4
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Application DB <

# > Backup >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
curl -sL https://deb.nodesource.com/setup_14.x | sudo bash -
apt install -y nodejs
crontab -l | { cat; echo "0 11 * * * /usr/bin/npm --prefix /berkeleytime/backup install && /bin/node /berkeleytime/backup"; } | crontab -
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Backup <

# > Import secrets >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
gsutil cp gs://berkeleytime-218606/secrets/kubernetes-general-secrets - | kubectl create secret generic general-secrets --from-env-file /dev/stdin
kubectl create secret generic general-secrets --from-env-file=.env
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Import secrets <

# > Regular k8s apps >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
kubectl apply -f /berkeleytime/k8s/default
helm install bt-gitlab-runner gitlab/gitlab-runner -f helm/gitlab-runner.yaml --version 0.22.0
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Regular k8s apps <
