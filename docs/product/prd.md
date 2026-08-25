# Gentle Observe Product Requirements Document

| Field              | Value                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------- |
| Document status    | Draft for product approval before SDD                                                        |
| Product scope      | Read-only local Pi runtime and all recognized, observable non-RDD Gentle AI process activity |
| Evidence basis     | [Gentle Observe technical comparison](../research/technical-comparison.md)                   |
| Experience design  | [Gentle Observe TUI wireframes](../design/tui-wireframes.md)                                 |
| Target platforms   | Linux and macOS                                                                              |
| Requirement totals | 57 functional requirements; 28 acceptance scenarios                                          |

## Product Summary

Gentle Observe is a local-first Agent Engineering and AI Engineering product for inspecting runtime and process evidence. It preserves a bounded, deterministic projection of accepted Pi runtime evidence while separately presenting all recognized, version-compatible, observable non-RDD Gentle AI skill/process activity. Generic rendering covers canonical identity, category, lifecycle/activity, provenance, freshness, capability, and missingness; specialized first-class launch projections cover SDD, embedded Strict TDD, Judgment Day, Agent Builder, SDD Explore, SDD Tasks, and authority-free native bounded 4R/refuter activity.

The product is metadata-only and read-only. It does not claim that an LLM output is reproducible, that a skill prompt proves every prescribed step occurred, or that 4R activity grants review or delivery authority. RDD is completely outside the MVP.

## 1. Problem Statement

LLM-driven execution is nondeterministic, and its runtime path is difficult to inspect consistently after execution. At the same time, Gentle AI reports useful process activity and artifacts that are often disconnected from Pi runtime evidence. Combining them naively creates two dangerous errors: treating process status as process liveness, and treating prescribed skill instructions as proof that each step ran.

Operators need one terminal view that preserves evidence provenance and missingness. They must be able to inspect Pi traces, explicit subagent relationships, supported history, model/configuration metadata, generic recognized non-RDD Gentle AI activity, and richer specialized launch views without implying prescribed-step execution, RDD receipt validity, or delivery authorization.

## 2. Product Principles

| Principle                            | Product rule                                                                                                                                          |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Evidence over inference              | Display only named-source evidence; do not infer hierarchy, liveness, completion, or authority.                                                       |
| Reported is not observed             | Distinguish reported process/artifact activity from Pi-observed runtime behavior.                                                                     |
| Deterministic inspection, not output | The same accepted evidence and ordering rules yield the same projection; LLM output remains nondeterministic.                                         |
| Runtime/process separation           | Pi runtime and Gentle AI process activity keep distinct identities, statuses, freshness, and provenance.                                              |
| Authority-free process activity      | Gentle AI integration observes recognized non-RDD activity but never grants receipt, gate, lineage, worktree, or delivery authority.                  |
| Generic before specialized           | Every recognized compatible non-RDD activity can use the bounded generic projection; only explicitly supported capabilities receive richer semantics. |
| Policy before projection             | Unknown/incompatible activity remains unsupported, and RDD is denylisted before shared projection or persistence even when discovered by a registry.  |
| Local-first and read-only            | No hosted service or mutation controls are required.                                                                                                  |
| Metadata-only privacy                | Excluded bodies are rejected or redacted before buffering, persistence, diagnostics, or rendering.                                                    |
| Capability-aware degradation         | Missing and unsupported evidence remains explicit rather than fabricated.                                                                             |

## 3. Users and Jobs

| User                   | Job to be done                                                                                                        |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Agent operator         | Identify Pi sessions/agents with current evidence and navigate explicit subagents.                                    |
| Agent engineer         | Follow a live trace, inspect retained history, and compare task/process/model/outcome metadata without causal claims. |
| SDD practitioner       | See reported SDD phase, progress, artifacts, attempts, and embedded Strict TDD evidence.                              |
| Review practitioner    | See Judgment Day and selected 4R/refuter actors and finding metadata without mistaking them for delivery authority.   |
| Tooling maintainer     | Diagnose unsupported, missing, delayed, duplicated, or degraded evidence.                                             |
| Gentle AI practitioner | Find canonically named recognized non-RDD skill/process activity even when no specialized view exists.                |

## 4. Goals and Non-Goals

### Goals

| ID   | Goal                                                                                                                                                                                 |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| G-01 | Provide one terminal overview of Pi runtime and all recognized, observable non-RDD Gentle AI process activity while keeping their claims distinct.                                   |
| G-02 | Make explicit Pi session, subagent, and supported historical relationships fast to inspect.                                                                                          |
| G-03 | Present SDD phase/progress/artifacts and embedded Strict TDD evidence with provenance and honest missingness.                                                                        |
| G-04 | Present Judgment Day, Agent Builder, and authority-free 4R/refuter activity using canonical names.                                                                                   |
| G-05 | Preserve deterministic trace inspection and provenance-bearing model/inference metadata for observational calibration.                                                               |
| G-06 | Remain trustworthy under missing capabilities, gaps, replay, stale evidence, permission errors, and partial source failure.                                                          |
| G-07 | Protect sensitive content through metadata-only, local, read-only operation.                                                                                                         |
| G-08 | Own stable contracts that can accept future runtime or process connectors without redesigning core product vocabulary.                                                               |
| G-09 | Render recognized compatible non-RDD activity generically, reserve specialized semantics for explicit projections, and reject unsupported or RDD activity before shared persistence. |

### Explicit Non-Goals

- Receipt-Driven Development (RDD), including its lifecycle and process projection.
- Receipt validity, completeness, issuance, collection, or interpretation.
- Review or delivery approval and delivery authorization.
- Gate, next-transition, correction/recovery, or compare-and-swap authorization.
- Review lineage authority and worktree authorization or provenance authority.
- Inferring completion solely from a skill prompt or prescribed procedure.
- Runtime support for anything other than Pi or process sources other than Gentle AI.
- Generic projection of unknown, unrecognized, version-incompatible, or unstably sourced activity.
- Mutation of agents, runtime state, processes, artifacts, models, configuration, reviews, repositories, or delivery state.
- Prompt, thought, message, tool argument, tool result, receipt, or authority payload bodies.
- Token/cost analytics, universal graph visualization, distributed ordering, browser UI, or Vite production TUI.

## 5. Initial Integration Scope

### Pi `AgentTelemetrySource`

Pi is the only initial runtime source. It may expose discovery, lifecycle, activity, explicit hierarchy, replay, trace ordering, history/tree relationships, model identity, allowlisted inference configuration, and process evidence. Each capability is independent and must be proven by the adapter. Unsupported capability is not failure and must not be inferred.

Read-only historical navigation is in scope only for relationships Pi explicitly supplies. Gentle Observe never checks out, resumes, forks, branches, rewinds, or mutates Pi state.

### Gentle AI `GentleAIProcessSource`

Gentle AI is the only initial process-activity source. Its generic boundary covers every registry-recognized, version-compatible non-RDD skill/process for which a stable source exposes activity. Generic records contain only canonical identifier/name, category, lifecycle/activity metadata, provenance, freshness, capability, and missingness; they never assert that every prescribed prompt step executed. Unknown, unrecognized, or incompatible records remain `unsupported`. RDD identifiers are denylisted before the shared event path, projection, or persistence, even when a generic registry discovers them.

The owned contract also provides these specialized first-class launch projections:

| Process                             | MVP projection                                                                                                                                                                    |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Generic recognized non-RDD activity | Canonical identifier/name, category, lifecycle/activity metadata, provenance, freshness, capability, and missingness                                                              |
| SDD                                 | Canonical phase, progress, dependencies, status, attempts, and artifacts for `init`, `explore`, `propose`, `spec`, `design`, `tasks`, `apply`, `verify`, `archive`, and `onboard` |
| Strict TDD Mode                     | Reported or observed cycle evidence attached to SDD apply/verify, never a standalone process                                                                                      |
| Judgment Day                        | Orchestrator, `jd-judge-a`, `jd-judge-b`, `jd-fix-agent`, findings metadata, and terminal reported result without receipt claim                                                   |
| Agent Builder                       | Canonical Agent Builder run identity and lifecycle/activity                                                                                                                       |
| SDD Explore                         | Specialized exploration-phase activity and artifact projection using the canonical name                                                                                           |
| SDD Tasks                           | Specialized task-planning activity and tasks-artifact projection using the canonical name                                                                                         |
| Native bounded review               | Selected Risk, Readability, Reliability, and Resilience lenses; actor start/end; related refuter activity; safe finding metadata/status                                           |

The contract emits evidence classes `skill_activity`, `sdd_artifact`, `review_actor`, and `runtime_behavior`. It must not expose RDD authority concepts. If RDD artifacts are present, it returns an out-of-scope indication or omits them safely.

### Stable Product Boundary

Gentle Observe owns versioned identities, event envelopes, capability declarations, evidence confidence, availability states, normalized projections, and navigation semantics. Pi and Gentle AI records do not enter the product domain or TUI directly. Future connectors must implement these contracts rather than expand the core vocabulary around one source.

## 6. User-Facing Concepts

| Concept                   | Definition                                                                                                                                     |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Repository                | Canonical local repository grouping runtime and process evidence without equating their identities.                                            |
| Session                   | Pi-owned runtime interaction containing Agents.                                                                                                |
| Agent                     | Pi-owned participant; a Subagent is an Agent with an explicit connector-provided parent.                                                       |
| Process                   | Recognized non-RDD Gentle AI process instance rendered generically or through an explicit specialized projection.                              |
| Skill Activity            | Canonical skill/actor identity, category, selection, start, end, or terminal activity with provenance, freshness, capability, and missingness. |
| SDD Phase                 | One canonical SDD phase with evidence status and provenance.                                                                                   |
| SDD Artifact              | Reported status/artifact record associated with an SDD phase or change.                                                                        |
| Strict TDD Cycle Evidence | Metadata indicating a cycle within SDD apply/verify; absent evidence remains unknown.                                                          |
| Judgment Day Run          | Dual-judge, bounded fix, findings, and terminal reported-result activity with no receipt authority.                                            |
| Agent Builder Run         | Canonical Agent Builder lifecycle and activity.                                                                                                |
| Review Actor/Lens         | Judgment Day actor or selected 4R/refuter actor/lens activity without RDD authority.                                                           |
| Finding Metadata          | Allowlisted finding identity, lens/category, severity, status, timestamps, and actor provenance; not an approval.                              |
| Trace                     | Bounded normalized Pi evidence projected deterministically for live and historical inspection.                                                 |
| Provenance                | Source, source identity, evidence class, confidence, timestamps, freshness, and ordering evidence.                                             |

### Evidence Confidence

| Label           | Meaning                                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------- |
| `reported`      | A process status or artifact reports the fact.                                                          |
| `observed`      | Pi runtime evidence reports the activity.                                                               |
| `authoritative` | The source owns the narrow non-RDD fact, such as artifact existence; it never means delivery authority. |
| `unknown`       | Evidence is absent, unreadable, unsupported, or ambiguous.                                              |

### Availability States

`unknown`, `unavailable`, `unsupported`, `degraded`, `stale`, and `out of scope` are first-class states. Pi runtime classifications (`live`, `idle`, `ended`, `orphaned`) are available only when Pi satisfies a validated policy. Gentle AI process activity never supplies runtime liveness.

## 7. MVP Experience

### Overview

- Group top-level Pi Agents by Repository and Session.
- Show runtime status, observation age, provenance, trace position, model identity, and allowlisted inference metadata when proven.
- Show recognized non-RDD Gentle AI Processes in a separate process panel or separately labeled fields.
- Render recognized compatible non-RDD activity generically when no specialized projection exists.
- Summarize current SDD phase/progress/artifacts, embedded Strict TDD evidence, Judgment Day, Agent Builder, and selected 4R activity.
- Label every process claim as reported, observed, authoritative in the narrow evidence sense, or unknown.
- Show repositories with process evidence but no Pi runtime evidence without calling the process live.

### Drill-Down

- Navigate explicit Pi subagents and spike-proven historical trace relationships without mutation.
- Inspect SDD phases, artifacts, dependencies, attempt metadata, and evidence freshness.
- Inspect Strict TDD cycle evidence under its SDD apply/verify phase.
- Inspect Judgment Day dual judges, fix activity, finding metadata, and terminal reported result with a persistent “no receipt/delivery authority” boundary.
- Inspect Agent Builder lifecycle using its canonical name.
- Inspect selected 4R lenses, actor lifecycle, refuter activity, and safe finding metadata.
- Inspect generic activity without specialized fields or implied prompt-step completion.
- Show unknown, unrecognized, and version-incompatible activity as unsupported rather than mapping it to a known process.
- Show RDD artifacts as unsupported/out of scope or omit them safely; never decode them as process state.

### Accessibility

Navigation is keyboard-first. Focus and status are not conveyed by color alone. Terminal resize preserves selection where possible and reflows without overlap. Essential labels remain readable in light, dark, and no-color environments.

### Approved High-Level UI Decisions

- One global shell exposes repository/session/process context, independent Pi and Gentle AI source health, current evidence position, and contextual key hints.
- Runtime and Gentle AI process activity remain separate evidence-plane groups or tabs in overview, timeline, detail, and activity views.
- The overview uses an adaptive grid of information-dense Agent and Process boxes; the timeline uses deterministic lane-and-time navigation with explicit hierarchy only.
- Historical inspection is read-only and bounded. The UI exposes no checkout, resume, branch, fork, retry-run, approval, gate, or delivery action.
- Agent detail prioritizes model identity, allowlisted effort/reasoning configuration, provenance, freshness, current/historical position, and honest unknowns.
- Activity/log tables are metadata-only. SDD has a specialized canonical phase view with Strict TDD nested under apply/verify; Judgment Day and 4R/refuter views retain a persistent no-receipt/no-delivery-authority boundary; generic recognized non-RDD activity uses a canonical fallback view.
- The implementation baseline is React with basic OpenTUI boxes, text, scroll areas, tabs, and tables. Termcn-inspired components require selective React compatibility spikes and cannot block a basic fallback.
- Responsive behavior is deterministic across wide, standard, compact, and too-small terminals; the minimum interactive viewport is `50x14` cells.

## 8. Functional Requirements

### Discovery and Contracts

| ID     | Requirement                                                                                                                       |
| ------ | --------------------------------------------------------------------------------------------------------------------------------- |
| FR-001 | The product shall discover eligible local repositories within a configured boundary.                                              |
| FR-002 | The product shall probe Pi and Gentle AI independently and expose source availability and permission state.                       |
| FR-003 | Discovery progress, empty state, and source-specific failures shall not block healthy sources.                                    |
| FR-004 | Repository identity shall use canonical, worktree-aware local Git evidence when available.                                        |
| FR-005 | Pi shall integrate through the owned `AgentTelemetrySource` contract.                                                             |
| FR-006 | Gentle AI shall integrate through the owned authority-free `GentleAIProcessSource` contract.                                      |
| FR-007 | Each source shall declare capabilities independently and prevent source-specific records from entering the product domain or TUI. |

### Pi Runtime and Trace

| ID     | Requirement                                                                                                                                          |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-008 | The product shall display Pi sessions, agents, supported lifecycle status, source, observation time, and freshness.                                  |
| FR-009 | A Subagent shall exist only when Pi supplies an explicit parent Agent identity.                                                                      |
| FR-010 | Explicit Agent relationships shall support arbitrary recursive depth without inferred edges.                                                         |
| FR-011 | `live`, `idle`, and `orphaned` shall require evidence meeting a validated Pi policy.                                                                 |
| FR-012 | Accepted Pi evidence shall normalize into immutable Trace Nodes with stable identity, subject, provenance, freshness, and ordering evidence.         |
| FR-013 | The same accepted evidence and ordering rules shall produce the same normalized live and replay projection.                                          |
| FR-014 | Read-only history shall expose only Pi-supplied paths, ancestors, children, checkpoints, or branches and shall explain unsupported relationships.    |
| FR-015 | The product shall capture connector-proven model identity and allowlisted non-sensitive inference configuration per Agent/Subagent without guessing. |
| FR-016 | Trace comparison shall align available task, process, model/configuration, and outcome metadata as observational evidence without causal claims.     |

### SDD and Strict TDD

| ID     | Requirement                                                                                                                                                |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-017 | The product shall recognize the canonical SDD phases `init`, `explore`, `propose`, `spec`, `design`, `tasks`, `apply`, `verify`, `archive`, and `onboard`. |
| FR-018 | The product shall display available SDD phase, progress, dependencies, attempt status, artifacts, provenance, and freshness.                               |
| FR-019 | SDD process status shall remain distinct from Pi runtime liveness.                                                                                         |
| FR-020 | Strict TDD Mode shall appear only as evidence embedded in SDD apply/verify.                                                                                |
| FR-021 | Strict TDD cycle claims shall identify whether evidence is reported or Pi-observed and shall remain unknown when evidence is missing.                      |
| FR-022 | The product shall not infer execution of every prescribed SDD or Strict TDD step from skill instructions alone.                                            |

### Judgment Day, Agent Builder, and 4R

| ID     | Requirement                                                                                                                                                              |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FR-023 | The product shall display a Judgment Day run with orchestrator, `jd-judge-a`, `jd-judge-b`, and `jd-fix-agent` activity when available.                                  |
| FR-024 | A Judgment Day terminal result shall be labeled reported and shall not be presented as a receipt, approval, gate, or delivery authorization.                             |
| FR-025 | The product shall display canonical Agent Builder run identity, lifecycle/activity, completion, failure, provenance, and freshness when available.                       |
| FR-026 | The product shall use SDD Explore and SDD Tasks for their canonical SDD phases and shall not label either as Agent Builder.                                              |
| FR-027 | The product shall display selected Risk, Readability, Reliability, and Resilience lenses and related actor start/end activity when safely available.                     |
| FR-028 | Related refuter activity and Finding Metadata may be displayed only from allowlisted authority-free fields.                                                              |
| FR-029 | 4R/refuter activity shall not imply receipt validity, approval, gate authorization, worktree authorization, lineage authority, RDD lifecycle, or delivery authorization. |

### RDD Exclusion and Missing Evidence

| ID     | Requirement                                                                                                                                       |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-030 | RDD shall be unsupported and outside the initial process scope.                                                                                   |
| FR-031 | RDD-only artifacts shall be omitted safely or shown as `out of scope` without semantic interpretation.                                            |
| FR-032 | The product shall not ingest or project RDD receipts, transitions, gates, lineage, worktree authority, recovery/CAS authority, or delivery state. |
| FR-033 | Missing recognized-process evidence shall be shown as `unknown`, `unavailable`, `unsupported`, `degraded`, or `stale` as supported by provenance. |
| FR-034 | Unsupported process names or versions shall not be coerced into the closest known process.                                                        |

### Event Handling and Resilience

| ID     | Requirement                                                                                                                                                         |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-035 | Gentle Observe shall own a versioned normalized event contract with source, identity, sequence, timestamp, classification, evidence class, confidence, and subject. |
| FR-036 | Event application shall be idempotent by stable event identity.                                                                                                     |
| FR-037 | Ordered-source gaps shall place the affected projection in visible degraded state before further live evidence is trusted.                                          |
| FR-038 | Projected state and durable cursor shall commit atomically.                                                                                                         |
| FR-039 | Restart shall recover from the last committed boundary and replay supported evidence without duplicates.                                                            |
| FR-040 | Runtime and process identities shall remain independent; correlations shall retain source and confidence.                                                           |
| FR-041 | Failure, timeout, or permission denial in one source shall not remove or misclassify valid evidence from another.                                                   |
| FR-042 | One bounded scheduler shall coalesce invalidations and enforce deadlines, concurrency limits, backoff, and jitter.                                                  |
| FR-043 | In-memory and durable activity history shall have explicit bounds and paginated access.                                                                             |

### UI, Privacy, Distribution, and Generic Coverage

| ID     | Requirement                                                                                                                                                                                                                                                        |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FR-044 | The overview shall group top-level Agents by Repository/Session and present Gentle AI process activity separately.                                                                                                                                                 |
| FR-045 | Keyboard-first focus, drill-down, return navigation, resize preservation, compact reflow, and non-color status cues shall be supported.                                                                                                                            |
| FR-046 | Runtime-sensitive and process claims shall show timestamps, freshness, evidence class, confidence, and source provenance.                                                                                                                                          |
| FR-047 | Integrations shall reject or redact excluded content before shared queues, logs, persistence, diagnostics, or UI state.                                                                                                                                            |
| FR-048 | Accepted MVP schemas shall exclude prompt, thought, message, tool argument/result, receipt, and authority payload bodies.                                                                                                                                          |
| FR-049 | Persisted data shall be limited to metadata required for status, provenance, hierarchy, recovery, calibration, and bounded history.                                                                                                                                |
| FR-050 | The product shall expose no mutation or control action for runtime, processes, artifacts, reviews, repositories, models, configuration, or delivery.                                                                                                               |
| FR-051 | Observation data shall remain local under user-scoped access controls and shall not require remote telemetry.                                                                                                                                                      |
| FR-052 | Supported Linux and macOS environments shall have a documented startup path and actionable local errors.                                                                                                                                                           |
| FR-053 | The production TUI shall use the approved Bun runtime/build path and shall not depend on Vite.                                                                                                                                                                     |
| FR-054 | Future connectors shall be addable through owned source contracts without redesigning core domain or TUI vocabulary.                                                                                                                                               |
| FR-055 | The product shall render any recognized, version-compatible non-RDD Gentle AI skill/process activity available through a stable source using canonical identifier/name, category, lifecycle/activity metadata, provenance, freshness, capability, and missingness. |
| FR-056 | Unknown, unrecognized, version-incompatible, or unstably sourced Gentle AI activity shall remain `unsupported` and shall not be coerced into a generic recognized or specialized projection.                                                                       |
| FR-057 | The Gentle AI adapter shall denylist discovered RDD skill/process identifiers and records before shared event projection or persistence, regardless of generic registry recognition.                                                                               |

## 9. Acceptance Scenarios

### AC-001: Active Pi Agent

**Given** current Pi evidence for a top-level Agent, **when** discovery completes, **then** the Agent appears under its Repository/Session with runtime status, age, and provenance.

### AC-002: Explicit Subagent

**Given** Pi reports Agent B with Agent A as its explicit parent, **when** A is opened, **then** B is navigable recursively and no additional relationship is inferred.

### AC-003: Unsupported Hierarchy

**Given** Pi agents are visible but hierarchy is unsupported, **when** the Session is opened, **then** a flat view remains usable and no tree is fabricated.

### AC-004: Deterministic Trace Replay

**Given** accepted ordered Pi evidence is retained, **when** it is replayed from the committed boundary, **then** the normalized projection matches the live projection without claiming reproducible LLM output.

### AC-005: Historical Relationship Missing

**Given** Pi provides linear history but no tree/checkpoint relationships, **when** history is opened, **then** the linear Trace is shown with the limitation and no ancestor, child, branch, or checkout semantics are invented.

### AC-006: Model Metadata Missing

**Given** Pi does not supply model or approved inference metadata, **when** the Agent is shown or compared, **then** the value is explicitly unknown/unsupported and never guessed.

### AC-007: SDD Phase and Progress

**Given** SDD status reports a change in `apply` with available artifacts and progress, **when** its Process is opened, **then** phase, progress, artifacts, provenance, and freshness are shown as reported evidence separate from Pi liveness.

### AC-008: SDD Artifact Missing

**Given** an expected SDD artifact is absent or unreadable, **when** SDD detail is shown, **then** its evidence state is missing/unavailable rather than completed or fabricated.

### AC-009: Strict TDD Evidence

**Given** cycle evidence is available during SDD apply or verify, **when** that phase is inspected, **then** the cycle evidence appears under the phase with reported/observed confidence and no standalone Strict TDD Process is created.

### AC-010: Strict TDD Guidance Without Evidence

**Given** the skill prescribes Strict TDD but no cycle evidence is available, **when** apply/verify is inspected, **then** cycle evidence is unknown and the UI does not claim red, green, or refactor occurred.

### AC-011: Judgment Day Dual Judges

**Given** a Judgment Day run reports two judge actors, **when** the run is opened, **then** `jd-judge-a` and `jd-judge-b` activity is shown separately with provenance and lifecycle state.

### AC-012: Judgment Day Terminal Result

**Given** Judgment Day reports a terminal result, **when** it is displayed, **then** it is labeled a reported result and the UI makes no receipt, approval, gate, or delivery-authority claim.

### AC-013: Judgment Day Fix Activity Missing

**Given** judge activity is available but `jd-fix-agent` evidence is absent, **when** the run is shown, **then** fix activity is unknown/absent rather than inferred from the result.

### AC-014: Agent Builder Lifecycle

**Given** Agent Builder reports start, activity, and completion, **when** its run is opened, **then** the canonical Agent Builder name, lifecycle, provenance, and freshness are shown without labeling it SDD Tasks.

### AC-015: Canonical SDD Names

**Given** SDD exploration and task-planning evidence, **when** the phases are listed, **then** they appear as SDD Explore and SDD Tasks, not task explorer or task builder.

### AC-016: Selected 4R Lenses

**Given** a native bounded review selects Risk and Reliability, **when** review activity is opened, **then** only those selected lenses and available actor start/end activity are shown.

### AC-017: 4R Finding Metadata

**Given** safe finding metadata is observable, **when** a 4R actor is inspected, **then** allowlisted identity/category/severity/status/provenance may be shown with an explicit no-delivery-authority boundary.

### AC-018: RDD Artifacts Present

**Given** RDD receipts or lineage/gate artifacts exist beside 4R activity, **when** Gentle Observe ingests the repository, **then** those artifacts are omitted or labeled out of scope and are not interpreted.

### AC-019: Unsupported Process Evidence

**Given** Gentle AI reports an unknown process or unsupported version, **when** discovery completes, **then** it remains unsupported and is not coerced into SDD, Judgment Day, Agent Builder, or 4R.

### AC-020: Process Evidence Without Pi

**Given** recognized non-RDD Gentle AI process evidence is readable and Pi is unavailable, **when** the overview is shown, **then** process activity remains visible and runtime is unavailable without implying liveness.

### AC-021: Replay Gap

**Given** an ordered source delivers an unexplained gap, **when** the batch is validated, **then** the affected projection becomes degraded, the last trusted state remains, and the cursor does not advance past failed state.

### AC-022: Privacy Boundary

**Given** an upstream record contains excluded bodies or RDD authority payloads, **when** it reaches an integration, **then** they are rejected/redacted before shared queues, logs, persistence, diagnostics, or rendering.

### AC-023: Partial Source Failure

**Given** one source times out or is permission-denied, **when** reconciliation runs, **then** healthy-source evidence remains correctly classified and the failed source exposes actionable state.

### AC-024: Terminal Resize and Keyboard Navigation

**Given** an operator has selected an entity, **when** the terminal resizes and keyboard navigation continues, **then** content does not overlap, selection is preserved where possible, and status remains understandable without color.

### AC-025: Linux and macOS Startup

**Given** a supported Linux or macOS environment, **when** Gentle Observe starts, **then** it reaches discovery or an actionable local error without Vite or a hosted service.

### AC-026: Generic Recognized Non-RDD Activity

**Given** a stable source reports activity for a recognized, version-compatible non-RDD Gentle AI skill without a specialized projection, **when** discovery completes, **then** the UI shows its canonical identifier/name, category, lifecycle/activity metadata, provenance, freshness, capability, and missingness without claiming every prescribed prompt step executed.

### AC-027: Unrecognized or Version-Incompatible Activity

**Given** Gentle AI activity has an unknown identifier, an incompatible version, or no stable observable source, **when** discovery completes, **then** it is shown as unsupported and is not coerced into a recognized generic or specialized projection.

### AC-028: Discovered RDD Identifier

**Given** a generic Gentle AI registry contains an RDD skill/process identifier, **when** the adapter evaluates discovered activity, **then** the RDD record is filtered before shared projection or persistence and is omitted or labeled out of scope without RDD semantics.

## 10. Data and Privacy

| Area              | Requirement                                                                                                                                                                                               |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accepted metadata | Identities, relationships, status, evidence class/confidence, timestamps, freshness, event type, allowlisted tool/model/configuration fields, SDD artifact metadata, actors/lenses, and finding metadata. |
| Excluded content  | Prompts, thoughts/reasoning, messages, tool arguments/results, secrets, receipts, authority payloads, and unapproved file content.                                                                        |
| Redaction         | Source-boundary redaction occurs before shared infrastructure; policy version is recorded as metadata.                                                                                                    |
| Retention         | Trace and process history are bounded by age and size; limits and truncation are visible.                                                                                                                 |
| Storage           | Local, user-scoped, no remote synchronization or telemetry by default.                                                                                                                                    |
| Control           | No process, runtime, review, artifact, repository, model/configuration, or delivery mutation.                                                                                                             |

## 11. Reliability and Performance Targets

| ID    | Validation target                                                                                                                             |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| PT-01 | 95% of accepted Pi metadata events visible within 500 ms of adapter receipt; 99% within 1 second.                                             |
| PT-02 | Gentle AI process changes visible within 2 seconds of detected invalidation or the reconciliation interval.                                   |
| PT-03 | TUI shell within 1 second and usable partial discovery within 3 seconds at p95 for 20 warm local repositories.                                |
| PT-04 | Reference workload of 20 repositories, 100 visible Agents, and 100,000 replayable metadata events below 250 MiB steady-state resident memory. |
| PT-05 | Initial durable retention target of 7 days or 250 MiB per user, whichever occurs first, pending validation.                                   |
| PT-06 | Restore committed view within 2 seconds and reconcile without duplicate application.                                                          |
| PT-07 | No silent accepted-event loss after durable commit; gaps prevent healthy classification.                                                      |
| PT-08 | Idle average CPU below 2% of one reference core with 20 repositories and zero card-owned polling loops.                                       |
| PT-09 | Burst of 1,000 metadata events in one second remains bounded and returns to freshness target within 3 seconds.                                |
| PT-10 | Adjacent navigation in a retained 100,000-node Trace completes within 200 ms p95 without loading all history.                                 |
| PT-11 | Live and replay projections are identical across the validated fixture corpus.                                                                |

Targets become release gates only after reference machines, fixtures, terminal sizes, and measurement methods are defined.

## 12. Success Metrics

| Metric                       | MVP success signal                                                                                                                                                            |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime comprehension        | At least 90% correctly identify current Pi evidence and distinguish process activity from liveness.                                                                           |
| SDD comprehension            | At least 90% identify current reported SDD phase, available artifacts, and missing evidence within 30 seconds.                                                                |
| Strict TDD honesty           | At least 90% distinguish reported/observed cycle evidence from prescribed guidance.                                                                                           |
| Judgment Day comprehension   | At least 90% identify both judges and terminal reported result without calling it a receipt or approval.                                                                      |
| Canonical naming             | At least 95% distinguish Agent Builder, SDD Explore, and SDD Tasks in usability tasks.                                                                                        |
| Generic non-RDD coverage     | 100% of recognized, compatible, stably observable non-RDD fixture activities produce canonical generic or specialized projections with provenance and freshness.              |
| Unsupported activity honesty | 100% of unknown, unrecognized, incompatible, and unstably sourced fixtures remain unsupported without coercion.                                                               |
| 4R authority boundary        | At least 90% identify selected lenses/findings and correctly state that the view grants no delivery authority.                                                                |
| RDD exclusion                | Fixture tests produce zero shared RDD records or semantic projections from registries/repositories containing RDD identifiers, receipts, gates, lineage, or delivery records. |
| Privacy                      | Zero excluded bodies enter shared events, durable storage, diagnostics, or rendered output across fixtures.                                                                   |
| Recovery                     | Zero silent losses and duplicate projected events across restart, duplicate, partial-batch, and gap fixtures.                                                                 |
| Determinism                  | 100% identical live/replay normalized Trace projections for the same accepted evidence.                                                                                       |
| Calibration discipline       | At least 90% compare traces without interpreting configuration differences as causal proof.                                                                                   |

## 13. Constraints and Dependencies

| Constraint            | Product implication                                                                                                                                                                             |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime/process scope | Pi-only runtime and all recognized, version-compatible, stably observable non-RDD Gentle AI activity are the launch boundary; specialized rendering is limited to the named launch projections. |
| TUI stack             | React and OpenTUI provide UI; Effect Atom React supplies reactive bindings without owning authoritative state.                                                                                  |
| Effect stack          | Effect 4 packages remain pinned to one compatible release; integrations vary behind services and Layers.                                                                                        |
| Build                 | Nx orchestrates; Bun provides workspaces, runtime, production TUI build, and executable compilation.                                                                                            |
| TypeScript            | TypeScript 7 and `@effect/tsgo` are the tooling direction.                                                                                                                                      |
| Termcn                | Optional only after a React compatibility/port spike.                                                                                                                                           |
| Evidence              | Shallow research snapshots require revalidation before implementation depends on unstable details.                                                                                              |

## 14. Risks

| Risk                         | Product impact                                                                  | Response                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Generic projection overreach | Broad support appears to certify prompt execution or invented process semantics | Keep the generic schema bounded; require explicit capability/version checks for specialized fields |
| Registry policy bypass       | RDD enters shared storage because its identifier is recognized generically      | Denylist RDD before shared projection/persistence and test mixed registry fixtures                 |
| Prompt-as-proof              | Users believe prescribed steps ran                                              | Label reported artifacts/activity and runtime observations separately                              |
| 4R/RDD coupling              | Actor activity leaks receipt or delivery semantics                              | Authority-free allowlist, RDD fixture rejection, persistent boundary copy                          |
| Process evidence instability | Judgment Day, Agent Builder, or 4R lifecycle cannot be observed reliably        | Capability declarations and unknown/unsupported fallback                                           |
| Canonical naming drift       | Users conflate Agent Builder with SDD Tasks                                     | Normalize canonical identifiers and test UI vocabulary                                             |
| Pi contract uncertainty      | Identity, hierarchy, replay, and history promises exceed Pi                     | Thin validation spike and only proven read-only capabilities                                       |
| Sensitive metadata           | Paths, tools, findings, or model fields disclose data                           | Deny-by-default allowlists and boundary redaction                                                  |
| Replay defects               | Silent gaps or duplicates undermine trust                                       | Atomic commit, idempotency, gap fixtures as release gates                                          |
| Retention/poll growth        | Long sessions consume CPU, memory, or disk                                      | One scheduler, bounded queues/windows, pagination, retention                                       |
| Calibration overclaim        | Correlation appears causal                                                      | Observational language, provenance, missingness, no recommendations                                |
| Source drift                 | Shallow snapshots become stale                                                  | Revalidate canonical evidence before implementation/release                                        |

## 15. Delivery Slices Before SDD

| Slice                           | User-visible outcome                                                                                                             | Exit criteria                                                                                                                                                               |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Contract and synthetic evidence | Separate runtime/process panels with generic and specialized rendering, confidence, provenance, canonical names, and degradation | Fixtures cover recognized generic activity, specialized evidence classes, unsupported activity, pre-persistence RDD rejection, keyboard/resize, and no authority vocabulary |
| Generic Gentle AI coverage      | Canonical activity for every recognized compatible non-RDD skill/process exposed by stable fixtures                              | Generic fields, provenance/freshness, capability/missingness, unsupported fallback, and no prescribed-step claims pass                                                      |
| Pi runtime/history spike        | Explicit Agents/subagents and only proven read-only history                                                                      | Identity, liveness, hierarchy, replay, history/tree, and model metadata capabilities documented from working evidence                                                       |
| SDD and Strict TDD              | SDD phase/progress/artifacts plus embedded cycle evidence                                                                        | Reported vs observed semantics and missing-cycle behavior pass fixtures                                                                                                     |
| Judgment Day and Agent Builder  | Canonical runs and actor lifecycle                                                                                               | Dual judges/result and builder lifecycle pass without receipt or SDD naming leakage                                                                                         |
| Authority-free 4R               | Selected lenses, actors, refuter, and safe findings                                                                              | RDD-rich fixtures expose no receipt, lineage, gate, worktree, recovery, or delivery projection                                                                              |
| Resilience/privacy/calibration  | Trustworthy restart, gaps, bounded history, redaction, and observational comparison                                              | Determinism, atomic cursor, retention, privacy, and no-causality scenarios pass                                                                                             |
| Linux/macOS packaging           | Same local read-only TUI starts on both platforms                                                                                | Actionable startup, Bun production path, and no Vite/hosted dependency demonstrated                                                                                         |

## 16. Open Product Decisions

- Which Pi surfaces provide stable live events, replay, identity, hierarchy, and history/tree relationships?
- Which stable Gentle AI surfaces provide process lifecycle activity for Judgment Day, Agent Builder, and 4R without RDD interpretation?
- Which registry and version-compatibility contract defines recognized Gentle AI identifiers, names, and categories?
- What stable-source threshold admits generic activity, and how should unsupported generic records appear without overwhelming the overview?
- Which Strict TDD fields distinguish reported cycle evidence from Pi-observed behavior?
- Which finding fields are safely separable from RDD authority and acceptable under metadata-only privacy?
- Should RDD presence produce a repository-level out-of-scope notice or remain hidden outside diagnostics?
- What repository discovery, freshness, retention, allowlist, and compact-terminal defaults are understandable and safe?
- How should Pi Agents correlate with multiple Gentle AI Processes without identity or causality claims?
- Which fixture corpus and reference machines define release gates?

## 17. MVP Definition of Done

The MVP is complete when an operator can launch Gentle Observe on Linux or macOS, inspect deterministic bounded Pi traces and explicit relationships, view supported model/configuration metadata, see any recognized compatible stably observable non-RDD Gentle AI activity through a canonical generic projection, and inspect richer specialized SDD, embedded Strict TDD, Judgment Day, Agent Builder, SDD Explore, SDD Tasks, and authority-free 4R/refuter views. It must keep unknown/incompatible activity unsupported, filter RDD before shared projection/persistence, remain useful under missing evidence and partial failure, recover without silent loss or duplication, and enforce metadata-only, local, read-only behavior.

### Approval Checklist

- [ ] FR-001 through FR-057 are unique, sequential, and covered by acceptance scenarios or explicit verification.
- [ ] AC-001 through AC-028 pass against agreed fixtures and supported platforms.
- [ ] Recognized compatible non-RDD skills/processes receive canonical generic projections with provenance, freshness, capability, and missingness.
- [ ] Unknown, unrecognized, incompatible, and unstably sourced activity remains unsupported without coercion.
- [ ] Pi validation proves or narrows identity, hierarchy, liveness, replay, history/tree, and model/configuration capabilities.
- [ ] SDD status/artifacts and embedded Strict TDD evidence preserve reported/observed distinctions.
- [ ] Judgment Day shows both judges and terminal reported result without receipt/approval language.
- [ ] Agent Builder, SDD Explore, and SDD Tasks use canonical names.
- [ ] 4R/refuter fixtures expose only authority-free actors/lenses/findings.
- [ ] Registry and RDD-rich fixtures prove RDD identifiers/records are filtered before shared projection/persistence and produce no receipt, lineage, gate, worktree, recovery/CAS, next-transition, or delivery projection.
- [ ] Live and replay Pi projections are deterministic for identical accepted evidence.
- [ ] Privacy fixtures prove excluded bodies never cross source boundaries.
- [ ] Restart, duplicate, partial-batch, gap, stale, unavailable, and permission scenarios pass.
- [ ] Trace calibration remains observational and model/configuration values are never guessed.
- [ ] Keyboard, focus, no-color, compact layout, and resize behavior are validated.
- [ ] Linux/macOS startup and Bun production path are demonstrated without Vite.
- [ ] No mutation or control capability is present.
- [ ] Future connector addition does not require core vocabulary redesign.

## 18. Traceability Matrix

| Goal | Functional requirements                             | Acceptance scenarios                         | Research basis                                                         |
| ---- | --------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------- |
| G-01 | FR-001-FR-008, FR-040-FR-046                        | AC-001, AC-020, AC-023-AC-025                | Executive conclusion; owned contracts; MVP scope                       |
| G-02 | FR-008-FR-014, FR-044-FR-046                        | AC-001-AC-005, AC-024                        | Pi runtime research; domain vocabulary                                 |
| G-03 | FR-017-FR-022, FR-033                               | AC-007-AC-010                                | Generic and specialized coverage matrix; SDD/Strict TDD evidence index |
| G-04 | FR-023-FR-034                                       | AC-011-AC-019                                | Judgment Day, Agent Builder, 4R, and RDD boundary evidence             |
| G-05 | FR-012-FR-016, FR-035-FR-040                        | AC-004-AC-006, AC-021                        | Effect ingestion direction; deterministic trace research               |
| G-06 | FR-007, FR-033-FR-043                               | AC-003, AC-008-AC-010, AC-013, AC-019-AC-023 | Capability and resilience findings                                     |
| G-07 | FR-047-FR-053                                       | AC-018, AC-022, AC-025                       | Privacy boundary; deferred scope; stack constraints                    |
| G-08 | FR-005-FR-007, FR-035, FR-040, FR-054               | AC-019, AC-020, AC-023                       | Owned contracts; future connector boundary                             |
| G-09 | FR-006-FR-007, FR-030-FR-034, FR-046, FR-055-FR-057 | AC-018-AC-020, AC-022, AC-026-AC-028         | Generic/specialized support decision; RDD exclusion boundary           |

### Requirement Coverage

| Requirement range | Primary acceptance coverage                    | Additional verification                                                                                                                  |
| ----------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| FR-001-FR-007     | AC-019, AC-020, AC-023, AC-025                 | Repository identity, discovery, permission, and adapter-contract fixtures                                                                |
| FR-008-FR-016     | AC-001-AC-006, AC-021                          | Pi capability spike, deterministic projection, correlation, and no-causality checks                                                      |
| FR-017-FR-022     | AC-007-AC-010, AC-015                          | Canonical phase decoder and prompt-as-proof audit                                                                                        |
| FR-023-FR-029     | AC-011-AC-017                                  | Actor lifecycle, canonical naming, finding allowlist, and no-authority copy audit                                                        |
| FR-030-FR-034     | AC-018-AC-020, AC-022                          | RDD-rich rejection, unsupported-version, and missing-evidence fixtures                                                                   |
| FR-035-FR-043     | AC-004, AC-021, AC-023                         | Schema, idempotency, atomic commit, replay, scheduling, and retention tests                                                              |
| FR-044-FR-046     | AC-001, AC-007, AC-011, AC-014, AC-016, AC-024 | Keyboard, focus, no-color, compact layout, provenance, and resize checks                                                                 |
| FR-047-FR-054     | AC-018, AC-022, AC-025                         | Storage inspection, network isolation, mutation audit, platform startup, dependency inspection, and connector contract test              |
| FR-055-FR-057     | AC-026-AC-028                                  | Generic recognition/version fixtures, stable-source capability checks, unsupported fallback, and pre-persistence RDD denylist inspection |
