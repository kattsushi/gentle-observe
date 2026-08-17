# Proposal: Validate Observability MVP/POC

## Intent

Insert a validation checkpoint before roadmap investment. Test whether agent engineers and maintainers value a metadata-only observability TUI while preserving the PRD, wireframes, main specs, archived changes, and roadmap.

**Entry:** the truthful static shell, before PRD §15 **Contract and synthetic evidence** is satisfied. **Resume:** immediately after that slice, or at its first unmet exit criterion.

## Outcomes and Hypotheses

- Distribute a local Linux x64 demo binary to 3–5 representative users.
- Most agent engineers distinguish runtime from process evidence and complete Overview-to-detail navigation.
- Most maintainers interpret SDD status/artifact provenance and identify a useful maintenance decision.
- Record independent continue/pivot/stop decisions per profile; neither profile masks the other.

## Scope

### In Scope
- Normalized Effect source contracts with provenance, missingness, source health, and optional token usage.
- Explicit `--demo` only; deterministic Normal, Degraded, and Complex session-only scenarios with persistent `DEMO DATA` labeling.
- Keyboard-navigable Overview, Agent Detail, Process Detail, and simplified Timeline.
- Conditional pilot: one read-only Pi capability plus non-RDD Gentle AI SDD status/artifacts, using bounded in-memory reconciliation.
- Bounded hardening after positive gates.

### Non-Goals
- Automatic fallback, demo/live mixing, durable history/cursors/replay, broad registries, inferred liveness/hierarchy, payload bodies, mutations, telemetry, RDD, activity table, advanced search/help, complete specialized views, scale claims, macOS/release expansion, or required Termcn.
- Cost data, analytics/optimization promises, or guaranteed token availability.
- Tooling overhaul; LSP and CodeGraph health remain bounded DX investigations.

## Capabilities

### New Capabilities
- `observability-validation-poc`: Contract-driven demo, profile-specific gates, and conditional narrow Live Layer pilot.

### Modified Capabilities
- None. `workspace-toolchain` remains unchanged.

## Approach and Boundaries

1. Contracts and replaceable deterministic Demo Layers.
2. Fake-data TUI and audience-separated validation.
3. Conditional replaceable Live Layers, then bounded hardening.
4. Resume the preserved roadmap, or stop/pivot with evidence.

The UI consumes normalized contracts only. Effect Atom Solid may own provider-to-view reactivity, never authoritative storage. Runtime and process evidence remain separate. Token usage is a bounded optional POC experiment and explicit decision point; Live Layers may report unsupported.

## Risks

| Risk | Mitigation |
|---|---|
| Fake fidelity overstates readiness | Labeling, no silent fallback, and gates before live use. |
| Tokens become implied scope | Optional/unsupported states and explicit continue/drop decision. |
| Provider leakage or false authority | Contract-only UI, provenance/missingness, separate evidence planes, metadata-only denylist. |

## Rollback Plan

Remove POC-only contracts, Layers, views, and validation artifacts; restore the truthful shell. Preserve roadmap artifacts and runtime authority.

## Success Criteria

- [ ] Each profile has a recorded gate outcome.
- [ ] Demo and Live Layers replace each other without UI contract changes.
- [ ] Exit resumes at the exact checkpoint above or records stop/pivot evidence.
