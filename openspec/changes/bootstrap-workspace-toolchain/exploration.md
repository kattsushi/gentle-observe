# Exploration: Nx-first workspace toolchain

## Decision

Use one root Nx project for the initial Bun workspace. Nx owns quality target
selection, execution, failure attribution, and caching. Root scripts are thin
Nx entry points. The aggregate currently covers Oxfmt formatting and Oxlint
linting only.

## Current baseline

- Exact Bun, Nx, TypeScript 7, Effect 4 RC, Oxfmt, Oxlint, and
  `oxlint-tsgolint` versions are locked in the root catalog and `bun.lock`.
- The root is the only discovered Nx project; it has no product source,
  TypeScript project, Effect diagnostic input, or durable test-bearing project.
- Oxfmt check mode and Oxlint are independent Nx targets. `check` invokes them
  with `nx run-many`. `.atl/` is versioned registry state and the only Oxfmt
  exclusion.
- No root `typecheck`, `diagnostics`, or `test` target exists. A later project
  must own real targets before they can join local aggregates or CI selection.

## Follow-on work units

1. **Workspace graph baseline** — preserve exact pins, catalog policy, root
   project discovery, and local Nx quality targets.
2. **Nx-first quality loop** — retain direct Oxfmt/Oxlint targets, native Nx
   cache behavior, and check-only formatting proof; remove vacuous zero-input
   quality targets.
3. **Narrow host bootstrap** — add only exact Bun validation, frozen or offline
   installation, justified preparation, and invocation of root Nx checks.
4. **Official Nx CI selection** — use `nrwl/nx-set-shas` followed by
   `nx affected`. Nx Cloud is optional and is not configured. Add typecheck,
   diagnostics, or test only when discovered projects provide real targets.

## Testing policy

Strict TDD remains disabled. A future durable project must first demonstrate a
non-vacuous typecheck, diagnostics, or test target before adding that target to
the aggregate or affected selection. The current baseline does not treat a
zero-input exit as quality or test evidence.

## Constraints

- Preserve the pre-SDD product documents and do not add product code.
- Do not modify `.repos`, remotes, branches, CI YAML, or Nx Cloud settings in
  this work unit.
- Nx may schedule targets in parallel; documentation must not promise an
  independent execution order.
