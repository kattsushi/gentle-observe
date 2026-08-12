# Workspace Graph

The initial workspace contains one Nx project: `tools-bootstrap`. The root
declares the future workspace boundaries without creating product projects:
`apps/*`, `packages/*`, and `tools/*`.

## Shared dependency catalogs

The root `package.json` owns exact shared versions through Bun catalogs. Future
workspace packages MUST use `"effect": "catalog:"` for the default runtime
catalog, or a named reference such as `"typescript": "catalog:tooling"` in
their `dependencies` or `devDependencies`. `tools/bootstrap` uses
`"nx": "catalog:tooling"` as the policy smoke case.

The root manifest keeps its own orchestration-only dev tools directly pinned.
It is the catalog owner, not a workspace consumer; a workspace package uses a
`catalog:` reference only when it declares a dependency it consumes. Add an
exact version at the root catalog first, then regenerate and review `bun.lock`.

## Fresh-clone inspection

Use Bun 1.3.14 exactly. Install the committed dependency graph without
resolving new versions, then inspect the discovered project and its targets:

```sh
bun --version
bun install --frozen-lockfile
bun nx show projects
bun nx show project tools-bootstrap
```

The commands must report Bun `1.3.14` and the single `tools-bootstrap` project.
If frozen install fails, do not alter a pin or regenerate the lockfile as a
workaround; treat it as a reviewed dependency-resolution failure.

## Rollback

Remove the root manifests/configuration, `tools/bootstrap` metadata, and this
document together. They only define the baseline graph and do not contain
product behavior.
