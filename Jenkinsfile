pipeline {
	agent any
	stages {
		stage('Build') {
			steps {
				git(url: 'https://github.com/asuc-octo/berkeleytime', branch: 'jenkins-temp', credentialsId: 'GitHubAcc')
				dir(path: 'berkeleytime') {
					sh '''version=$(git rev-parse --short HEAD)
'''
					script {
	                    def stagingImage = docker.build("berkeleytime/stage:${version}", "-f berkeleytime/Dockerfile", "berkeleytime")
						stagingImage.push()
	                }
				}
			}
		}
	}
}