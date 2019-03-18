pipeline {
  agent {
    docker {
      image 'tsaianson/dockerjenkinskubectlbase:latest'
    }

  }
  stages {
    stage('Build') {
      steps {
        git(url: 'https://github.com/asuc-octo/berkeleytime', branch: 'react-temp', credentialsId: 'GitHubAcc')
      }
    }
  }
}