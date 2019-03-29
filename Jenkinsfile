pipeline {
  agent any
  stages {
    stage('Build') {
      steps {
        git(url: 'https://github.com/asuc-octo/berkeleytime', branch: 'react-temp', credentialsId: 'GitHubAcc')
        dir(path: 'berkeleytime') {
          sh 'version=$(git rev-parse --short HEAD)'
          sh 'docker build -t berkeleytime/stage:$version -f berkeleytime/Dockerfile berkeleytime'
          sh 'docker push berkeleytime/stage:$version'
        }

      }
    }
  }
}