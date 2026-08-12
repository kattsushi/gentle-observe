# Design: Bootstrap Workspace Toolchain

## Technical Approach

Ship an Nx workspace whose only initial project is `tools/bootstrap`. `./scripts/bootstrap` validates the host and exact Bun binary; a Bun/TypeScript orchestrator performs frozen install, explicit tsgo preparation, ordered Nx checks, and atomic reporting. No product/TUI dependencies are added.

## Compatibility Matrix (verified 2026-08-12)

| Component | Exact pin | Decision/source |
|---|---:|---|
| Bun / types | 1.3.14 | GitHub latest release and npm `bun-types` |
| Nx | 23.1.1 | npm `latest`; no `@nx/*` plugin required |
| TypeScript (native TS7) | 7.0.2 | npm `latest`; Microsoft TS-Go release |
| Effect | 4.0.0-rc.108 | npm `rc`; future first-party Effect packages MUST use the same RC |
| `@effect/tsgo` | 0.36.4 | npm `latest`; upstream map pins TS 7.0.2 |
| Biome formatter | 2.5.8 | npm `latest`; format only |
| Oxlint / tsgolint | 1.78.0 / 7.0.2001 | tsgo upstream map; syntax lint only, no Effect plugin |
| Test runner | Bun 1.3.14 | Built-in `bun test`; no Vitest/plugin |

Sources: npm metadata; Bun lifecycle/install docs; Nx package-json/project-linking docs; Effect migration and tsgo README/upstream map; Microsoft TS-Go `typescript/v7.0.2` release. Manifests and `bun.lock` are authoritative. `@opentui/solid@0.5.2` peers on `solid-js@1.9.12` while latest Solid is 1.9.14; neither is added. The next change must pin 1.9.12 or revalidate.

## Architecture Decisions

| Choice | Rejected | Rationale |
|---|---|---|
| Bun workspace object with `packages: ["apps/*", "packages/*", "tools/*"]`, default runtime catalog, named tooling/quality catalogs, Nx package-json discovery, and root-private manifest plus `tools/bootstrap` project | Flat workspace array; duplicated dependency versions in each package; integrated scaffold; root project only | Bun catalogs centralize exact shared versions. The root owns orchestration-only dev tools as directly pinned dependencies; workspace consumers reference shared entries with `catalog:` or `catalog:<name>`. This preserves exact pins and Nx/Bun package discovery without creating product projects. |
| Nx scripts as targets with cached `format`, `lint`, `typecheck`, `diagnostics`, `test`; aggregate is uncached | Nx plugins/inferred executors | No generator/runtime dependency; explicit commands are inspectable. |
| Biome check-format; Oxlint syntax lint; TS7 typecheck; dedicated `effect-tsgo diagnostics` | ESLint, Biome lint, parallel tsgo servers | One owner per diagnostic class. Effect-tsgo is the sole TS server; separate diagnostics avoid duplicate Effect output. |
| Bootstrap validates Bun; it never installs it | Remote install script | A program cannot securely install its own prerequisite while preserving exact provenance. |
| `trustedDependencies: ["nx"]`; frozen install; explicit idempotent `effect-tsgo patch` after install | Default trust list; all scripts blocked | Only Nx's published postinstall runs. Tsgo mutation is named, version-checked, and not an implicit lifecycle script. |

## Command, Data Flow, and Contracts

`./scripts/bootstrap [--offline] [--report PATH]` → host/Bun check → `bun install --frozen-lockfile` (`--offline` when requested) → verify lock hash and resolved pins → explicit tsgo patch → `bun nx run tools-bootstrap:check` → human summary + atomic JSON.

Default report is gitignored `.artifacts/bootstrap/report.json` (replace-on-run; CI artifact; never committed). Schema `gentle-observe.bootstrap-report/v1`: timestamps, `platform {os,arch}`, `offline`, `versions`, `lockfile {sha256,unchanged}`, ordered `checks[{name,status,durationMs,exitCode}]`, `result`, and optional sanitized `failure {stage,code,message}`. Exit codes: 0 success; 2 prerequisite/platform; 3 pin/lock; 4 install/network/cache; 5 check; 70 internal. Offline cache miss is code 4, never fallback.

## File and Dependency Changes

Create `package.json`, `bun.lock`, `bunfig.toml`, `nx.json`, `tsconfig.base.json`, `biome.json`, `.oxlintrc.json`, `scripts/bootstrap`, `tools/bootstrap/{package.json,tsconfig.json,src/bootstrap.ts,src/report.ts,src/report.test.ts}`, and `.github/workflows/toolchain.yml`; modify `.gitignore` and `openspec/config.yaml`. The root catalog owns exact shared runtime/tooling/quality versions; root-only orchestration tooling remains directly pinned, while workspace package consumers use `catalog:` or `catalog:<name>`. Dependency direction is root tooling → bootstrap project; future `apps/*` may depend on `packages/*`, never on bootstrap.

## Testing and CI

A fixed-input unit fixture asserts report schema, order, sanitization, and failure mapping without clock/network/product code. RED integration cases cover wrong Bun, changed lockfile, offline miss, failed target, rerun/no diff, and atomic replacement. CI pins `actions/checkout@08c6903…` and `oven-sh/setup-bun@735343b…`, uses Bun 1.3.14 on `ubuntu-latest` + `macos-latest`, runs twice, checks `git diff --exit-code -- bun.lock`, and uploads reports. No branch mutation.

## Threat Matrix

| Boundary | Applicability / safe-failure / RED proof |
|---|---|
| Documentation-like paths | Applicable: execute only fixed `scripts/bootstrap` and fixed argv; never classify discovered files. Reject injected path/argv; test `README.sh`, executable MD/MDX, `requirements.txt`, `CMakeLists.txt`. |
| Git repository selection | N/A: no Git subprocess or repository selector. |
| Commit state | N/A: no commit/index operation. |
| Push state | N/A: no push operation. |
| PR commands | N/A: no PR automation. |

## Work Units, Rollback, and Handoff

1. **Reproducible graph**: exact pins, Bun catalogs, lock, and project discovery; verify catalog resolution/versions/graph; rollback manifests/config.
2. **Deterministic feedback loop**: quality targets plus fixture; verify each and aggregate; rollback target/tool files.
3. **Safe one-command bootstrap**: lifecycle policy, failures, report/idempotency tests; rollback bootstrap/report boundary.
4. **Native evidence and TDD handoff**: CI proof, then set `testing.strict_tdd: true`, runner `bun nx run tools-bootstrap:test`, quality flags/commands, and apply/verify commands in `openspec/config.yaml`; persist updated testing capabilities. Rollback workflow/config update only.

Estimated authored change: **620–780 lines**, near the 800-line budget; `ask-on-risk` requires a slicing decision if tasks forecast >800. Failure rollback removes only the incomplete work unit; no migrations. Rejected: scaffolding product placeholders, adding Solid/OpenTUI, committed reports, mutable installs, silent version fallback, Vitest, and duplicated Effect diagnostics.

## Open Questions

None; apply must re-check metadata after 2026-08-12, but may not change pins without design review.
