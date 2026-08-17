# Apply Progress: Bootstrap Workspace Toolchain

## Authority and delivery

- **Canonical baseline:** `master` merge commit
  `523e3435ecd878a0026e17bbe63ebeac02fcd9f8` (PR #12).
- **Work unit:** `bootstrap-workspace-closure-reconciliation`.
- **Delivery:** maintainer-approved `exception-ok / size:exception`; 800
  authored changed-line maximum; no chain strategy.
- **Mode:** Standard. Strict TDD remains disabled for this closure.
- **Initial closure runtime authority:** parent-owned token
  `sha256:87372ef8cf61a983e6f74eec8960b8834d31230b991e99abd500407e97a5e770`
  was not acquired, settled, finished, reset, or otherwise mutated here.

## Cumulative state

- [x] Unit 1 root graph baseline: exact catalogs, lockfile, and normal Nx
      project discovery are preserved.
- [x] Unit 2 Nx-first quality loop: root Oxfmt, Oxlint, and quality-test
      targets remain under direct Nx ownership; `.atl/` is versioned, and it
      and project-local `.agents/skills/` documentation are the only Oxfmt
      exclusions.
- [x] Unit 2.5 repository-local review-tool integration removal remains
      recorded; this closure did not reintroduce integrations.
- [x] Unit 3 rejected/superseded: the previously recorded host-bootstrap
      implementation is absent from canonical `master`; no root installer or
      custom runner is reintroduced.
- [x] Unit 4 deferred: existing CI uses full Nx `run-many` coverage; affected
      selection, `nrwl/nx-set-shas`, and Nx Cloud remain future work.

## Reconciliation decisions

The earlier Engram apply-progress revision reported a Unit 3
`scripts/bootstrap` remediation. That script and its tests are absent at the
canonical merge commit, while CI already provisions Bun 1.3.14, performs frozen
installation, and invokes Nx directly. Treating the historical report as a
current implementation would be false; Unit 3 is therefore closed as
rejected/superseded.

`app-tui` is now a separately delivered durable project with `test` and
`typecheck` targets. This reconciles the prior root-only assumptions without
claiming application behavior as part of this change. Strict TDD remains false
because changing testing policy is not part of this closure.

The current CI intentionally runs `format`, `lint`, `quality-test`, `test`,
and `typecheck` with Nx `run-many`. Root format and lint scan the repository,
so affected selection could omit required global gates for an application-only
change. Generic Unit 4 selection is deferred rather than implemented.

## Bounded remediation

This one correction remediates failed verification revision
`sha256:d643911674cc10736149199fdd0186ef82c4d143ead3244a8d4ca23dd707a1c3`.
The parent acquired the single permitted correction token
`sha256:b575f02bc332234f7776d5dc585e5357bdf7b67f02dec733545573d6b3b2deec`
for request `bootstrap-closure-remediation-acquire-20260817-007`; this apply
batch did not acquire, settle, reset, rescope, finish, or otherwise mutate that
authority.

The canonical Oxfmt configuration contains exactly `.atl/` and
`.agents/skills/`. The latter is an intentional project-local skill-documentation
exclusion introduced with those skills; removing it exposed nine pre-existing
unformatted skill references. The specification, design, Task 2.4, proposal,
and cumulative progress now truthfully record both exclusions. This correction
also removes the workspace-graph build/E2E contradiction and makes proposal and
design rollback prose enumerate every changed closure artifact. Unit 3 remains
rejected/superseded and Unit 4 remains deferred/unconfigured.

```json
{
  "schema": "gentle-ai.remediation-result/v1",
  "change": "bootstrap-workspace-toolchain",
  "lineage_id": "bootstrap-workspace-toolchain",
  "generation": 1,
  "fix_batch": "bootstrap-closure-remediation-acquire-20260817-007",
  "mode": "interactive-standard-hybrid",
  "remediation_token": "sha256:b575f02bc332234f7776d5dc585e5357bdf7b67f02dec733545573d6b3b2deec",
  "failed_evidence_revision": "sha256:d643911674cc10736149199fdd0186ef82c4d143ead3244a8d4ca23dd707a1c3",
  "max_attempts": 1,
  "max_changed_lines": 200,
  "evidence_revision": "sha256:13cbd5ec202569fd2a4386634ee5d5b8b7815e917583dac5ac4340617aae0a37",
  "runtime_authority_mutated": false
}
```

```json
{
  "schema": "gentle-ai.remediation-evidence/v1",
  "change": "bootstrap-workspace-toolchain",
  "lineage_id": "bootstrap-workspace-toolchain",
  "generation": 1,
  "fix_batch": "bootstrap-closure-remediation-acquire-20260817-007",
  "mode": "interactive-standard-hybrid",
  "remediation_token": "sha256:b575f02bc332234f7776d5dc585e5357bdf7b67f02dec733545573d6b3b2deec",
  "failed_evidence_revision": "sha256:d643911674cc10736149199fdd0186ef82c4d143ead3244a8d4ca23dd707a1c3",
  "evidence_revision": "sha256:13cbd5ec202569fd2a4386634ee5d5b8b7815e917583dac5ac4340617aae0a37",
  "runtime_authority_mutated": false
}
```

The canonical preimage for `evidence_revision` is:

```text
schema=gentle-ai.bootstrap-workspace-toolchain.remediation-evidence/v1
change=bootstrap-workspace-toolchain
mode=interactive-standard-hybrid
lineage_id=bootstrap-workspace-toolchain
generation=1
fix_batch=bootstrap-closure-remediation-acquire-20260817-007
remediation_token=sha256:b575f02bc332234f7776d5dc585e5357bdf7b67f02dec733545573d6b3b2deec
failed_evidence_revision=sha256:d643911674cc10736149199fdd0186ef82c4d143ead3244a8d4ca23dd707a1c3
bun_version=1.3.14
root_format_exit=0
root_check_exit=0
quality_test_pass=21
quality_test_fail=0
oxfmtignore_contract_exit=0
artifact_consistency_exit=0
diff_check_exit=0
correction_additions=111
correction_deletions=5
correction_changed_lines=116
candidate_additions=322
candidate_deletions=242
candidate_changed_lines=564
runtime_authority_mutated=false
native_review_invoked=false
rdd_invoked=false
git_stage_commit_push_pr_mutation=false
```

## Work Unit Evidence

| Evidence              | Exact result                                                                                                                                                                                                                                                                                                                                                      |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Focused command       | `/home/andresdavid/.local/share/mise/installs/bun/1.3.14/bin/bun install --frozen-lockfile` exited 0 and preserved `bun.lock` SHA-256 `892bf5c5672be7542b753d17cdb023704e9f174ad2d972c32c5999cfe6fd0171`. Nx project discovery under the same Bun reported `["app-tui","gentle-observe"]`.                                                                        |
| Final ordinary checks | Under Bun 1.3.14, `bun run format` exited 0; `bun run check` exited 0 with format, lint, and quality-test (21 tests passed, 0 failed); `nx run app-tui:test --skipNxCache` and `nx run app-tui:typecheck --skipNxCache` each exited 0; `git diff --check` exited 0. The root lint emitted one existing non-blocking warning in `apps/gentle-observe/src/app.tsx`. |
| Runtime harness       | N/A: the work unit changes reconciliation and documentation artifacts only; it introduces no product, host-bootstrap, CI, or runtime behavior.                                                                                                                                                                                                                    |
| Process and cleanup   | The temporary `node_modules` created solely for frozen-install validation is removed after the final checks. No process is intentionally left running.                                                                                                                                                                                                            |
| Rollback boundary     | Revert `openspec/changes/bootstrap-workspace-toolchain/{proposal.md,design.md,tasks.md,apply-progress.md,specs/workspace-toolchain/spec.md}`, matching Engram topics, and `docs/development/workspace-graph.md`. No merged application or CI behavior is removed.                                                                                                 |

No product source, package manifest, lockfile, CI YAML, Nx Cloud configuration,
`.repos`, branch/remote, commit, stage, push, GitHub, native review, or RDD
action is part of this closure.

## Remediation Work Unit Evidence

| Evidence                                | Exact result                                                                                                                                                                                                                                                                                                                                                                    |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Focused formatting command              | `env PATH=/home/andresdavid/.local/share/mise/installs/bun/1.3.14/bin:$PATH NX_SKIP_NX_CACHE=true /home/andresdavid/.local/share/mise/installs/bun/1.3.14/bin/bun run format` exited 0 after Oxfmt checked 43 matched files.                                                                                                                                                    |
| Focused aggregate command               | `env PATH=/home/andresdavid/.local/share/mise/installs/bun/1.3.14/bin:$PATH NX_SKIP_NX_CACHE=true /home/andresdavid/.local/share/mise/installs/bun/1.3.14/bin/bun run check` exited 0: format, lint, and quality-test passed; quality-test reported 21 passed and 0 failed. The existing non-blocking lint warning in `apps/gentle-observe/src/app.tsx:16:7` remains unchanged. |
| Oxfmt contract and artifact consistency | A Python assertion requires `.oxfmtignore` to equal `.atl/\n.agents/skills/\n`, verifies the documentation and rollback statements, and confirms all 13 tasks are checked; it exited 0.                                                                                                                                                                                         |
| Runtime harness                         | N/A: this bounded correction changes configuration truthfulness and documentation artifacts only; it introduces no product, host-bootstrap, CI, or runtime behavior.                                                                                                                                                                                                            |
| Rollback boundary                       | Revert `docs/development/workspace-graph.md` and `openspec/changes/bootstrap-workspace-toolchain/{proposal.md,design.md,tasks.md,apply-progress.md,verify-report.md,specs/workspace-toolchain/spec.md}`, then restore matching Engram topics. No merged application or CI behavior is removed.                                                                                  |
| Process and cleanup                     | Bun's frozen-install `node_modules` is temporary validation output and is removed before handoff. No server, watcher, or background process is left running.                                                                                                                                                                                                                    |
