pipeline {
  environment {
    BACKEND_GCR_PATH = "gcr.io/berkeleytime-218606/berkeleytime/berkeleytimestage"
    FRONTEND_GCR_PATH = "gcr.io/berkeleytime-218606/berkeleytime/frontendstage"
    BACKEND_DEPLOY_STAGE_FILEPATH = "kubernetes/manifests/berkeleytime/backend-deploy-stage.yaml"
    FRONTEND_DEPLOY_STAGE_FILEPATH = "kubernetes/manifests/berkeleytime/frontend-deploy-stage.yaml"
  }
  agent any
  triggers {
    pollSCM ('*/5 * * * *')
  }
  stages {
    stage('Build-Berkeleytime-Stage') {
      when {
        changeset "berkeleytime/**"
        branch "master"
      }
      steps {
        git(url: 'https://github.com/asuc-octo/berkeleytime', branch: env.BRANCH_NAME, credentialsId: 'GitHubAcc')
        sh '''version=$(git rev-parse --short HEAD)
docker build -t ${BACKEND_GCR_PATH}:$version -f berkeleytime/Dockerfile berkeleytime
docker push ${BACKEND_GCR_PATH}:$version'''
      }
    }
    stage('Build-Frontend-Stage') {
      when {
        changeset "frontend/**"
        branch "master"
      }
      steps {
        git(url: 'https://github.com/asuc-octo/berkeleytime', branch: env.BRANCH_NAME, credentialsId: 'GitHubAcc')
        sh '''version=$(git rev-parse --short HEAD)
docker build -t ${FRONTEND_GCR_PATH}:$version -f frontend/Dockerfile frontend
docker push ${FRONTEND_GCR_PATH}:$version'''
      }
    }
    stage('Deploy-Berkeleytime-Stage') {
      when {
        changeset "berkeleytime/**"
        branch "master"
      }
      steps {
        git(url: 'https://github.com/asuc-octo/berkeleytime', branch: env.BRANCH_NAME, credentialsId: 'GitHubAcc')
        sh '''version=$(git rev-parse --short HEAD)
sed -ri "s/image:.*/image:\\ gcr.io\\/berkeleytime-218606\\/berkeleytime\\/berkeleytimestage:$version/g" $BACKEND_DEPLOY_STAGE_FILEPATH
cat $BACKEND_DEPLOY_STAGE_FILEPATH
kubectl get pods
kubectl delete -f $BACKEND_DEPLOY_STAGE_FILEPATH
kubectl apply -f $BACKEND_DEPLOY_STAGE_FILEPATH
kubectl get pods'''
      }
    }
    stage('Deploy-Frontend-Stage') {
      when {
        changeset "frontend/**"
        branch "master"
      }
      steps {
        git(url: 'https://github.com/asuc-octo/berkeleytime', branch: env.BRANCH_NAME, credentialsId: 'GitHubAcc')
        sh '''version=$(git rev-parse --short HEAD)
sed -ri "s/image:.*/image:\\ gcr.io\\/berkeleytime-218606\\/berkeleytime\\/frontendstage:$version/g" $FRONTEND_DEPLOY_STAGE_FILEPATH
cat $FRONTEND_DEPLOY_STAGE_FILEPATH
kubectl get pods
kubectl delete -f $FRONTEND_DEPLOY_STAGE_FILEPATH
kubectl apply -f $FRONTEND_DEPLOY_STAGE_FILEPATH
kubectl get pods'''
      }
    }
  }
}
