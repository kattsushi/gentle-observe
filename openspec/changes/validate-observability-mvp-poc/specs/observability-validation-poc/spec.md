# Observability Validation POC Specification

## Purpose

Validate metadata-only observability before resuming the preserved roadmap.

## Requirements

### Requirement: Normalized Evidence Layers

The system MUST define separate normalized runtime-agent and Gentle AI process contracts. Deterministic Demo/Live Layers SHALL be replaceable. UI MUST consume only contracts; vocabulary/provenance stay separate. Effect Atom React, if used, MUST bind reactive projection, never authority. RDD MUST be denied before projection.

#### Scenario: Contract-only projection
- GIVEN runtime/process evidence
- WHEN a Layer changes
- THEN the UI renders separate contract planes

### Requirement: Explicit Deterministic Demo Mode

Fake evidence MUST activate only with `--demo`, whose every view MUST show `DEMO DATA`. Demo SHALL offer Normal, Degraded, and Complex in memory only, resetting deterministically on restart. Unavailable discovery MUST NOT silently enable demo.

#### Scenario: Explicit demo session
- GIVEN `--demo` with Degraded selected
- WHEN the session restarts
- THEN it resets deterministically with `DEMO DATA` visible

#### Scenario: No fallback demo
- GIVEN no `--demo` and unavailable discovery
- WHEN Overview opens
- THEN it shows degraded health, not fake evidence

### Requirement: Metadata-Only Evidence

Evidence MUST expose repo/session/agent identity, explicit parent, bounded steps/events, model/provider, duration, freshness, status/missingness/capabilities, process activity, and provenance. It MUST NOT expose prompts, thoughts, message bodies, tool args/results, remote telemetry, mutation controls, or RDD. Token usage MAY be OPTIONAL EXPERIMENTAL: Demo MAY provide it; Live MAY provide it or declare unsupported; no cost, optimization, or availability promise.

#### Scenario: Unsupported and private evidence
- GIVEN token state is unsupported and input includes a payload body
- WHEN evidence is normalized and opened
- THEN detail shows no cost claim and all outputs omit the payload

### Requirement: Essential Accessible TUI

The TUI MUST provide Overview Runtime/Processes planes, agent/process Detail, simplified Timeline, and source health/provenance. SDD processes SHALL have specialized views; others generic fallback. Standard and `50x14` MUST support plane/tab switching, selection, Enter, Esc, `q`, and resize preservation. Distinctions MUST NOT rely only on color.

#### Scenario: Compact layout
- GIVEN `50x14` and a selected process
- WHEN resized, opened, and closed
- THEN selection and non-color provenance persist

### Requirement: Profile-Specific Validation Gate

The system MUST deliver a Linux x64 local binary to 3–5 users with separate metadata-only exercises for agent engineers and Gentle AI maintainers. It SHALL record independent continue, pivot, or stop outcomes from comprehension, navigation, and usefulness; indicative thresholds MAY guide but MUST NOT overfit tiny samples.

#### Scenario: Continue gate
- GIVEN both profiles show useful, non-misleading interpretation
- WHEN outcomes are reviewed
- THEN recorded continue makes the Live pilot eligible

#### Scenario: Pivot or stop gate
- GIVEN either profile lacks value or reliable interpretation
- WHEN pivot or stop is recorded
- THEN Live work does not proceed and feedback stays payload-free

### Requirement: Conditional Live Pilot and Roadmap Resume

Only after continue, Live Layers MAY expose one proven read-only Pi capability and compatible non-RDD Gentle AI SDD status/artifacts through the same contracts with bounded in-memory reconciliation. They MUST declare unsupported, missing, degraded, or stale capability and MUST NOT infer liveness/hierarchy. They MUST NOT add durable cursors/storage/replay, broad registries, payloads, RDD, or demo/real mixing. The next step MUST be unchanged PRD §15 after **Contract and synthetic evidence**.

#### Scenario: Bounded Live evidence
- GIVEN continue and unavailable Gentle AI capability
- WHEN the pilot renders it
- THEN it reports missing/unsupported without inference or demo mixing

#### Scenario: Resume checkpoint
- GIVEN pilot completion or its first unmet criterion
- WHEN POC closes
- THEN resume PRD §15 after the named slice or at that criterion

### Requirement: DX Boundary

LSP availability and per-worktree CodeGraph health MUST be bounded maintenance investigations and SHALL NOT block validation unless implementation is unsafe.

#### Scenario: Non-blocking tooling gap
- GIVEN tooling health is unavailable but implementation is safe
- WHEN validation planning proceeds
- THEN the gap is recorded as DX work
