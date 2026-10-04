---
deployment_status: none
deployment_last_assessed: 2026-10-03
deployment_targets:
  - component: view-contracts
    where: none
    detail: Library distributed through pinned Git tags or commit SHAs; no npm publication.
  - component: react-renderers
    where: none
    detail: Library distributed through pinned Git tags or commit SHAs; no standalone hosted UI.
  - component: compiler
    where: none
    detail: Compiler library and CLI included in Git releases; no hosted service.
  - component: host-bindings
    where: none
    detail: Library subpaths included in Git releases; consumers own host deployment.
---

# Deployment

The view contracts ship as a library through pinned Git tags or commit SHAs. Releases include built `dist/` artifacts, and npm publication is explicitly disabled.

The React renderers ship in the same Git release. Consuming applications render them and own their deployment.

The compiler ships as library exports and a CLI in the Git release. The README documents `bun run verify:release` for checking release contents and consumer installation.

The host bindings ship as package subpaths for OpenBot and OpenMausBot. This repository does not install or deploy those hosts.
