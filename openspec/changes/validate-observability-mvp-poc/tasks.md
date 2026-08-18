# Tasks: Validate Observability MVP/POC

## Review Workload Forecast

| Slice / PR                           |   Lines | Risk   | Value; proof; harness; rollback; exclusions                                                                                 |
| ------------------------------------ | ------: | ------ | --------------------------------------------------------------------------------------------------------------------------- |
| 0 Compatibility/DX                   |  80–180 | Low    | Tuple/typecheck; N/A; lock; no override/downgrade/legacy.                                                                   |
| 1 Contracts + Demo                   | 500–750 | Medium | Evidence/tests; N/A; domain/demo; no UI/live/persistence.                                                                   |
| 2A Demo acquisition + truthful shell | 260–380 | Low    | CLI/app tests; `--demo` Normal and default-unavailable harness; CLI/main/TUI shell; no Overview, adapter, details, or Live. |
| 2B React dependencies + guidance     | 250–400 | Low    | Exact tuple/peers/frozen install; manifests, lock, compatibility test, guidance; no runtime/config/build changes.           |
| 2C React renderer migration          | 180–320 | Medium | Renderer/lifecycle tests; shell PTY; React/OpenTUI runtime migration; no Overview, details, or Live.                        |
| 2D Overview + navigation             | 300–420 | Medium | Overview/navigation tests; `--demo` plane-switch/selection harness; UI Overview/layout; no details or Live.                 |
| 3 Details + Timeline                 | 550–780 | Medium | Navigation/tests; Complex PTY; UI; no live.                                                                                 |
| 4 Demo gate                          | 280–480 | Low    | Evidence; PTY/exercises; binary; validation; no Live.                                                                       |
| 5 Conditional Live                   | 500–750 | Medium | Proof/tests; live harness; live; no persistence/mixing.                                                                     |
| 6 Hardening/handoff                  | 250–450 | Low    | Decision/tests; pilot; validation; no PRD edits.                                                                            |

Likely PRs: 9. Delivery: chained PRs selected; commits include tests/validation.

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Chain Topology and Delivery Boundary

`master ← tracker (draft/no-merge) ← PR0 ← PR1 ← PR2A ← 📍 PR2B (React dependencies) ← PR2C (React renderer) ← PR2D (Overview) ← PR3 ← PR4`; PR5/6 after dual continue. PR0→tracker; later→predecessor. Children include `📍` diagram/context; retarget/rebase polluted diffs.

Use official `github/gh-stack`: `submit` links bases; `sync`/`rebase` preserve ancestry; `view` visualizes. Do not `merge`/merge tracker/create B before gate; final tracker integration alone reaches master.

Boundaries: issue-first, CI, `tuicr` before push, 800 lines/slice only with an explicit maintainer-approved exception, RDD/native review disabled. `.git/gh-stack` stays local/uncommitted; no planning mutation.

### PR2A / PR2B / PR2C / PR2D Child Boundaries

| Child | Start → end                                                                           | Focused harness                                                              | Rollback boundary                                         | Exclusions                                                                   |
| ----- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------- |
| PR2A  | Start: PR1 `271fa76f8132e3cd17838826f254667b2f9622e1`; end: 2.1a/2.2a truthful shell. | CLI/app tests; `--demo` Normal and default-unavailable shell.                | 2A CLI/main/TUI shell and focused tests.                  | Overview/navigation, Atom adapter, details, Live, dependencies, RDD, GitHub. |
| PR2B  | Start: PR2A; end: exact peer-compatible React tuple and reconciled guidance.          | Registry peer metadata, frozen install, compatibility test.                  | Manifests, lockfile, compatibility test, active guidance. | Renderer/runtime/config/build, Overview, details, Live, RDD, GitHub.         |
| PR2C  | Start: PR2B; end: equivalent shell behavior on React/OpenTUI.                         | Renderer/lifecycle tests and both shell PTY modes.                           | React renderer/configuration and focused tests.           | Overview/navigation, details, Live, RDD, GitHub.                             |
| PR2D  | Start: PR2C; end: 2.1b/2.2b Overview/navigation.                                      | Overview tests; `--demo` Runtime/Processes switch, selection, `Enter`/`Esc`. | Projection/AppShell/Overview/layout and focused tests.    | Details, Live, dependency changes, RDD, GitHub.                              |

## Milestone A — Demo and First User Gate

- [x] 0.0 Before stacks, install/verify `github/gh-stack`, load official project skill, verify `gh stack view` metadata; do none during planning.
- [x] 0.1 **RED:** add compatibility evidence for the unsupported Solid baseline; reject legacy Atom, overrides, downgrades, and fallbacks.
- [x] 0.2 **GREEN:** pin the exact published Effect/Atom React/React/OpenTUI peer intersection and direct peers/types; reject Solid, overrides, legacy, and fallback packages.
- [x] 1.1 **RED:** create contract/privacy/demo tests for planes, pre-projection RDD/payload denial, no-cost tokens, health, scenario reset.
- [x] 1.2 **GREEN:** create `src/{domain,sources,demo}/*` schemas and authoritative Effect Layers with provenance, capability, in-memory scenarios.
- [x] 2.1a **RED:** extend CLI/app tests for `--demo`, no-fallback health, persistent `DEMO DATA`, and truthful non-color source labels.
- [x] 2.2a **GREEN:** modify `src/{cli,main,tui}.ts*` for demo acquisition and a truthful unavailable/demo shell using immutable projection props; no Atom binding.
- [x] 2.1r **RED:** in PR2C, preserve the PR2A shell, lazy loading, `q`, and cleanup behavior in renderer/lifecycle tests.
  - Final verification runs `tui-lifecycle.test.tsx` explicitly; it is intentionally outside the configured app test target.
- [x] 2.2r **GREEN:** in PR2C, migrate the Solid/OpenTUI runtime to React/OpenTUI; PR2D owns Overview/navigation.
- [x] 2.1b **RED:** add Overview tests for Runtime/Processes switching, compact non-color labels, selection, and `Enter`/`Esc` navigation.
- [x] 2.2b **GREEN:** create `src/ui/{projection,AppShell,Overview,layout}.tsx` with stable immutable props and framework-local navigation/selection state; no Atom-shaped abstraction.
- [x] 3.1 **RED:** add navigation tests for keys, resize selection, specialized/generic detail, timeline, experimental-token unsupported view.
- [x] 3.2 **GREEN:** create `src/ui/{AgentDetail,ProcessDetail,Timeline,state,navigation}.tsx` with tagged views/back stack and contract rendering.
- [x] 3.3 **RED/GREEN:** add the Termcn adoption guardrail, then use official copy-owned OpenTUI `Stack`/`Columns`/`KeyValue`; preserve immutable projection/React-local navigation and exclude runtime packages and keyboard ownership.
- [x] 4.1 extend executable PTY tests for Linux x64 demo, default no-fake path, navigation, cleanup.
- [x] 4.2 create profile exercises, metrics, decision; capture payload-free comprehension, navigation, usefulness.
- [ ] 4.3 **GATE:** pending 3–5 real users and both human profile decisions; Live is ineligible unless both profile records say **continue**.

## Reactivity Boundary — Official Atom React

- [x] 0.2 **GATE/GREEN:** the exact published non-downgrade Atom React tuple is admitted in PR2B without runtime use. Adopt bindings only at a real reactive boundary; reject peer overrides, Solid, legacy/fallback, and unpublished packages.

## Milestone B — Conditional Narrow Live Pilot

- [ ] 5.1 **GATE/RED:** require dual continue; test read-only Pi/non-RDD SDD evidence missing/unsupported/stale without inference or demo mixing.
- [ ] 5.2 **GREEN:** create `src/live/*` adapters/Layers with metadata decode, privacy/RDD filter, and in-memory reconciliation behind contracts.
- [ ] 6.1 Run limited dual-profile pilot/CI; record decision, resume unchanged PRD §15 after **Contract and synthetic evidence** (or first unmet criterion).
