# Generative UI Pack

A standalone Apache-2.0 package for portable generative-UI view schemas, stable preview fixtures, pure React renderers, semantic CSS, and deterministic host compiler contracts.

Version `0.1.0` contains four read-only components: Record, Metrics, Checklist, and Quote. OpenBot and OpenMausBot can depend on the same canonical view definitions while retaining their own transport, governance, persistence, trusted data resolution, and authorization boundaries.

## Dependency boundary

The pack owns:

- canonical component IDs and resolved-view versions;
- strict Zod schemas for display-ready data;
- stable preview fixtures;
- accessible, presentation-only React renderers;
- semantic CSS variables and compiled CSS;
- host binding metadata and deterministic compiler output;
- compatibility manifests tied to exact host revisions.

The pack deliberately does not own:

- model or tool transport;
- host component publication or grants;
- server-side data resolution;
- conversation persistence or replay;
- actions, authorization, review tokens, or trusted correlation values;
- runtime installation into an already-built host;
- npm publication.

## Install from Git

Public npm publication is intentionally disabled. Consumers pin a Git tag or commit SHA and record the resolved commit in their host manifest.

```json
{
  "dependencies": {
    "@mimen/generative-ui-pack": "github:mimen/generative-ui-pack#<tag-or-commit>"
  }
}
```

React, React DOM, and Zod are peer dependencies. The package runs no lifecycle build for consumers; release tags include `dist/*.js`, `dist/*.d.ts`, source maps, and `dist/styles.css`.

## Public subpaths

- `@mimen/generative-ui-pack/core` — IDs, versions, schemas, definitions, fixtures, and shared binding types.
- `@mimen/generative-ui-pack/react` — pure read-only React renderers.
- `@mimen/generative-ui-pack/compiler` — deterministic compiler functions and compatibility manifest types.
- `@mimen/generative-ui-pack/openbot` — OpenBot-native read-only binding metadata.
- `@mimen/generative-ui-pack/openmaus` — OpenMausBot-native read-only binding metadata.
- `@mimen/generative-ui-pack/styles.css` — compiled framework-independent CSS.

## Render a component

```tsx
import { recordPreview } from "@mimen/generative-ui-pack/core";
import { Record } from "@mimen/generative-ui-pack/react";
import "@mimen/generative-ui-pack/styles.css";

export function Preview(): React.ReactElement {
  return <Record {...recordPreview} mode="preview" />;
}
```

The renderers accept resolved, display-ready view data. They expose no buttons, inputs, event handlers, resolver ports, or dispatch ports. Preview mode is represented in the DOM with `data-gui-mode="preview"`; it does not enable interactions.

Portable view schemas remain strict. Host subpaths separately export their pinned native tool-input schemas so OpenBot's permissive input behavior and OpenMausBot's bounded input behavior can remain compatible without weakening the resolved-view boundary.

CSS defaults use zero-specificity `:where(:root)` declarations. Hosts may define `--gui-*` semantic variables before or after importing the CSS; an ordinary `:root`, application root, or theme selector wins without `!important`. No Tailwind scan or host class-name convention is required.

## Compiler library and CLI

```ts
import { compileTarget } from "@mimen/generative-ui-pack/compiler";

const output = compileTarget("openbot");
```

```bash
bun run compile --target openbot --out-dir generated
bun run src/cli.ts manifest
```

Compiler outputs are UTF-8, newline-terminated, path-sorted, key-sorted, and generated solely from checked-in definitions. The current foundation emits compatibility and binding manifests. Host replacement-patch targets can build on the same `CompileResult` contract without changing the public package boundary.

Host compatibility can be verified against a checkout or a reachable remote commit, including pinned public source blob hashes:

```bash
bun run verify:host --target openbot --checkout /path/to/openbot
bun run verify:host --target openbot --remote https://github.com/CopilotKit/openbot.git
```

The release gate checks tag/package-version identity, package archive contents, absence of install lifecycle builds, clean-consumer Git-ref installation, all public subpaths, compiled CSS, CLI execution, and both host commit identities. CI runs this gate for every `v*` tag after the standard verification job passes:

```bash
bun run verify:release --repository https://github.com/mimen/generative-ui-pack.git --tag v0.1.0
```

## Development

```bash
bun install
bun run typecheck
bun run lint
bun run test
bun run build
bun run render
```

`bun run render` writes an HTML evidence page and screenshot to:

- `evidence/component-gallery.html`
- `evidence/component-gallery.png`

`bun run check` runs the release verification bundle. Built release artifacts remain in `dist/` and are intended to be committed with a release candidate, but this repository does not publish to npm.

## Compatibility baseline

The checked-in compatibility manifest currently names:

- OpenBot: `CopilotKit/openbot@6826e11afd52f03c30af2d873203792acad95f63`
- OpenMausBot: `mimen/OpenMausBot@696ff1d5388342259379e1446b511ba82ae95afa`

A different host commit requires a new tested compatibility entry. The pack must not silently retarget an existing entry.

## License and provenance

Licensed under Apache-2.0. See `LICENSE`, `NOTICE`, and `THIRD_PARTY_LICENSES.md` for source attribution and third-party terms.
