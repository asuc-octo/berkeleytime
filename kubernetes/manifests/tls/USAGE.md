Follow the guide here:

https://cert-manager.io/docs

A) Install cert-manager: https://cert-manager.io/docs/installation/kubernetes/

   Note: this is installed with Helm

B) Use the ACME ClusterIssuer: https://cert-manager.io/docs/configuration/acme/


    kubectl apply -f prod-issuer.yaml
    kubectl apply -f stage-issuer.yaml

C) Secure the ingress: https://cert-manager.io/docs/usage/ingress/


    kubectl apply -f ../infrastructure/ingress.yaml
    
And then wait for LetsEncrypt to sign the certificate. Keep checking
`kubectl get cert` to see the status of the certificate.

