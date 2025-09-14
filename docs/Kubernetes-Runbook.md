## Setup the cluster
TODO

## Check pod statuses
Run `kubectl get pods`.

You should see something like this:
```
NAME                                                        READY   STATUS      RESTARTS   AGE
berkeleytime-prod-67bf78cfcf-bhx7p                          1/1     Running     0          12d
berkeleytime-prod-67bf78cfcf-k5c54                          1/1     Running     0          12d
berkeleytime-prod-67bf78cfcf-mnvlz                          1/1     Running     0          12d
berkeleytime-stage-7fdf9fdb74-kgk9w                         1/1     Running     0          98m
bt-ingress-nginx-ingress-controller-5dcd55b6dc-b44nh        1/1     Running     0          4d22h
bt-ingress-nginx-ingress-default-backend-765c4c4945-tm4tl   1/1     Running     0          4d22h
bt-redis-master-0                                           1/1     Running     0          4d22h
data-update-1587891600-mx5zb                                0/1     Completed   0          3d1h
data-update-1587978000-dv2cs                                0/1     Completed   0          2d1h
data-update-1588064400-vpb94                                0/1     Completed   0          25h
data-update-1588150800-trkv2                                1/1     Running     0          79m
es-cluster-0                                                1/1     Running     0          4d22h
frontend-prod-77cfcc59b-tbrws                               1/1     Running     0          12d
frontend-stage-7f477fd58-sdsj7                              1/1     Running     0          3h29m
jenkins-dep-65857895bb-gpfd4                                2/2     Running     0          4d22h
kibana-65dcf75f6b-6x46z                                     1/1     Running     0          4d22h
```

## Getting a shell into a pod
To ssh into one of these pods, get the name of the pod. It looks like `berkeleytime-stage-7fdf9fdb74-kgk9w`. Then do

	kubectl exec -it berkeleytime-stage-7fdf9fdb74-kgk9w bash

This executes the `bash` command inside the pod. Sometimes, these pods may not have bash in which case you can try replacing it with `sh`.

This is very useful when running Django commands, since Django needs a fully set up environment to run. Once you are inside a Django pod, you can run a Django command like `python manage.py shell`. 