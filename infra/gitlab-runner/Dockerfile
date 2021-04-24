FROM ubuntu:20.04
USER root
RUN apt update
RUN apt install -y curl gettext apt-transport-https ca-certificates gnupg2
RUN curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
RUN curl -s https://deb.nodesource.com/setup_16.x | bash -
RUN echo "deb https://packages.cloud.google.com/apt cloud-sdk main" > /etc/apt/sources.list.d/google-cloud-sdk.list
RUN echo "deb http://apt.kubernetes.io/ kubernetes-xenial-unstable main" > /etc/apt/sources.list.d/kubernetes.list
RUN apt update
RUN apt install -y google-cloud-sdk kubeadm nodejs
