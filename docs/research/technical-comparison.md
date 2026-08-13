# Gentle Observe Technical Comparison

> Pre-PRD research artifact. This report records evidence and product recommendations; it is not a technical design or an implementation commitment.

## Executive Conclusion

Gentle Observe should combine two distinct evidence planes without overstating either:

| Evidence plane             | Initial source | Safe MVP claims                                                                                                                                                                                                                         |
| -------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime                    | Pi             | Session and agent lifecycle, activity, explicit hierarchy, historical trace, and model/configuration metadata only when Pi provides evidence                                                                                            |
| Gentle AI process activity | Gentle AI      | Canonical generic activity for any recognized, version-compatible, observable non-RDD skill/process, plus specialized SDD, embedded Strict TDD, Judgment Day, Agent Builder, SDD Explore, SDD Tasks, and bounded 4R/refuter projections |

The initial Gentle AI integration is **authority-free**. It covers all recognized Gentle AI skills and processes except Receipt-Driven Development (RDD) when activity is observable through a stable, version-compatible source. Recognized non-RDD activity receives a generic canonical projection; selected launch capabilities receive richer specialized projections. RDD is completely outside the initial product scope. Gentle Observe must denylist RDD before shared projection or persistence and must not validate receipts, authorize delivery, project gates, negotiate RDD transitions, or claim lineage or worktree authority.

This correction matters because the previous authority-first recommendation treated mature-looking RDD storage and command surfaces as appropriate MVP projections. Those surfaces are technically useful evidence of complexity, but they belong to a changing authority system. Observing them safely would require Gentle Observe to understand receipts, authority, worktree provenance, gates, lineage, compare-and-swap recovery, and delivery authorization. That is not justified for the initial product.

## Initial Support Decision

The first release supports Pi runtime evidence and two levels of Gentle AI rendering:

1. **Generic coverage:** any registry-recognized, version-compatible non-RDD skill/process activity available from a stable source, represented by canonical identifier/name, category, lifecycle/activity metadata, provenance, freshness, capability, and missingness. Generic activity does not imply that every prescribed prompt step executed.
2. **Specialized first-class projections:** SDD; Strict TDD evidence embedded in SDD `apply` and `verify`; Judgment Day; Agent Builder; SDD Explore; SDD Tasks; and native bounded Risk, Readability, Reliability, Resilience, and related refuter activity.

Unknown, unrecognized, or version-incompatible activity remains `unsupported`; it is never coerced into a generic or specialized known process. Registry discovery does not override policy: recognized RDD identifiers are filtered before shared projection or persistence.

### Generic and Specialized Coverage Matrix

| Canonical process                     | Included activity                                                                   | Observable evidence classes                          | Product boundary                                                                                                                    |
| ------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Recognized non-RDD Gentle AI activity | Any version-compatible skill/process exposed through a stable observable source     | `skill_activity`                                     | Generic canonical identity/category/lifecycle/provenance/freshness/capability/missingness only; no prescribed-step completion claim |
| Spec-Driven Development (SDD)         | All canonical phases, status, progress, dependencies, and artifacts                 | `skill_activity`, `sdd_artifact`, `runtime_behavior` | Report observed status/artifacts; do not infer that every prescribed prompt step executed                                           |
| Strict TDD Mode                       | Red/green/refactor or equivalent cycle evidence embedded in SDD apply/verify        | `skill_activity`, `sdd_artifact`, `runtime_behavior` | Show only reported or runtime-evidenced cycles; never present it as a standalone workflow                                           |
| Judgment Day                          | Orchestration, two judge actors, bounded fix activity, terminal reported result     | `skill_activity`, `review_actor`, `runtime_behavior` | The reported result has no receipt or delivery authority                                                                            |
| Agent Builder                         | Builder entry, lifecycle/activity, completion or failure when reported              | `skill_activity`, `runtime_behavior`                 | Use the canonical Agent Builder name; do not map it to SDD Tasks                                                                    |
| SDD Explore                           | Exploration phase and related artifact/activity                                     | `skill_activity`, `sdd_artifact`, `runtime_behavior` | Canonical replacement for “task explorer” when SDD exploration is intended                                                          |
| SDD Tasks                             | Task-planning phase and tasks artifact/activity                                     | `skill_activity`, `sdd_artifact`, `runtime_behavior` | Canonical replacement for “task builder” when SDD task planning is intended                                                         |
| Native bounded 4R review              | Selected lenses, actor start/end, finding metadata/status, related refuter activity | `review_actor`, `runtime_behavior`                   | Authority-free activity only; no RDD lifecycle or delivery claim                                                                    |

Evidence classes are product-facing categories, not proof that the underlying skill prompt was followed completely:

- `skill_activity`: a named skill/process or actor was reported as selected, started, ended, or terminal.
- `sdd_artifact`: a named SDD artifact or status projection was found and decoded.
- `review_actor`: a Judgment Day or 4R/refuter actor, lens, lifecycle marker, or finding metadata record was observed.
- `runtime_behavior`: Pi supplied runtime evidence correlated with process activity.

## RDD Exclusion Boundary

RDD is **non-MVP and unsupported as either a generic or specialized process projection**. RDD artifacts may exist in an observed repository because current native 4R execution uses RDD machinery, and its identifiers may appear in a generic skill registry. Discovery does not expand scope: the adapter must denylist RDD identifiers and evidence before the shared event path, projection, or persistence.

Gentle Observe may expose only authority-free 4R activity that can be separated safely from RDD semantics:

- selected lenses;
- actor identity and start/end activity;
- finding identifiers, categories, severity, status, and timestamps when safely available;
- related refuter activity when safely available.

Gentle Observe must not claim or interpret:

- receipt validity or completeness;
- review or delivery approval;
- gate or next-transition authorization;
- worktree authorization or provenance authority;
- lineage authority or RDD lifecycle state;
- compare-and-swap recovery state;
- correction/recovery authorization;
- delivery authorization.

If RDD-only evidence is encountered, the product should omit it safely or identify it as `unsupported` / `out of scope`. It must not partially decode the evidence into an authoritative status.

### Why RDD Is Excluded

Gentle AI's RDD sources remain useful research context. They demonstrate that review authority is repository-bound, content-addressed, lineage-aware, mutation-controlled, and coupled to gates and delivery decisions. That complexity is precisely why it is excluded, not evidence that Gentle Observe should support it.

The reviewed RDD material includes `skills/rdd-defect-workflow/SKILL.md`, `docs/review-authority-threat-model.md`, and `docs/review-integration.md`. These references are **non-MVP context only**. No product projection or acceptance commitment should depend on them.

## Scope and Source Revisions

Local source inspection was restricted to the four allowed shallow repositories. Findings describe the checked-out snapshots, not all historical or future releases.

| Local source                     | Exact revision                             | Shallow |
| -------------------------------- | ------------------------------------------ | ------- |
| Gentle AI                        | `72cf613c826fce7f830d00a514d19cab406916ff` | Yes     |
| Effect v4                        | `b284ec72c506f3f2ade20b85e37d068833a88540` | Yes     |
| effect-atom-chat                 | `acd09f79daa04c6f32ab420e2025abf1909896a3` | Yes     |
| Inkwell SSSF, including Just Obs | `92f1701810993b8303562265ba04c727468fe070` | Yes     |

OpenTUI, Termcn, TypeScript-Go, and Effect Language Service claims remain remote-documentation-only.

## Comparative Findings

| Subject                          | Reusable evidence                                                                                                             | Boundary or defect                                                                                           | Gentle Observe implication                                                                                                         |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Gentle AI skill/process registry | Canonical identifiers, names, categories, and version information can define recognized activity beyond named launch examples | Recognition does not prove activity, compatibility, or prescribed-step execution; a registry can include RDD | Project stable, version-compatible observed non-RDD activity generically; reject incompatible/unknown records and filter RDD first |
| Gentle AI SDD                    | Canonical phases; structured status; artifacts; native attempt status                                                         | Skill instructions prescribe behavior but do not prove runtime execution by themselves                       | Project reported phase/artifact/activity with provenance; correlate Pi evidence separately                                         |
| Strict TDD                       | Explicit apply and verify guidance                                                                                            | Not a standalone process; prompt text is not cycle proof                                                     | Model cycle evidence under SDD apply/verify and show missing evidence honestly                                                     |
| Judgment Day                     | Canonical orchestration and actor names; bounded dual-judge/fix flow                                                          | Reported terminal result is not a receipt or delivery approval                                               | Show actors and result as process activity only                                                                                    |
| Agent Builder                    | Dedicated TUI route and domain types                                                                                          | Distinct from SDD Tasks                                                                                      | Preserve canonical identity and lifecycle                                                                                          |
| Native 4R/refuter                | Canonical Risk, Readability, Reliability, Resilience and refuter actors                                                       | Current execution passes through RDD machinery                                                               | Extract only authority-free actor/lens/finding activity or declare unsupported                                                     |
| RDD                              | Rich receipts, authority, lineage, gates, recovery, and delivery semantics                                                    | Evolving and excessively coupled for the MVP                                                                 | Exclude completely; retain evidence only as rationale                                                                              |
| Just Obs / SSSF                  | Pi JSONL normalization, dual persistence, cursor pages, useful hierarchy                                                      | No heartbeat policy; sensitive retention; partial-page cursor defect; N+1 polling; unbounded arrays          | Reuse event/lifecycle concepts, not implementation defects                                                                         |
| effect-atom-chat                 | Schema-defined streaming, domain/server/client split, Layer composition                                                       | React-specific binding; denormalized state; operational errors converted to defects                          | Keep framework-neutral contracts and typed failures; use Solid bindings                                                            |
| Effect v4                        | Bounded queues, stream batching, Schema decoding, Layers, keyed atoms                                                         | Ordering, replay, retention, and evidence semantics remain product responsibilities                          | Build bounded, provenance-preserving ingestion behind owned contracts                                                              |

## Evidence Semantics

### Reported Activity Is Not Runtime Proof

Gentle Observe must preserve the distinction between:

| Confidence      | Meaning                                                                  | Example                                                       |
| --------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------- |
| `reported`      | A process projection or artifact says an activity/state exists           | SDD status reports `apply`; a Judgment Day result is recorded |
| `observed`      | Pi runtime evidence reports actor or tool activity                       | A correlated actor starts or ends in Pi telemetry             |
| `authoritative` | Reserved for the named source's own non-RDD fact, not delivery authority | An SDD artifact exists at a decoded path                      |
| `unknown`       | Evidence is absent, unsupported, unreadable, or ambiguous                | Strict TDD guidance exists but no cycle evidence is available |

A skill prompt can describe required steps. It cannot prove those steps occurred. The UI must say “reported phase,” “artifact present,” or “runtime activity observed,” not “all prescribed steps completed,” unless a supported source supplies that evidence.

### Runtime and Process Activity Remain Separate

Pi runtime statuses such as `live`, `idle`, `ended`, `orphaned`, `stale`, and `unknown` must not be derived from Gentle AI process status. An SDD attempt reported as running is not a heartbeat. A valid combined view may say `SDD apply: reported active; Pi runtime: unknown`.

## Proposed Owned Contracts

| Contract                | Responsibility                                                                                                                                                                                                                           | Initial implementation |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `AgentTelemetrySource`  | Discover Pi sessions/agents; expose runtime lifecycle, activity, explicit hierarchy, trace/history, freshness, and model/configuration capabilities                                                                                      | Pi adapter             |
| `GentleAIProcessSource` | Discover all recognized, version-compatible, observable non-RDD Gentle AI activity; emit generic canonical activity and specialized SDD, Strict TDD, Judgment Day, Agent Builder, SDD Explore, SDD Tasks, and bounded review projections | Gentle AI adapter      |

Both sources declare capabilities independently. Unsupported capabilities remain `unsupported`; missing or unreadable evidence becomes `unavailable` or `unknown`. Neither adapter may fabricate evidence.

### Domain Vocabulary

| Entity                   | Purpose                                                                                                                                      |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `Repository`             | Canonical local repository grouping runtime and process evidence                                                                             |
| `Session`                | Pi-owned runtime interaction                                                                                                                 |
| `Agent`                  | Pi-owned runtime participant; a subagent is an Agent with an explicit parent                                                                 |
| `Process`                | Recognized non-RDD Gentle AI process instance with generic or specialized projection                                                         |
| `SkillActivity`          | Generic reported or observed lifecycle activity with canonical identifier/name, category, provenance, freshness, capability, and missingness |
| `SDDPhase`               | One canonical SDD phase within an SDD process                                                                                                |
| `SDDArtifact`            | A decoded SDD status/artifact record with provenance and freshness                                                                           |
| `StrictTDDCycleEvidence` | Reported or observed cycle evidence attached to SDD apply/verify                                                                             |
| `JudgmentDayRun`         | Orchestrator, judge, fix, and terminal-result activity without receipt authority                                                             |
| `AgentBuilderRun`        | Canonical Agent Builder lifecycle/activity                                                                                                   |
| `ReviewActor`            | Authority-free Judgment Day or 4R/refuter actor activity                                                                                     |
| `ReviewLens`             | Selected Risk, Readability, Reliability, or Resilience lens                                                                                  |
| `FindingMetadata`        | Metadata-only finding identity/category/severity/status; never a delivery decision                                                           |
| `Trace`                  | Deterministically projected Pi runtime evidence for inspection and calibration                                                               |

Correlations remain evidence-bearing edges. They do not merge Pi and Gentle AI identities.

## MVP Ingestion and Projection

1. Consume Pi live evidence through the strongest supported adapter surface.
2. Recover Pi history from a committed durable cursor when supported.
3. Watch Gentle AI/OpenSpec locations only as invalidation signals.
4. Resolve recognized identifiers and compatible versions, then refresh generic non-RDD activity and specialized projections through stable semantic surfaces where available.
5. Denylist RDD before shared projection/persistence; classify unknown, unrecognized, or incompatible activity as unsupported rather than coercing it.
6. Reconcile sources through one bounded scheduler with deadlines, jitter, backoff, and concurrency limits.
7. Persist redacted metadata and checkpoints before publishing normalized projections.
8. Apply batches and cursor movement atomically; expose gaps and partial evidence as degraded state.

The MVP remains metadata-only, local-first, and read-only. Raw prompts, thoughts, message bodies, tool arguments, tool results, receipts, authority payloads, and delivery controls are excluded.

## MVP Product Scope

The MVP should:

- list Pi agents by repository/session and navigate only explicit subagent relationships;
- preserve deterministic, bounded runtime trace inspection and historical navigation when Pi supports it;
- display model and allowlisted inference metadata for calibration without causal claims;
- show any recognized, version-compatible, observable non-RDD Gentle AI activity generically with canonical identity, category, lifecycle, provenance, freshness, capability, and missingness;
- show specialized launch projections separately from generic activity and from Pi runtime;
- show SDD phase/progress/artifacts and embedded Strict TDD evidence;
- show Judgment Day dual judges, bounded fix activity, and terminal reported result without receipt language;
- show Agent Builder runs with canonical naming;
- show selected 4R lenses, actor lifecycle, refuter activity, and finding metadata when safely observable;
- present missing, unsupported, unavailable, stale, degraded, and out-of-scope evidence honestly;
- filter discovered RDD identifiers before shared projection/persistence and omit or label RDD evidence without interpreting it.

## Deferred Scope

- All RDD semantics and projections.
- Receipt, review, gate, lineage, worktree, correction/recovery, CAS, next-transition, and delivery authority.
- Runtime connectors other than Pi or process sources other than Gentle AI.
- Unknown, unrecognized, version-incompatible, or unstably sourced Gentle AI activity.
- Mutation or control of agents, processes, artifacts, reviews, or repositories.
- Sensitive payload bodies, token/cost analytics, universal graph visualization, and distributed ordering.

## Risks

| Risk                             | Impact                                                                             | Mitigation direction                                                                                                  |
| -------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Generic projection overreach     | Broad coverage appears to certify prescribed steps or invent specialized semantics | Restrict generic fields to canonical activity/provenance/capability/missingness; specialized decoders remain explicit |
| Registry policy bypass           | Discovered RDD identifiers enter the shared pipeline through generic coverage      | Apply the RDD denylist before projection/persistence and test mixed registries                                        |
| Prompt-as-proof overclaim        | Prescribed behavior appears observed when it is not                                | Label reported artifact/activity separately from Pi runtime evidence                                                  |
| 4R/RDD leakage                   | Actor activity is mistaken for receipt or delivery authority                       | Allowlist authority-free fields; reject RDD lifecycle/authority projections                                           |
| Canonical-name drift             | Agent Builder, SDD Explore, and SDD Tasks become conflated                         | Normalize canonical process and actor identifiers at ingestion                                                        |
| Unsupported process evidence     | Partial or absent records create false completion claims                           | Capability declarations and explicit unknown/unsupported states                                                       |
| Pi contract uncertainty          | Identity, hierarchy, replay, and tree promises may exceed supported surfaces       | Thin Pi validation spike and honest fallback                                                                          |
| Sensitive data leakage           | Prompts, paths, tool output, receipts, or secrets persist                          | Metadata-only schemas and boundary redaction                                                                          |
| Event loss or duplication        | Historical trace becomes untrustworthy                                             | Stable event IDs, gap detection, atomic cursor/state commit, replay                                                   |
| Poll amplification and retention | CPU, memory, or disk grow without bound                                            | One scheduler, bounded queues/windows, durable pagination and retention                                               |
| Shallow-source drift             | Snapshot evidence ages                                                             | Revalidate canonical surfaces before implementation                                                                   |

## Open Questions

- Which stable Gentle AI surface reports lifecycle activity for Judgment Day, Agent Builder, and 4R actors without requiring RDD interpretation?
- Which registry/version contract defines recognized, compatible Gentle AI identifiers and categories for generic projection?
- What minimum stable-source evidence qualifies an activity for generic rendering rather than `unsupported`?
- Which Strict TDD evidence fields can distinguish a reported cycle from Pi-observed runtime behavior?
- Which 4R finding fields are safely separable from receipt, lineage, gate, and delivery semantics?
- Should unsupported RDD artifacts be visible as one repository-level notice or omitted unless diagnostic mode is active?
- Which Pi surface provides stable identity, explicit hierarchy, replay, and historical tree/path inspection?
- What allowlisted metadata is acceptable before consent, and what retention defaults balance diagnosis with privacy?
- How should one Pi agent correlate with multiple Gentle AI processes without implying identity or causality?

## Recommended Next Step

Before SDD, validate two thin read-only spikes:

1. A Pi adapter spike proving stable session/agent identity, explicit hierarchy, replay, and available history/tree semantics.
2. A Gentle AI process spike proving generic canonical projection for recognized non-RDD activity, specialized SDD/Strict TDD/Judgment Day/Agent Builder/SDD Explore/SDD Tasks/4R behavior, unsupported handling for unknown or incompatible activity, and pre-projection rejection of discovered RDD identifiers and authority records.

The product contract should be reviewed against fixtures containing recognized generic activity, specialized activity, unknown/incompatible activity, and RDD identifiers/artifacts. Success means non-RDD activity remains useful at the appropriate rendering level while unsupported records are not coerced and RDD is filtered or explicitly `out of scope`, never partially interpreted.

## Evidence Index

Paths are relative to the checked-out Gentle AI source unless another source is named. Line ranges describe the inspected snapshot and may move upstream.

### Gentle AI Included Processes

| Claim                                                                                                                                    | Canonical evidence                                                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Installed skills expose canonical identifiers and instructions suitable for recognition, subject to version and stable-source validation | `internal/assets/skills/`; `internal/opencode/models.go`                                                                                               |
| Canonical SDD phases (`init` through `onboard`)                                                                                          | `internal/opencode/models.go:478-491`                                                                                                                  |
| SDD status contract and semantic projection                                                                                              | `internal/assets/skills/_shared/sdd-status-contract.md`; `internal/cli/sdd_status.go`; `internal/cli/sdd_attempt.go`                                   |
| Strict TDD belongs to SDD init/apply/verify                                                                                              | `internal/assets/skills/sdd-init/SKILL.md`; `internal/assets/skills/sdd-apply/strict-tdd.md`; `internal/assets/skills/sdd-verify/strict-tdd-verify.md` |
| Judgment Day orchestration and canonical actors                                                                                          | `internal/assets/skills/judgment-day/SKILL.md`; `internal/opencode/models.go:494-503`                                                                  |
| Agent Builder canonical name and domain                                                                                                  | `internal/tui/model.go`; `internal/tui/router.go`; `internal/agentbuilder/types.go`                                                                    |
| Native 4R and refuter actor names                                                                                                        | `internal/opencode/models.go:506-521`                                                                                                                  |

### Gentle AI RDD Exclusion Context

| Claim                                                                | Non-MVP evidence                        |
| -------------------------------------------------------------------- | --------------------------------------- |
| RDD process, receipts, recovery, and delivery gates are coupled      | `skills/rdd-defect-workflow/SKILL.md`   |
| Review authority has explicit threats and authorization boundaries   | `docs/review-authority-threat-model.md` |
| Native review integration includes authority and lifecycle machinery | `docs/review-integration.md`            |

These RDD references explain exclusion only. They are not supported projections or MVP dependencies.

### Runtime and Ingestion Research

| Claim                                                            | Evidence                                                                                                                                                                                |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pi JSONL is streamed and normalized during execution             | SSSF `adws/adw_modules/agent_pi.py:131-320`                                                                                                                                             |
| JSONL and SQLite/WAL provide dual persistence                    | SSSF `adws/adw_modules/tracer.py:1-136`                                                                                                                                                 |
| Existing cursor flow can advance before a complete pull commits  | SSSF `.claude/skills/sssf/apps/visualizer/src/components/SessionCard.vue:29-60`; `SessionTrace.vue:37-62`                                                                               |
| Existing UI polling and retention are unbounded per running card | SSSF `SessionsList.vue:13-36`; `SessionCard.vue:29-60`; `SessionTrace.vue:30-62`                                                                                                        |
| Schema/RPC and Layer-backed client separation                    | effect-atom-chat `packages/domain/src/index.ts:1-16`; `packages/server/src/main.ts:1-43`; `packages/client/src/chat/atoms.ts:1-71`                                                      |
| Bounded queue, grouped stream, typed Schema decode, keyed atoms  | Effect v4 `packages/effect/src/Queue.ts:500`; `Stream.ts:8014-8047`; `ai-docs/src/01_effect/02_schema/10_schema-basics.ts:7-42`; `packages/effect/test/reactivity/Atom.test.ts:916-935` |
