# Playbook

### Prereqs
Make sure you have a fresh cluster, `kubectl` installed with permissions to that cluster,
and `helm` version 3.0+.

### Helm
Use helm to install the ingress and redis.

    helm install bt-redis stable/redis -f infrastructure/redis.yaml
    helm install helm install bt-ingress stable/nginx-ingress -f nginx-controller.yaml
    
### Cert Manager
Once the ingress is install use `kubectl get svc` and grab the externalIP of the ingress.
Set the berkeleytime.com DNS A record to point to that IP.

Follow `USAGE.md` in `tls` to set up the cert manager and sign the ingress. Recommend using the helm option.
Wait for LetsEncrypt to sign the production certificate. 

### Setting Up Infra
Now is a good time to set up rest of the infra and configs.

    kubectl apply -f configs/
    kubectl apply -f infrastructure/jenkins-pv.yaml
    kubectl apply -f infrastructure/jenkins-deploy.yaml
    kubectl apply -f infrastructure/es-deploy.yaml
    kubectl apply -f infrastructure/kibana-deploy.yaml

### Set Up Jenkins
For this step, you need the Github account information for `octo-berkeleytime`, its personal access token,
and a service account key file with the correct permissions.

At the time of writing, the login information for GitHub is

    U: octo-berkeleytime
    P: ***REMOVED***
    
Log into Github and create a personal access token in developer settings, or reuse
and existing one.

For the Google SA Key File, in the Google Cloud Console head to IAM and then to Service Accounts.
Pick out the Jenkins service account and create a new key for it in json form.
Download that key and note the email of the SA.

Now `kubectl exec -it <prod-id> bash` into the Jenkins container. Save the keyfile somewhere
and authenticate with gcloud. Then, use gcloud to authenticate kubectl and docker.

    apt-get update && apt-get install vim
    vim google-sa.json # paste contents of the key file here
    
    # replace with your own SA email, if different
    gcloud auth activate-service-account jenkins@berkeleytime-218606.iam.gserviceaccount.com --key-file google-sa.json
    
    # replace with your own cluster ID, if different.
    gcloud container clusters get-credentials bt-prod --zone us-west2-a --project berkeleytime-218606
    
    gcloud auth configure-docker
    
Now push a change to both the frontend and backend folder. Then watch the pipeline run!