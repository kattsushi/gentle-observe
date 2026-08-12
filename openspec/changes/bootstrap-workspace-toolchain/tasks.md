# Tasks: Bootstrap Workspace Toolchain

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | 740–860 authored additions + deletions |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 → PR 4; work-unit commits |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

The estimate can exceed 800; choose a chain strategy before apply. Check `git diff --stat` after each unit and re-slice before 800.

### Suggested Work Units

| Unit | Start → finished outcome | Verification category / command | Runtime harness | Rollback boundary |
|---|---|---|---|---|
| 1 | Empty root → exact catalog-backed Nx/Bun graph | graph: `bun nx show projects` | frozen install + catalog resolution | manifests/config + tool manifest |
| 2 | Graph → deterministic quality loop | `bun nx run tools-bootstrap:check` | repeat test target | targets + source/tests |
| 3 | Quality → safe bootstrap/report | integration: `bun test tools/bootstrap/src/report.test.ts` | `./scripts/bootstrap --report .artifacts/bootstrap/report.json` | script/report files + `.gitignore` |
| 4 | Local proof → CI/TDD handoff | CI: matrix + test target | Linux/macOS bootstrap twice | workflow + `openspec/config.yaml` |

## Work Unit 1: Reproducible workspace graph

**Outcome:** exact catalog-backed, inspectable `tools/bootstrap` Nx project; no product code.

**Human-review correction (tuicr, `package.json:8`):** Adopt official Bun workspace catalogs to centralize exact shared dependency versions. Root-only orchestration tooling remains directly pinned; workspace consumers use `catalog:` or `catalog:<name>`.

- [x] 1.1 Create root manifests/config and `tools/bootstrap/{package.json,tsconfig.json}` with exact pins, official Bun catalogs, catalog-backed workspace consumption, `trustedDependencies:["nx"]`, and graph targets.
- [x] 1.2 Generate/review `bun.lock`, including catalog definitions and resolved versions; block TS7/tsgo/Effect pin or lock incompatibility—never substitute versions.
- [x] 1.3 Document graph and catalog commands; prove frozen install, catalog/pin resolution, and `bun nx show projects`.

## Work Unit 2: Deterministic quality and test feedback loop

**Outcome:** aggregate runs format, Oxlint, TS7, Effect diagnostics, and Bun tests. Depends on Unit 1.

- [ ] 2.1 RED: test ordered checks, schema, sanitization, and failure mapping in `report.test.ts`; GREEN: implement `src/report.ts`.
- [ ] 2.2 Implement `src/bootstrap.ts` targets and uncached `check`; name and fail nonzero on an isolated target failure.
- [ ] 2.3 Document commands; prove targets and two identical `bun nx run tools-bootstrap:test` runs.

## Work Unit 3: Safe one-command bootstrap and structured reporting

**Outcome:** bootstrap safely installs/checks and atomically writes v1 JSON. Depends on Unit 2.

- [ ] 3.1 RED: wrong Bun (2), changed lock/pin (3), offline miss (4), failed target (5), rerun/no diff, atomic replacement, and sanitized failures.
- [ ] 3.2 RED: reject `README.sh`, executable MD/MDX, `requirements.txt`, and `CMakeLists.txt`; use fixed bootstrap argv only.
- [ ] 3.3 Implement host/Bun validation, frozen/offline install, idempotent `effect-tsgo patch`, lock hash, exits, and atomic report; gitignore `.artifacts/`, document fresh clone/offline.

## Work Unit 4: Native CI evidence and Strict TDD activation

**Outcome:** Linux/macOS CI publishes reports; post-proof work uses Strict TDD. Depends on Unit 3.

- [ ] 4.1 Create CI with SHA-pinned checkout/setup-bun, Bun 1.3.14 Linux/macOS, two bootstraps, unchanged lockfile, and uploaded reports.
- [ ] 4.2 After matrix proof, update `openspec/config.yaml`: capabilities, runner `bun nx run tools-bootstrap:test`, quality/apply/verify commands, and `strict_tdd: true`.
- [ ] 4.3 Document maintenance, clone evidence, and rollbacks; confirm no reports, product scope, or approved-document edits.
