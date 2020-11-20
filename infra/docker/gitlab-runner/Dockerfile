FROM ubuntu:20.04
USER root
RUN apt update
RUN apt install -y curl gettext apt-transport-https ca-certificates gnupg2
RUN curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
RUN curl -s https://baltocdn.com/helm/signing.asc | apt-key add -
RUN echo "deb https://baltocdn.com/helm/stable/debian/ all main" > /etc/apt/sources.list.d/helm-stable-debian.list
RUN echo "deb https://packages.cloud.google.com/apt cloud-sdk main" > /etc/apt/sources.list.d/google-cloud-sdk.list
RUN echo "deb http://apt.kubernetes.io/ kubernetes-xenial-unstable main" > /etc/apt/sources.list.d/kubernetes.list
RUN apt update
RUN apt install -y google-cloud-sdk kubeadm helm
RUN helm repo add bitnami https://charts.bitnami.com/bitnami
RUN helm repo add codesim https://helm.codesim.com
RUN helm repo add elastic https://helm.elastic.co
RUN helm repo add grafana https://grafana.github.io/helm-charts
RUN helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
RUN helm repo add jetstack https://charts.jetstack.io
RUN helm repo add rook-release https://charts.rook.io/release
RUN helm repo update
