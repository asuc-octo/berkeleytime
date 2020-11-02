pipeline {
  environment {
    BACKEND_STAGE_GCR_PATH = "gcr.io/berkeleytime-218606/berkeleytime/berkeleytimestage"
    FRONTEND_STAGE_GCR_PATH = "gcr.io/berkeleytime-218606/berkeleytime/frontendstage"
    BACKEND_PROD_GCR_PATH = "gcr.io/berkeleytime-218606/berkeleytime/berkeleytimeprod"
    FRONTEND_PROD_GCR_PATH = "gcr.io/berkeleytime-218606/berkeleytime/frontendprod"
    BACKEND_DEPLOY_STAGE_FILEPATH = "kubernetes/manifests/berkeleytime/backend-deploy-stage.yaml"
    FRONTEND_DEPLOY_STAGE_FILEPATH = "kubernetes/manifests/berkeleytime/frontend-deploy-stage.yaml"
    BACKEND_DEPLOY_PROD_FILEPATH = "kubernetes/manifests/berkeleytime/backend-deploy-prod.yaml"
    FRONTEND_DEPLOY_PROD_FILEPATH = "kubernetes/manifests/berkeleytime/frontend-deploy-prod.yaml"
    DATA_FETCH_FILEPATH = "kubernetes/manifests/berkeleytime/postgres-enrollment-fetch.yaml"
    LIMITRANGE_FILEPATH = "kubernetes/manifests/infrastructure/limitrange.yaml"
    GITHUB_URL = "https://github.com/asuc-octo/berkeleytime"
  }
  agent any
  triggers {
    pollSCM ('*/5 * * * *')
  }
  // Can be parallelized for efficiency, but complexity may not be required for our simple builds
  stages {
    stage('Build-Berkeleytime-Stage') {
      when {
        branch "master"
        anyOf {
            changeset "berkeleytime/**"
            changeset "kubernetes/**"
            changeset "Jenkinsfile"
        }
      }
      steps {
        git(url: env.GITHUB_URL, branch: env.BRANCH_NAME, credentialsId: 'GitHubAcc')
        sh 'gcloud builds submit backend --tag ${BACKEND_STAGE_GCR_PATH}:${GIT_COMMIT} --project berkeleytime-218606'
      }
    }
    stage('Build-Frontend-Stage') {
      when {
        branch "master"
        anyOf {
            changeset "frontend/**"
            changeset "kubernetes/**"
            changeset "Jenkinsfile"
        }
      }
      steps {
        git(url: env.GITHUB_URL, branch: env.BRANCH_NAME, credentialsId: 'GitHubAcc')
        sh 'gcloud builds submit frontend --tag ${FRONTEND_STAGE_GCR_PATH}:${GIT_COMMIT} --project berkeleytime-218606'
      }
    }
    stage('Deploy-Berkeleytime-Stage') {
      when {
        branch "master"
        anyOf {
            changeset "berkeleytime/**"
            changeset "kubernetes/**"
            changeset "Jenkinsfile"
        }
      }
      steps {
        git(url: env.GITHUB_URL, branch: env.BRANCH_NAME, credentialsId: 'GitHubAcc')
        sh '''sed -ri "s/image:.*/image:\\ gcr.io\\/berkeleytime-218606\\/berkeleytime\\/berkeleytimestage:${GIT_COMMIT}/g" $BACKEND_DEPLOY_STAGE_FILEPATH
cat $BACKEND_DEPLOY_STAGE_FILEPATH
echo "Applying latest backend image to staging"
kubectl get pods
kubectl apply -f $BACKEND_DEPLOY_STAGE_FILEPATH'''
      }
    }
    stage('Deploy-Frontend-Stage') {
      when {
        branch "master"
        anyOf {
            changeset "frontend/**"
            changeset "kubernetes/**"
            changeset "Jenkinsfile"
        }
      }
      steps {
        git(url: env.GITHUB_URL, branch: env.BRANCH_NAME, credentialsId: 'GitHubAcc')
        sh '''sed -ri "s/image:.*/image:\\ gcr.io\\/berkeleytime-218606\\/berkeleytime\\/frontendstage:${GIT_COMMIT}/g" $FRONTEND_DEPLOY_STAGE_FILEPATH
cat $FRONTEND_DEPLOY_STAGE_FILEPATH
echo "Applying latest frontend image to staging"
kubectl get pods
kubectl apply -f $FRONTEND_DEPLOY_STAGE_FILEPATH'''
      }
    }
    stage('Build-Berkeleytime-Prod') {
      when {
        branch "production"
        anyOf {
            changeset "berkeleytime/**"
            changeset "kubernetes/**"
            changeset "Jenkinsfile"
        }
      }
      steps {
        git(url: env.GITHUB_URL, branch: env.BRANCH_NAME, credentialsId: 'GitHubAcc')
        sh 'gcloud builds submit backend --tag ${BACKEND_PROD_GCR_PATH}:${GIT_COMMIT} --project berkeleytime-218606'
      }
    }
    stage('Build-Frontend-Prod') {
      when {
        branch "production"
        anyOf {
            changeset "frontend/**"
            changeset "kubernetes/**"
            changeset "Jenkinsfile"
        }
      }
      steps {
        git(url: env.GITHUB_URL, branch: env.BRANCH_NAME, credentialsId: 'GitHubAcc')
        sh 'gcloud builds submit frontend --tag ${FRONTEND_PROD_GCR_PATH}:${GIT_COMMIT} --project berkeleytime-218606'
      }
    }
    stage('Deploy-Frontend-Production') {
      when {
        branch "production"
        anyOf {
            changeset "frontend/**"
            changeset "kubernetes/**"
            changeset "Jenkinsfile"
        }
      }
      steps {
        git(url: env.GITHUB_URL, branch: env.BRANCH_NAME, credentialsId: 'GitHubAcc')
        sh '''sed -ri "s/image:.*/image:\\ gcr.io\\/berkeleytime-218606\\/berkeleytime\\/frontendprod:${GIT_COMMIT}/g" $FRONTEND_DEPLOY_PROD_FILEPATH
echo "Applying latest frontend image to production"
kubectl get pods
kubectl apply -f $FRONTEND_DEPLOY_PROD_FILEPATH'''
      }
    }
    stage('Deploy-Backend-Production') {
      when {
        branch "production"
        anyOf {
            changeset "berkeleytime/**"
            changeset "kubernetes/**"
            changeset "Jenkinsfile"
        }
      }
      steps {
        git(url: env.GITHUB_URL, branch: env.BRANCH_NAME, credentialsId: 'GitHubAcc')
        sh '''sed -ri "s/image:.*/image:\\ gcr.io\\/berkeleytime-218606\\/berkeleytime\\/berkeleytimeprod:${GIT_COMMIT}/g" $BACKEND_DEPLOY_PROD_FILEPATH
echo "Applying latest backend image to production"
kubectl get pods
kubectl apply -f $BACKEND_DEPLOY_PROD_FILEPATH'''
      }
    }
    stage('Build-Sphinx-Docs') {
      when {
        branch "master"
        anyOf {
            changeset "berkeleytime/**"
            changeset "Jenkinsfile"
        }
      }
      steps {
        git(url: env.GITHUB_URL, branch: env.BRANCH_NAME, credentialsId: 'GitHubAcc')
        sh '''containerID=$(docker run -d -e ENVIRONMENT_NAME=LOCALHOST --entrypoint sleep ${BACKEND_STAGE_GCR_PATH}:${GIT_COMMIT} 1000)
docker cp /var/jenkins_home/workspace/berkeleytime_master $containerID:/bt
docker exec $containerID sphinx-build -b html /bt /sphinxout
rm -rf /var/jenkins_home/userContent/sphinx
docker cp $containerID:/sphinxout /var/jenkins_home/userContent/sphinx
docker kill $containerID'''
      }
    }
    stage('Update-Data-Fetch-Image-Version') {
      when {
        branch "production"
        anyOf {
            changeset "berkeleytime/**"
            changeset "kubernetes/**"
            changeset "Jenkinsfile"
        }
      }
      steps {
        git(url: env.GITHUB_URL, branch: env.BRANCH_NAME, credentialsId: 'GitHubAcc')
        sh '''sed -ri "s/image:.*/image:\\ gcr.io\\/berkeleytime-218606\\/berkeleytime\\/berkeleytimeprod:${GIT_COMMIT}/g" $DATA_FETCH_FILEPATH
echo "Updating enrollment data fetch cron job with latest image"
kubectl get pods
kubectl delete -f $DATA_FETCH_FILEPATH
kubectl apply -f $DATA_FETCH_FILEPATH'''
      }
    }
    stage('k8s Clean Up Tasks') {
      when {
        branch "master"
      }
      steps {
        sh '''kubectl get pods | grep Evicted | awk '{print $1}' | xargs kubectl delete pod || true
kubectl apply -f $LIMITRANGE_FILEPATH'''
      }
    }
  }
}
