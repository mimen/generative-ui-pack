# Vocabulary

## Canonical component ID

A stable host-neutral identifier for one portable component meaning: `record`, `metrics`, `checklist`, or `quote`.

_Avoid:_ tool name, renderer name, host action name.

## View version

The integer version of a component's resolved, display-ready data contract. Version changes track changes in accepted or rendered meaning.

_Avoid:_ package version, host contract version, schema revision.

## Resolved view

Strictly validated data that is ready to render without network access, trusted enrichment, authorization, or persistence work.

_Avoid:_ tool input, model arguments, persisted call, resolver result wrapper.

## Host binding

Metadata mapping a canonical component to a host-owned tool name, kind, schema, preview, and host-specific catalogue fields.

_Avoid:_ transport adapter, renderer, compiler output.

## Preview fixture

A stable canonical resolved view used for gallery rendering, tests, and evidence. Preview renderers remain read-only.

_Avoid:_ mock response, seed data, editable example.

## Compiler target

A deterministic transformation from checked-in portable definitions to host-specific generated files for one exact compatibility contract.

_Avoid:_ runtime plugin, installer, host fork.

## Replacement overlay

A deterministic, source-hash-guarded set of declared host file replacements. It may replace only names and paths owned by the pack and must prove that every unowned name remains present and unique.

_Avoid:_ host fork, runtime installer, broad source rewrite.

## Adapter glue

Generated host-native catalogue records that import package schemas and renderers without copying their implementations.

_Avoid:_ renderer implementation, second source, host controller.

## Compatibility manifest

The package version, generated-file format version, view versions, and exact host commits supported by each compiler target.

_Avoid:_ semver range, latest-host pointer, deployment manifest.
