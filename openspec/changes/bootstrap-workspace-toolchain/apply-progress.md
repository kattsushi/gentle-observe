# Apply Progress: Bootstrap Workspace Toolchain

## Work Unit 1: Reproducible workspace graph

**Mode:** Standard (Strict TDD is disabled for this bootstrap change.)
**Delivery:** `exception-ok`; maintainer-approved `size:exception`.
**Native runtime authority:** acquire state `proceed`; settlement remains with parent.

### Completed Tasks

- [x] 1.1 Root Bun/Nx manifests, workspace globs, exact catalogs, and bootstrap project metadata.
- [x] 1.2 Reviewed `bun.lock` generated from the exact compatibility matrix, including catalog definitions and resolved versions, without substitutions.
- [x] 1.3 Documented fresh-clone graph and catalog inspection and proved frozen install, catalog/pin resolution, and discovery.

### Human-Review Correction

tuicr requested centralized cross-package dependency management at
`package.json:8`. The approved correction adopts official Bun workspace
catalogs without reopening Work Unit 1: the root workspace now has exact
default runtime and named tooling/quality catalogs; root-only orchestration
tools remain directly exact-pinned because the root owns those entries; and
`tools/bootstrap` consumes `nx` as `catalog:tooling` to prove the policy. No
product dependency was added solely for demonstration.

The design, specification, task checklist, lockfile, and graph documentation
were reconciled so catalog-backed consumption is an observable requirement.

### Exact Files

- `.gitignore`
- `package.json`
- `bun.lock`
- `bunfig.toml`
- `nx.json`
- `tsconfig.base.json`
- `tools/bootstrap/package.json`
- `tools/bootstrap/tsconfig.json`
- `docs/development/workspace-graph.md`
- `openspec/changes/bootstrap-workspace-toolchain/design.md`
- `openspec/changes/bootstrap-workspace-toolchain/specs/workspace-toolchain/spec.md`
- `openspec/changes/bootstrap-workspace-toolchain/tasks.md`
- `openspec/changes/bootstrap-workspace-toolchain/apply-progress.md`

### Work Unit Evidence

| Evidence | Exact result |
|---|---|
| Focused verification | `/tmp/gentle-observe-bun-1.3.14/bun-linux-x64/bun install --frozen-lockfile` exited `0`; checked `149` installs across `210` packages with no changes. A second frozen install produced the same lock SHA-256 before/after: `473e6b063ab1068ddb3eecdb07d332d4ad208d63e9baf15a6dbb42798794ad5d`. |
| Exact pin and catalog validation | Bun 1.3.14 evaluated the root/default and named catalogs, `tools/bootstrap` `nx: catalog:tooling`, and `bun.lock` catalog/catalogs sections; it exited `0` with `catalog policy: exact root catalog + named catalogs; tools-bootstrap nx=catalog:tooling; lockfile records both catalog sections`. |
| Graph inspection | `/tmp/gentle-observe-bun-1.3.14/bun-linux-x64/bun nx show projects --json` exited `0` and returned `["tools-bootstrap"]`; `nx show project tools-bootstrap --json` reported root `tools/bootstrap` and target `graph`. |
| Runtime harness | Frozen install plus Nx graph discovery is the runtime integration boundary for this graph-only unit; both commands exited `0`. No bootstrap command, quality loop, report, or CI behavior was implemented. |
| Rollback boundary | Revert the root manifests/configuration and `bun.lock`, `tools/bootstrap/package.json`, graph documentation, and this unit's SDD artifacts. This removes only catalog-backed workspace discovery and dependency graph behavior. |

### Compatibility Review

- The root catalog records `effect@4.0.0-rc.108`; named `tooling` records `bun-types@1.3.14`, `nx@23.1.1`, and `typescript@7.0.2`; named `quality` records `@biomejs/biome@2.5.8`, `@effect/tsgo@0.36.4`, and `oxlint@1.78.0`. `bun.lock` preserves the catalog definitions and resolved exact versions.
- No fallback version was selected. `tsgolint@7.0.2001` is not published in npm; it was intentionally left out because the design forbids substituting incompatible tooling. Its later diagnostics target remains a blocked design dependency until the approved source is clarified.

### Scope and Delivery

- Human-review correction delta: 122 authored additions + deletions (97 additions, 25 deletions) across implementation and directly affected SDD artifacts; 60 lines are implementation/lockfile changes. This is within the 140-line correction budget and excludes the pre-existing staged baseline.
- No product apps, UI/domain/connectors, bootstrap/report behavior, quality/test loop, CI, `.repos/`, branch, remote, PRD, research, or wireframes were modified.
- No commit or push was performed. Existing baseline files remain staged; the catalog correction remains unstaged/untracked with the Work Unit 1 candidate.

### Remaining Tasks

- [ ] 2.1–2.3 Deterministic quality and test feedback loop.
- [ ] 3.1–3.3 Safe one-command bootstrap and structured reporting.
- [ ] 4.1–4.3 Native CI evidence and Strict TDD activation.
