# Review standards

## Standard tier

Every change must satisfy all of the following:

- `bun run check` passes from a clean install.
- Public APIs contain no `any` or `unknown`, and public functions declare return types.
- Component IDs are unique and view versions are explicit.
- View schemas are strict; undeclared top-level and nested fields fail validation.
- Preview fixtures parse against their schemas and remain deterministic.
- React renderers perform no I/O and expose no host transport, persistence, resolver, or authorization concerns.
- Read-only and preview renderers contain no controls or event handlers.
- Semantic structure and visible information remain in the accessibility tree.
- Styling uses compiled CSS, `gui-` classes, and `--gui-*` semantic variables without host framework scanning.
- React, React DOM, and Zod remain peer dependencies.
- Compiler output is byte-stable for identical inputs and replaces only declared output paths.
- Compatibility entries name exact publicly fetchable host commits and hash every source file whose contract the compiler assumes.
- Host-native metadata and parameter schemas match checked-in pinned-baseline fixtures.
- Built JavaScript, declarations, source maps, and CSS match source at a release boundary.
- License and provenance notices remain present in release contents.

## Elevated tier

Claim elevated review when a change does any of the following:

- changes an existing view schema or view version;
- changes a canonical ID or host tool-name mapping;
- changes compiler output format, paths, or compatibility semantics;
- adds actions, dispatch, trusted resolution, persistence, or authorization;
- changes release, tag, or dependency delivery mechanics;
- adds a host compatibility baseline.

Elevated changes require independent shipping-boundary review and direct host verification against every affected exact commit.

## Release gate

A release candidate must be built from the exact commit tested in each supported host. `bun run verify:release --repository <git-url> --tag <tag>` must pass tag/package identity, archive contents, no-lifecycle-build Git-ref installation, public exports, CSS, CLI, and host identity checks. Tags are append-only. Public npm publication is outside the repository's release process.
