# Deployment

For the user, deployment is very straightforward. To deploy to [staging](https://staging.berkeleytime.com), simply merge your PR into master or push to master. Our GitLab instance will automatically detect changes to master, build the changes, and deploy. 

To push to [production](https://berkeleytime.com), all you need to do is click a button on the GitLab pipeline that will deploy to prod.

If you are familiar with Kubernetes, you can also check the status of the node and pods. See [Setting Up Kubernetes](https://github.com/asuc-octo/berkeleytime/wiki/Setting-Up-Kubernetes).