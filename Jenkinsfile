pipeline {
  agent any
  stages {
    stage('Build') {
      steps {
        git(url: 'https://github.com/asuc-octo/berkeleytime', branch: 'jenkins-temp', credentialsId: 'GitHubAcc')
        dir(path: 'berkeleytime') {
          sh '''version=$(git rev-parse --short HEAD)
docker build -t berkeleytime/stage:$version -f berkeleytime/Dockerfile berkeleytime
docker push berkeleytime/stage:$version'''
        }

      }
    }
  }
}