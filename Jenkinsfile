pipeline {
  agent any
  triggers {
    pollSCM ('*/5 * * * *')
  }
  stages {
    stage('Build-Berkeleytime-Stage') {
      when {
        changeset "berkeleytime/**"
      }
      steps {
        git(url: 'https://github.com/asuc-octo/berkeleytime', branch: 'react-temp', credentialsId: 'GitHubAcc')
        sh '''version=$(git rev-parse --short HEAD)
docker build -t berkeleytime/berkeleytimestage:$version -f berkeleytime/Dockerfile berkeleytime
docker push berkeleytime/berkeleytimestage:$version'''
      }
    }
    stage('Build-Frontend-Stage') {
      when {
        changeset "frontend/**"
      }
      steps {
        git(url: 'https://github.com/asuc-octo/berkeleytime', branch: 'react-temp', credentialsId: 'GitHubAcc')
        sh '''version=$(git rev-parse --short HEAD)
docker build -t berkeleytime/frontendstage:$version -f frontend/Dockerfile frontend
docker push berkeleytime/frontendstage:$version'''
      }
    }
    stage('Deploy-Berkeleytime-Stage') {
      when {
        changeset "berkeleytime/**"
      }
      steps {
        git(url: 'https://github.com/asuc-octo/berkeleytime', branch: 'react-temp', credentialsId: 'GitHubAcc')
        sh '''version=$(git rev-parse --short HEAD)
sed -ri "s/image:.*/image: index.docker.io\/berkeleytime\/berkeleytimestage:$version/g" kubernetes/manifests/berkeleytime/backend-deploy-stage.yaml
kubectl get pods'''
      }
    }
    stage('Deploy-Frontend-Stage') {
      when {
        changeset "frontend/**"
      }
      steps {
        git(url: 'https://github.com/asuc-octo/berkeleytime', branch: 'react-temp', credentialsId: 'GitHubAcc')
        sh '''version=$(git rev-parse --short HEAD)
sed -ri "s/image:.*/image: index.docker.io\/berkeleytime\/frontendstage:$version/g" kubernetes/manifests/berkeleytime/frontend-deploy-stage.yaml
kubectl get pods'''
      }
    }
  }
  environment {
    registryCredential = 'DockerHubAcc'
  }
}