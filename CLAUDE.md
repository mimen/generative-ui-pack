# Repository instructions

## Scope

This repository owns portable resolved-view contracts and presentation for generative UI. Hosts retain transport, persistence, governance, data resolution, and authorization.

Version `0.1.x` is read-only. Do not add host actions, network calls, storage, framework-specific classes, or host imports to shared renderers.

## Engineering

- Use Bun for install, scripts, tests, and builds.
- Keep TypeScript strict. Public functions have explicit return types; public APIs do not expose `any` or `unknown`.
- React, React DOM, and Zod remain peer dependencies.
- Zod view schemas are strict and versioned. Changing accepted or rendered meaning requires a new view version.
- Preview fixtures are stable contract evidence. Change them deliberately and update their byte-stability test.
- Renderers are pure and accessible. Preserve headings, definition lists, list state, values, and attribution in the accessibility tree.
- Styles use `gui-` classes and `--gui-*` semantic variables. Do not require host Tailwind scanning.
- Compiler output is deterministic, newline-terminated, path-sorted, and generated from checked-in definitions.
- Compatibility entries identify exact publicly fetchable host commits. Never retarget an existing entry silently.
- `dist/` is a release artifact. Regenerate it with `bun run build`; do not hand-edit it.

## Verification

Run `bun run check` for typecheck, lint, tests, and build. Run `bun run render` and inspect both `evidence/component-gallery.html` and `evidence/component-gallery.png` for UI changes.

There is no npm publication workflow. Release delivery is by append-only Git tag after exact candidate-SHA host verification.
