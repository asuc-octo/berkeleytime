<!--
Title: imperative, under ~70 characters, with the ticket when there is one.
  e.g. "[BER-78] Show grade history for renamed courses"
Small PRs get reviewed; one change per PR.
-->

## What changed and why

<!-- Two to five sentences a teammate who did not write this can follow. Link the ticket / issue. -->

## How to test it

<!-- Steps, URL on the dev deployment, or the command you ran. Screenshots for UI changes (light and dark). -->

## Checklist

- [ ] `npm run check` passes locally (format, type-check, lint, unit tests, persisted-operation allowlist)
- [ ] If GraphQL operations changed: ran `npm run generate:operations` and committed the generated allowlist
- [ ] If schema or models changed: ran `npm run generate`; no files under `generated*/` were hand-edited
- [ ] Docs updated when behavior, commands, or architecture changed (`apps/docs`, `AGENTS.md`)
- [ ] I read every line of this diff, including AI-generated code, and can explain it in review
