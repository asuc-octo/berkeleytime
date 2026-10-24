# Security

Berkeleytime handles student account data and campus data under agreements with
UC Berkeley. Please report vulnerabilities privately rather than in a public issue.

## Reporting

1. Preferred: GitHub's "Report a vulnerability" button on this repository
   (Security tab), if enabled for the repo.
2. Otherwise, contact the current Berkeleytime leads through the ASUC Office of
   the CTO (https://octo.asuc.org/). Include steps to reproduce and impact.

We aim to acknowledge reports within a few days during the semester.

## Scope notes for contributors

- The public GraphQL endpoint is a persisted-operation gateway. The threat model
  and the rules for changing it are in
  [`docs/security/public-graphql-boundary.md`](docs/security/public-graphql-boundary.md).
- Production secrets are SealedSecrets committed under `infra/*/templates/`;
  plaintext secrets never go in the repository. Local development secrets are
  generated into `.env` by `scripts/initialize-local-env.mjs`.
- Local services bind to `127.0.0.1` and require authentication; CI enforces
  this with `scripts/check-compose-network-security.mjs`.
