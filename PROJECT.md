---
repo_key: generative-ui-pack
aliases: []
---

# generative-ui-pack

A portable package of read-only generative UI contracts and React renderers for Record, Metrics, Checklist, and Quote views. OpenBot and OpenMausBot consume the package while retaining their own transport, persistence, data resolution, and authorization. A deterministic compiler produces host bindings and compatibility artifacts.

## Components

| Component | Path | What it is | Surfaces | Stack |
|---|---|---|---|---|
| view-contracts | `src/core/` | Versioned Zod schemas, component definitions, preview fixtures, and shared types exported through the core subpath. | library | ts, zod, bun |
| react-renderers | `src/react/` | Pure, accessible React presentation and semantic CSS for resolved view data. | library | ts, react, bun |
| compiler | `src/compiler/`, `src/cli.ts` | Compiler library and Bun CLI for deterministic manifests, host overlays, and compatibility verification. | library, cli-tui | ts, bun |
| host-bindings | `src/openbot/`, `src/openmaus/` | Host-specific tool-input schemas and read-only binding metadata exported through separate package subpaths. | library | ts, zod, bun |

## How they relate

Core definitions provide the contracts used by renderers, host bindings, and compiler output. Hosts resolve data before passing it to renderers. The CLI invokes the compiler library. Root build scripts generate the checked-in `dist/` release artifacts, and verification scripts and tests exercise package and host compatibility.

## Repo-level limits

The package has no standalone application or hosted backend. It distributes releases through pinned Git tags rather than npm publication. Build, render, and host-verification scripts support the package components rather than defining additional products.
