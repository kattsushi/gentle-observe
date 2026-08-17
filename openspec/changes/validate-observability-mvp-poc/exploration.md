## Exploration: Validate observability MVP/POC

### Current State

`HEAD` is `3f402e3da8e3d60b82f9de0ccb10cd64c8fa8aa3`. The repository has an Nx/Bun workspace and an `app-tui` application that uses an Effect CLI/runtime boundary, Solid/OpenTUI static shell, a Linux x64 Bun build, and compiled-artifact PTY coverage for the truthful shell and `q` exit. The shell deliberately says that discovery is not connected.

The product domain is not implemented: there are no normalized product contracts, Demo or Live Layers, deterministic fake evidence, Pi/Gentle AI adapters, Effect Atom React binding, Termcn integration, routes/screens, or history/persistence. The PRD and wireframes already describe the full roadmap, including §15's first slice, **Contract and synthetic evidence**.

This change inserts an intermediate validation stage; it does not delete, supersede, or rewrite that roadmap. RDD remains out of product scope and disabled/unmanaged in this clone.

### Affected Areas

- `apps/gentle-observe/src/{cli.ts,main.ts,tui.tsx,app.tsx}` — existing executable and static renderer boundary to extend only after proposal approval.
- `apps/gentle-observe/test/{cli.test.ts,app.test.tsx,e2e.test.ts}` — current CLI, fixed-size shell, and compiled PTY evidence establishes the available test boundary.
- `apps/gentle-observe/build.ts` and `apps/gentle-observe/package.json` — current Effect-backed Linux Bun compilation and app targets; no platform or dependency expansion belongs to this exploration.
- `docs/product/prd.md` §15 — preserved roadmap and recorded resume checkpoint: continue immediately after **Contract and synthetic evidence**, or at that slice's first unmet exit criterion.
- `docs/design/tui-wireframes.md` — source for the shell, overview, timeline, agent, process, and metadata-view information architecture; the POC must remain visibly synthetic.
- `docs/research/technical-comparison.md` — source for the owned Pi/Gentle AI boundary, metadata-only policy, and RDD exclusion.
- `openspec/specs/workspace-toolchain/spec.md` and `openspec/changes/scaffold-bun-opentui-executable/` — executable/toolchain baseline only; they are not to be changed by this phase.

### Approaches

1. **Gated deterministic validation POC** — Define stable, normalized Effect source contracts; provide deterministic Demo Layers; render contract-driven projections; then decide whether to replace only selected layers with narrow Live Layers.
   - Pros: Tests the product comprehension and navigation value before unstable integrations, preserves the final architecture, keeps provider records out of the UI, and makes fake evidence repeatable.
   - Cons: Does not validate live-source correctness until the conditional pilot; scope must resist becoming a partial full roadmap.
   - Effort: Medium.

   Candidate validation slices, intentionally not implementation tasks:
   - **Stable contracts and Demo Layers:** normalized runtime/process inputs, explicit provenance/confidence/missingness, and deterministic fake fixtures behind replaceable Effect Layers. UI projections consume contracts, never Pi or Gentle AI records.
   - **Convincing DEMO DATA TUI:** a visibly labeled synthetic shell, overview, timeline, agent, and process views using basic React/OpenTUI primitives. It must preserve separate runtime/process claims and avoid fabricated authority; Effect Atom React may bind this reactive provider-to-view boundary only when it becomes useful, never authoritative domain storage. Termcn remains optional and non-blocking.
   - **Validation gate:** test with 3–5 representative users. Continue when most participants can correctly distinguish runtime from process evidence, complete core overview-to-detail navigation, and identify the product as useful; pivot when comprehension or navigation is materially inconsistent but the job remains valuable; stop when users cannot identify a valuable job or the evidence model remains misleading despite POC correction. Record observed outcomes and the decision rather than treating synthetic usage as production telemetry.
   - **Conditional live-source pilot:** only after a continue decision, add one proven Pi capability and one compatible, non-RDD Gentle AI activity surface as narrow Live Layers while retaining the same source contracts and UI projections.
   - **Conditional pilot hardening/delivery:** only after positive fake-data validation, harden the limited pilot with focused evidence and bounded delivery. This is not authorization for persistence, broad coverage, or release expansion.

2. **Proceed directly with the full §15 roadmap** — Start the existing contract/synthetic-evidence slice and continue through all subsequent broad product slices without an explicit user-validation checkpoint.
   - Pros: Reaches the planned full capabilities without an intermediate decision point.
   - Cons: Delays evidence of product value, couples implementation to unvalidated Pi/Gentle AI source assumptions, and risks building persistence and specialized views before users validate the core inspection experience.
   - Effort: High.

### Recommendation

Use the gated deterministic validation POC. Keep Demo and Live Layers interchangeable behind stable Effect contracts, and make the fake-data boundary explicit in every POC screen. The user-validation decision is the phase gate: a positive result permits only the one-Pi-capability/one-non-RDD-Gentle-AI-surface pilot; a pivot or stop leaves the original roadmap intact. At successful phase completion, resume the preserved PRD §15 roadmap immediately after **Contract and synthetic evidence**, or at the first unmet criterion inside that slice.

Explicitly defer durable storage, cursors, replay, broad process coverage, complete specialized views, Termcn ports, token/cost analytics, scale or performance claims, macOS/release expansion, and all remaining roadmap execution. RDD remains excluded and this clone must not invoke or enable RDD mechanisms.

### Risks

- A convincing synthetic UI can overstate live integration readiness; persistent `DEMO DATA` labeling and the conditional Live Layer gate are mandatory.
- Provider-specific records could leak into projections and make replacement costly; contracts must remain the only UI input boundary.
- Process activity can be mistaken for runtime liveness or authority; preserve separate planes, provenance/confidence, and the RDD denylist.
- The active OpenSpec config predates the app and says no product source exists; treat current app source/tests as the implementation baseline without rewriting historical artifacts.
- Per-worktree CodeGraph is not initialized: `codegraph status` reports this even though `.codegraph/` contains its ignore file. Investigate/index health separately as DX work, not a product blocker unless unsafe implementation decisions require structural intelligence.
- No language-server executable was found on PATH or in local `node_modules`; investigate LSP availability/configuration separately as DX work, not a product blocker unless implementation safety is compromised.

### Ready for Proposal

Yes. Tell the user that the proposal should formalize only the gated POC and its continue/pivot/stop checkpoint, preserve the existing roadmap and §15 resume checkpoint, and prohibit implementation, review, runtime-authority, GitHub, and RDD mutation until later approved phases.
