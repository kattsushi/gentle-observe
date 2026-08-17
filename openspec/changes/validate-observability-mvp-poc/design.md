# Design: Validate Observability MVP/POC

## Technical Approach

Extend the Effect CLI and Solid/OpenTUI shell with separate runtime-agent and Gentle AI process planes. `--demo` selects deterministic Layers; default discovery reports unavailable, never fake fallback. Decode, filter, and normalize providers before projection. Add no persistence, polling, replay, telemetry, or mutation authority.

## Architecture Decisions

| Option | Tradeoff | Decision and rationale |
|---|---|---|
| Separate schemas | More types; prevents false equivalence | Define `RuntimeAgentEvidence` and `GentleAIProcessEvidence` with distinct identity/status vocabularies. |
| Effect services/Layers | Wiring cost; replaceable providers | `AgentTelemetrySource` and `GentleAIProcessSource` expose health, capabilities, provenance, missingness, and records. Demo and conditional Live Layers share tags. |
| Adapter decoding | Mapping duplication; stable UI | Decode unknown records with Schema, deny RDD identifiers/classifications before process projection, and map metadata only. Payload bodies never enter normalized models. |
| Optional token experiment | Explicit unsupported states | Model optional capability-bearing token metadata as supported/unsupported/missing; never model cost. |
| Reactivity authority | Compatibility-gated | Use Effect v4 `effect/unstable/reactivity/*` and official `@effect/atom-solid` only for projection/UI state; services remain authoritative. |
| Tagged view state | Sufficient TUI | Use Overview, AgentDetail, ProcessDetail, and Timeline tagged states with a back stack, not a router. |
| Primitive-first UI | Portable | Use Solid/OpenTUI primitives. Termcn requires a later spike. |
| Single app package | Larger app; avoids premature graph | Keep modules in `apps/gentle-observe`; split only for a second consumer. Direction: `ui -> projection -> contracts <- adapters`. |

## Data Flow and Boundaries

```text
CLI --demo? -> Layer composition -> source services -> safe projections -> Atom/Solid -> TUI
Provider input -> decode -> RDD/privacy deny -> normalize --------------------^
```

Sources report independent health/provenance, isolating failures. Diagnostics retain operation/classification and adapter version. Missingness and `DEMO DATA` are textual. Parentage requires explicit evidence; process activity never implies liveness or hierarchy.

## File Changes

| Path | Action | Description |
|---|---|---|
| `apps/gentle-observe/src/{cli,main,tui}.ts*` | Modify | Parse demo/scenario config and compose Layers while preserving lazy import, cleanup, and `q`. |
| `apps/gentle-observe/src/domain/*`, `src/sources/*` | Create | Schemas, typed failures, service contracts, Layer constructors. |
| `apps/gentle-observe/src/demo/*` | Create | Fixed-clock Normal/Degraded/Complex with stable IDs/order; Demo Layers. |
| `apps/gentle-observe/src/live/*` | Conditional | After continue: one proven Pi capability and non-RDD SDD status/artifacts, bounded in memory. |
| `apps/gentle-observe/src/ui/*` | Create | Projection, reactive state, screens, layouts, navigation, failures. |
| `apps/gentle-observe/package.json`, root `package.json` | Modify | Add only the approved tuple; never override peers. |
| `apps/gentle-observe/test/*` | Modify/Create | Contract, privacy, component, and compiled journey evidence. |
| `openspec/changes/validate-observability-mvp-poc/validation/*` | Create later | Separate profile scripts, metrics, and continue/pivot/stop product record; never runtime authority. |

## Interfaces / Contracts

Both source services expose `snapshot: Effect<Projection, SourceError>`. Projections require health, availability, provenance, freshness, capability states, and safe records. `View` is the tagged union `Overview | AgentDetail | ProcessDetail | Timeline`.

## TUI Architecture

Boundaries are `AppShell`, `DemoBanner`, `SourceHealthStrip`, labeled Runtime/Processes `Overview`, `AgentDetail`, specialized-SDD/generic `ProcessDetail`, simplified `Timeline`, `StatePanel`, layout, and navigation. Standard and compact (`50x14`) preserve route, plane, and stable selection across resize. `Tab` switches plane/region; arrows or `j/k` select; `Enter` opens; `Esc` returns; `q` exits. No router, refresh worker, or mutation keys.

## Testing Strategy

| Layer | Evidence |
|---|---|
| Contract | Decode/map, payload and RDD rejection, token states, stable scenarios, independent failure health. |
| Component | Standard/`50x14`, routes/scenarios, textual labels, keyboard/back stack/resize. |
| Executable | Linux x64 compiled PTY: `--demo`, navigation/scenario, `q` cleanup; default unavailable path proves no fake data. |
| Pilot | Separate agent-engineer and maintainer tasks measure comprehension, navigation, usefulness, and payload-free notes. |

## Threat Matrix

| Boundary | Applicability | Response / RED tests |
|---|---|---|
| Documentation-like paths | N/A — no executable-file classification | None. |
| Git repository selection | N/A — no Git integration | None. |
| Commit state | N/A — no commit automation | None. |
| Push state | N/A — no push automation | None. |
| PR commands | N/A — no PR automation | None. |

Process integration is bounded by adapter decoding, RDD/privacy denial, read-only capability declarations, and contract tests.

## Rollout / Rollback

Ship the Linux x64 demo to 3–5 users. Continue from both profiles makes Live eligible; pivot/stop revises or removes POC modules without changing the roadmap. Live stays session-only and never mixes demo data. Resume unchanged PRD §15 after **Contract and synthetic evidence**, or at its first unmet exit criterion. OpenCode LSP and per-worktree CodeGraph health remain bounded DX work.

## Open Questions

- [ ] `@effect/atom-solid@4.0.0-rc.108` supports Effect `4.0.0-rc.108`, but requires Solid `>=1.9.14 <2.0.0`; repository and `@opentui/solid` 0.5.2/0.5.3 pin 1.9.12. Before apply, select a compatible published tuple or get maintainer approval for a proven-safe resolution; no peer override, Effect downgrade, or fallback.
