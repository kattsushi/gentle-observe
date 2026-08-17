# Archive Report: Bootstrap Workspace Toolchain

## Result

**Archive status:** intentional-with-warning; archive-ready after a PASS WITH WARNINGS verification.
**Change:** `bootstrap-workspace-toolchain`
**Canonical base:** `523e3435ecd878a0026e17bbe63ebeac02fcd9f8`
**Mode:** interactive hybrid OpenSpec + Engram; RDD clone-locally disabled/unmanaged.

All 7/7 requirements, 6/6 scenarios, and 13/13 tasks are complete. The latest
verification is the post-remediation PASS WITH WARNINGS report at evidence
`sha256:e31919c209e63703dee11d63ed3e8a14f20be0bebf1a2433f37f1032bc91a4df`
with report SHA-256
`135b2bce19981c158dc9d5934428c4d666a7f0664ee517d7d0108c63afd1550c`.
There are zero CRITICAL findings.

## Final-state facts

- Unit 3 is rejected/superseded: no root `scripts/bootstrap` or custom host runner.
- Unit 4 is deferred/unconfigured: CI retains full Nx `run-many`; affected selection,
  `nrwl/nx-set-shas`, and Nx Cloud were not added.
- The bounded remediation passed at
  `sha256:13cbd5ec202569fd2a4386634ee5d5b8b7815e917583dac5ac4340617aae0a37`.
- Verification passed with exact Bun 1.3.14 frozen install, Nx discovery, root
  format/check (21 tests), `app-tui` test (11 tests), typecheck, contract checks,
  and `git diff --check`.
- Verified candidate accounting was 543 additions + 242 deletions = 785/800
  across seven files before archive-only changes.

## Warnings

The historical Engram `apply-progress` topic contains one malformed remediation
hash in a compact evidence JSON block. The authoritative OpenSpec artifact,
binding, adjacent remediation result, and current verification use the correct
hash recorded above. The existing Oxlint warning at
`apps/gentle-observe/src/app.tsx:16:7` is unrelated and non-blocking. Neither
warning contradicts current normative evidence.

## Persistence and read trace

OpenSpec artifacts were archived at
`openspec/changes/archive/2026-08-16-bootstrap-workspace-toolchain/`.
The absent main spec was created mechanically from the delta; the copy readback
`diff -r` was empty. The active change directory is gone, and the archive
snapshot readback `diff -r` was empty. The main source of truth is now
`openspec/specs/workspace-toolchain/spec.md`.

Engram observations read in full: #5257 proposal, #5259 spec, #5260 design,
#5261 tasks, #5264 apply-progress, and #5680 verify-report. The archive report
is persisted as `sdd/bootstrap-workspace-toolchain/archive-report`.
No review receipt artifacts were read because structured `reviewGate` was absent;
RDD/native review was not invoked.

## Working tree and budget

The final real-index status is unstaged: `docs/development/workspace-graph.md`
modified; six tracked active-change paths deleted; eight archived paths and the
main spec untracked. A temporary index, never the real index, was used for
rename-aware accounting. With `--find-renames=1% --find-copies=1%`, Git reports
10 files changed, 670 insertions, and 311 deletions: **981 authored changed
lines**. The default 20% similarity threshold reports 706 insertions and 347
deletions: 1,053 lines. The truthful minimum rename-aware result is therefore
981, which exceeds the accepted 800-line budget by 181 lines.

**Budget verdict: BLOCKED.** No commit, stage, push, PR, GitHub mutation, or
review action was performed; the parent must resolve the over-budget archive
diff before publication. The archive filesystem operation itself completed with
empty mandatory `diff -r` readbacks.

## Scope and rollback

Only closure documentation/spec artifacts and the existing workspace-graph
documentation are in scope. No product/runtime behavior, generic CI/Nx Cloud
behavior, lockfile, branch, remote, GitHub, stage, commit, push, PR, or native
review action was performed. Rollback is the exact archived closure artifacts,
the new main spec, and `docs/development/workspace-graph.md`; merged application
behavior remains untouched.
