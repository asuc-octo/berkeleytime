# DNS & TLS Certificates

<!-- toc -->

## Introduction
### What is the Domain Name System (DNS)?

The DNS is a system used across to internet to associate domains, such as `berkeleytime.com`, with IP addresses, such as `123.123.123.123`. Internet browsers use the DNS protocol to translate common domains to IP addresses to know where to route packets.

UC Berkeley classes that cover how a DNS work include:
- [CS 168 (Internet Architecture)](https://www2.eecs.berkeley.edu/Courses/CS168/)
- [CS 161 (Computer Security)](https://www2.eecs.berkeley.edu/Courses/CS161/)

Learn more about DNSs:
- [CS 168 Textbook - DNS](https://textbook.cs168.io/applications/dns.html)
- [What is DNS? | How DNS works](https://www.cloudflare.com/learning/dns/what-is-dns/)

### What are TLS Certificates?

A TLS Certificate secures connections between internet browsers and web servers by authenticating web servers, exchanging keys to encrypt data packets, and providing integrity guarantees over the connection. Connections to websites secured with TLS certificates typically use HTTPS instead of HTTP.

UC Berkeley classes that cover how TLS Certificates work include:
- [CS 161 (Computer Security)](https://www2.eecs.berkeley.edu/Courses/CS161/)
- [CS 168 (Internet Architecture)](https://www2.eecs.berkeley.edu/Courses/CS168/)

Learn more about SSL/TLS (SSL is the predecessor to TLS):
- [What is an SSL Certificate?](https://www.cloudflare.com/learning/ssl/what-is-an-ssl-certificate/)
- [What is SSL? | SSL definition](https://www.cloudflare.com/learning/ssl/what-is-ssl/)

## Our Cloudflare DNS Setup

For the most relevant setup documentation, refer to [Cloudflare's DNS Setup Docs](https://developers.cloudflare.com/dns/).

We pay for the domains `berkeleytime.com` and `stanfurdtime.com`, both registered with [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/). In addition, our authoritative DNS is also Cloudlfare, and its configuration (what domains map to what IPs) can be changed on [the Cloudflare Developer Dashboard](https://dash.cloudflare.com/).

## Our Kubernetes Cluster Setup

There are two relevant Kubernetes components when discussing DNS and Certificates: our reverse proxy `ingress-nginx` and `cert-manager`.

### Ingress Nginx

Recall from [An HTTP Request's Life](./onboarding.md#an-http-requests-life), `ingress-nginx` is our reverse proxy responsible for routing between our application services. Its input is effectively a mapping from a path to a service. This is down through the [Ingress Resource](https://kubernetes.io/docs/concepts/services-networking/ingress/):

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
    # ...
spec:
  ingressClassName: nginx
  tls:
    # ...
  rules:
    - host: berkeleytime.com
      http:
        paths:
          - path: /
            backend:
              service:
                name: bt-frontend-svc
          - path: /api
            backend:
              service:
                name: bt-backend-svc
```

This example `Ingress` resource maps packets routed to `berkeleytime.com/` to the frontend service and maps packets routed to `berkeleytime.com/api` to the backend service.

The `ingressClassName` instructs `ingress-nginx` to manage this `Ingress` resource as one of its reverse proxy destinations.


### Certificate Manager

`cert-manager` is a service that can automatically issue and renew certificates. We only use it to renew certificates. We hardcode a certificate with all domains needed instead of automatic issuing.

```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: bt-cert
spec:
  secretName: bt-cert
  dnsNames:
    - berkeleytime.com
    - "*.berkeleytime.com"
    - "*.dev.berkeleytime.com"
    - stanfurdtime.com
    - "*.stanfurdtime.com"
    - "*.dev.stanfurdtime.com"
```

Here is a snippet of the hardcoded certificate deployed as of August 2025. This is linked in the `Ingress` resource earlier under `spec.tls`.
