## Exploration: Convert the approved Gentle Observe PRD and TUI design into functional SDD deliverables

### Current State
The root is an uncommitted documentation/bootstrap repository: it has no product source, root package manifest, Nx configuration, Bun lockfile, or test runner. `openspec/config.yaml` sets hybrid persistence, an 800-line review budget, and requires functional, reversible work units with tests and docs included.

The approved PRD defines a local, read-only, metadata-only TUI with separate Pi runtime and Gentle AI process evidence planes. Initial sources are Pi and recognized, version-compatible, stably observable **non-RDD** Gentle AI activity. Generic process rendering is bounded to identity, category, lifecycle/activity, provenance, freshness, capability, and missingness; richer projections are limited to SDD (with Strict TDD only under apply/verify), Judgment Day, Agent Builder, SDD Explore, SDD Tasks, and authority-free 4R/refuter activity. RDD must be filtered before shared event projection or persistence and cannot expose receipt, gate, lineage, worktree, recovery/CAS, or delivery semantics.

The wireframes already approve the keyboard-first OpenTUI/Solid shell: separate Runtime/Process tabs, five top-level routes, adaptive layouts (`>=140x36`, `90x24`, `50x14` minimum), no-color/ASCII fallbacks, deterministic lanes, and no mutation controls. Basic OpenTUI primitives are the baseline; Termcn is React-oriented and remains optional only through a selective Solid/OpenTUI port spike.

Current documentation confirms `@opentui/solid` supports Solid rendering, keyboard hooks, and `testRender` sizing. Bun supports workspaces and target-specific compiled executables. Nx supports Bun workspaces/tasks. Conversely, TypeScript 7/tsgo remains preview technology, and Effect 4 RC packages must remain in exact version lock-step.

### Affected Areas
- `openspec/config.yaml` — existing lifecycle and testing constraints; later proposals must turn on Strict TDD only after a working runner is proven.
- `docs/product/prd.md` — product boundary and 57 requirements/28 scenarios; reference only unless an inconsistency is found.
- `docs/design/tui-wireframes.md` — approved interaction, screen, breakpoint, and spike contracts; reference only.
- `docs/research/technical-comparison.md` — source-evidence boundaries and adapter risks; reference only.
- `package.json`, `nx.json`, `bun.lock`, TypeScript/test configuration — absent; introduced only by the first implementation change.
- `apps/` and `packages/` — absent; future application and consumable contract locations, never planned as layer-only deliveries.

### Approaches
1. **One large MVP change with internal delivery slices** — retain one OpenSpec change through packaging and make the slices implementation tasks.
   - Pros: one traceability chain from PRD to MVP; no inter-change dependency administration.
   - Cons: changes state and review context become too broad; Pi/Gentle AI source uncertainty blocks unrelated synthetic UI work; several slices necessarily exceed the 800-line budget.
   - Effort: High.

2. **Dependent functional changes with gated source spikes** — make each user/developer-visible capability a change, keep synthetic evidence independent from real adapters, and put capability probes as the first reversible work unit of their adapter change.
   - Pros: each change is runnable, testable, and revertible; unknown external contracts do not block the shell; changes can be chained when they approach the review budget; protects the RDD/privacy boundary with focused review.
   - Cons: requires explicit dependency tracking and a little more proposal/spec administration.
   - Effort: Medium.

### Recommendation
Use **multiple dependent functional changes**. This is the smallest durable structure: a single change would combine independent platform, UI, source-contract, durability, privacy, and distribution risks and cannot responsibly stay under the 800-line budget.

Recommended change chain (each is a deliverable, not a file/layer batch):

1. **`bootstrap-workspace-toolchain`** — an operational Nx/Bun workspace with one pinned compatibility matrix, a root test/quality/typecheck command set, and a documented local developer path. Proof: a fresh checkout runs the commands and a smoke test. Rollback: remove root workspace/tooling files only. Target: 250–500 authored lines.
2. **`synthetic-tui-shell`** — a runnable OpenTUI Solid shell with deterministic synthetic Runtime and Process overview records, keyboard navigation, source-health separation, resize/too-small handling, and no-color/ASCII proof. Proof: a user can run the TUI and navigate the approved overview; `testRender` verifies interaction at wide/compact/too-small dimensions. Rollback: remove the app and its synthetic fixture entry point without changing source adapters. Target: 500–800 lines; use a chained PR if the UI snapshots/fixtures push it beyond budget.
3. **`observable-domain-state`** — versioned event/provenance/capability contracts and normalized state consumed by the running synthetic shell, including generic recognized-process, unsupported, and separate-plane states. Proof: changing a synthetic fixture changes the visible TUI through the public contract; contract and component tests travel together. Rollback: revert the contract-backed synthetic path as one unit. Target: 600–800 lines.
4. **`synthetic-evidence-integration`** — an integration harness proving stream/batch input → idempotent normalized state → rendered TUI behavior, including ordering/degraded state. Proof: fixture-driven integration tests and a runnable deterministic scenario. Rollback: remove the harness and its stream scenario without changing real connectors. Target: 500–750 lines.
5. **`pi-runtime-observation`** — first run a thin read-only Pi capability spike, then ship only the proven Pi vertical slice: stable identity, explicit parent hierarchy, model/config allowlist, and/or history/replay exactly as evidenced. Proof: recorded capability matrix plus fixture/live-adapter tests; unsupported capabilities render honestly. Rollback: disable the Pi adapter while retaining synthetic contracts. Target: split the spike and adapter implementation into chained PRs if either exceeds 800 lines.
6. **`gentle-ai-process-observation`** — first validate the stable registry/process source, then ship generic compatible non-RDD activity and only proven specialized projections. RDD filtering is pre-event/pre-persistence and tested with mixed registries; 4R uses an authority-free allowlist. Proof: generic, specialized, unknown/incompatible, and RDD-rich fixtures in the running TUI. Rollback: disable the process adapter while preserving Pi/synthetic operation. Target: two chained PRs are likely (generic/denylist, then specializations), each 500–800 lines.
7. **`trace-replay-resilience-privacy`** — bounded retention/pagination, atomic cursor-plus-state commits, duplicate/gap/restart recovery, source isolation, and source-boundary metadata redaction. Proof: deterministic live/replay projections and fixtures proving excluded bodies/RDD authority fields never reach queues, diagnostics, storage, or UI. Rollback: remove durable observation storage behind a feature boundary; never leave partial cursor semantics. Target: split into replay/resilience and privacy/retention changes if the forecast exceeds 800 lines.
8. **`cross-platform-distribution`** — documented Linux/macOS startup and compiled Bun artifacts, actionable local errors, and no Vite/hosted dependency. Proof: platform target builds and startup smoke tests. Rollback: remove packaging scripts/artifacts without affecting development execution. Target: 300–600 lines.

The first change is a developer-usable operational foundation, not a layer dump: it establishes the executable feedback loop required by every later outcome. The first **operator-visible** deliverable is `synthetic-tui-shell`; users can run the local TUI, move focus with the approved keys, switch evidence planes, and observe deterministic compact/too-small states using synthetic metadata. It explicitly excludes real Pi/Gentle AI discovery, persistence, timelines/detail screens, Termcn ports, packaging, and all RDD semantics.

Verification categories for the first two changes are: dependency/version lock inspection; formatting/lint/typecheck; test-runner smoke; OpenTUI `testRender` interaction/resize snapshots; manually runnable TUI smoke; and documentation command verification. Activate Strict TDD immediately **after** `bootstrap-workspace-toolchain` proves a repeatable runner and test command. From `synthetic-tui-shell` forward, each behavioral work unit follows RED → GREEN → REFACTOR; the bootstrap itself may establish the runner first, with its own smoke tests as its acceptance proof.

Required spikes before proposal commitments:

| Spike | Commitment it gates | Minimum exit evidence |
|---|---|---|
| OpenTUI/Solid/Effect Atom Solid compatibility | exact dependency pins and application binding design | install/build/typecheck/testRender matrix under Bun with keyboard, resize, and input scope |
| TS7/`@effect/tsgo` | making tsgo required rather than optional quality tooling | project-reference/typecheck matrix on the chosen JSX/Effect packages; documented `tsc` fallback |
| Termcn selective port | any Termcn dependency or shared component promise | one nonessential Solid/OpenTUI port builds under Bun and preserves keyboard/no-color fallback; otherwise use local primitives |
| Pi source capability | Pi identity/liveness/hierarchy/history/tree/model promises | read-only fixture/live probe that independently marks each capability proven, unavailable, or unsupported |
| Gentle AI source/registry and 4R separation | generic compatibility rule and specialized process claims | stable versioned source, mixed registry fixtures, pre-projection RDD rejection, and field allowlist audit |
| Bun/OpenTUI packaging | portable executable promise | Linux and macOS target builds plus supported-terminal startup smoke |

Open decisions to resolve in the gated proposals are: the exact Pi stable surface and lifecycle policy; Gentle AI compatibility/version source; the 4R field allowlist; RDD diagnostic visibility versus silent omission; model/config privacy allowlist and retention defaults; default repository discovery/freshness/terminal behavior; and fallback keys if `Alt+Arrow` is unreliable. Do not promise any of these before the relevant spike passes.

### Risks
- TypeScript 7/tsgo and Effect 4 RC are moving targets; exact pins, a compatibility matrix, and an explicit fallback are required.
- Pi history/tree/identity/liveness semantics may not support the PRD breadth; only probe-proven capabilities may ship.
- Gentle AI generic coverage can accidentally certify prompt execution or leak RDD/4R authority; enforce classification, denylist, and allowlist before shared state.
- OpenTUI streaming focus/offset, key chords, Unicode width, and cross-terminal packaging need real Linux/macOS probes, not documentation-only confidence.
- Trace recovery, privacy, and retention have coupled correctness properties; do not merge them into an adapter/UI change merely to reduce change count.
- The root has no commits and all files are untracked, so baseline ownership and first-change diff size must be measured before apply; under `ask-on-risk`, request a chaining decision when a work unit forecasts over 800 changed lines.

### Ready for Proposal
Yes, with the recommended first named change **`bootstrap-workspace-toolchain`**. Its proposal must state that it establishes the quality/test feedback loop only, keep dependency choices conditional on the compatibility spike, and define `synthetic-tui-shell` as the next user-visible dependent change. Proposals for Pi, Gentle AI, resilience/privacy, and packaging must remain gated by their listed spikes rather than committing undocumented source semantics.
