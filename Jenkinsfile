pipeline {
  agent any
  triggers {
    pollSCM ('*/5 * * * *')
  }
  stages {
    stage('Build-Berkeleytime') {
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
    stage('Build-Frontend') {
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
  }
  environment {
    registryCredential = 'DockerHubAcc'
  }
}