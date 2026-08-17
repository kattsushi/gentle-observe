# Tasks: Validate Observability MVP/POC

## Review Workload Forecast

| Slice / PR | Lines | Risk | Value; proof; harness; rollback; exclusions |
|---|---:|---|---|
| 0 Compatibility/DX | 80–180 | Low | Tuple/typecheck; N/A; lock; no override/downgrade/legacy. |
| 1 Contracts + Demo | 500–750 | Medium | Evidence/tests; N/A; domain/demo; no UI/live/persistence. |
| 2 Shell + Overview | 550–780 | Medium | Overview/tests; demo PTY; shell; no details/live. |
| 3 Details + Timeline | 550–780 | Medium | Navigation/tests; Complex PTY; UI; no live. |
| 4 Demo gate | 280–480 | Low | Evidence; PTY/exercises; binary; validation; no Live. |
| 5 Conditional Live | 500–750 | Medium | Proof/tests; live harness; live; no persistence/mixing. |
| 6 Hardening/handoff | 250–450 | Low | Decision/tests; pilot; validation; no PRD edits. |

Likely PRs: 7. Delivery: chained PRs selected; commits include tests/validation.

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Chain Topology and Delivery Boundary

`master ← tracker (draft/no-merge) ← 📍 PR0 ← PR1 ← PR2 ← PR3 ← PR4`; PR5/6 after dual continue. PR0→tracker; later→predecessor. Children include `📍` diagram/context; retarget/rebase polluted diffs.

Use official `github/gh-stack`: `submit` links bases; `sync`/`rebase` preserve ancestry; `view` visualizes. Do not `merge`/merge tracker/create B before gate; final tracker integration alone reaches master.

Boundaries: issue-first, CI, `tuicr` before push, 800 lines/slice, RDD/native review disabled. `.git/gh-stack` stays local/uncommitted; no planning mutation.

## Milestone A — Demo and First User Gate

- [ ] 0.0 Before stacks, install/verify `github/gh-stack`, load official project skill, verify `gh stack view` metadata; do none during planning.
- [ ] 0.1 **RED:** add compatibility test for published Effect 4.0.0-rc.108 / official atom-solid / Solid / OpenTUI; reject legacy atom, override, downgrade.
- [ ] 0.2 **GREEN:** update root/app `package.json` after proof; record DX only if safety needs it.
- [ ] 1.1 **RED:** create contract/privacy/demo tests for planes, pre-projection RDD/payload denial, no-cost tokens, health, scenario reset.
- [ ] 1.2 **GREEN:** create `src/{domain,sources,demo}/*` schemas and authoritative Effect Layers with provenance, capability, in-memory scenarios.
- [ ] 2.1 **RED:** extend CLI/app tests for `--demo`, no-fallback health, `DEMO DATA`, plane switch, compact non-color labels.
- [ ] 2.2 **GREEN:** modify shell and create `src/ui/{projection,AppShell,Overview,layout}.tsx`; Atom is projection/navigation/selection only; Termcn optional.
- [ ] 3.1 **RED:** add navigation tests for keys, resize selection, specialized/generic detail, timeline, experimental-token unsupported view.
- [ ] 3.2 **GREEN:** create `src/ui/{AgentDetail,ProcessDetail,Timeline,state,navigation}.tsx` with tagged views/back stack and contract rendering.
- [ ] 4.1 extend executable PTY tests for Linux x64 demo, default no-fake path, navigation, cleanup.
- [ ] 4.2 create profile exercises, metrics, decision; capture payload-free comprehension, navigation, usefulness.
- [ ] 4.3 **GATE:** stop after 3–5 users; do not execute Slice 5 unless both profile records say **continue**.

## Milestone B — Conditional Narrow Live Pilot

- [ ] 5.1 **GATE/RED:** require dual continue; test read-only Pi/non-RDD SDD evidence missing/unsupported/stale without inference or demo mixing.
- [ ] 5.2 **GREEN:** create `src/live/*` adapters/Layers with metadata decode, privacy/RDD filter, and in-memory reconciliation behind contracts.
- [ ] 6.1 Run limited dual-profile pilot/CI; record decision, resume unchanged PRD §15 after **Contract and synthetic evidence** (or first unmet criterion).
