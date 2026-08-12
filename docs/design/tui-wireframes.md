# Gentle Observe TUI Wireframes

# Gentle Observe TUI Wireframes

> Pre-SDD UI/UX design artifact. These terminal croquis define an achievable interaction model for SolidJS and OpenTUI. They are not pixel-perfect mocks or implementation specifications.

## Design Outcome

Gentle Observe uses one keyboard-first terminal shell to inspect two evidence planes without merging their claims:

- **Runtime plane:** Pi sessions, agents, explicit subagents, live and historical trace, model identity, effort/reasoning configuration, and runtime provenance.
- **Process plane:** recognized, compatible, observable non-RDD Gentle AI activity, rendered through generic or specialized projections with independent status, freshness, and provenance.

The interface is deliberately simple, dense, metadata-only, local, and read-only. It makes evidence from nondeterministic LLM execution deterministically inspectable; it does not claim reproducible output, expose sensitive bodies, infer hidden hierarchy, or authorize any process action.

## Review Path

1. Confirm the screenshot-derived patterns in [Reference Analysis](#reference-analysis).
2. Confirm the shell and collision-free [Keyboard Map](#exact-keyboard-map).
3. Review the eight [Screen Contracts and Wireframes](#screen-contracts-and-wireframes).
4. Validate terminal feasibility in [Component Inventory](#component-inventory).
5. Resolve the spikes and open questions before SDD.

## Reference Analysis

All seven PNG files were opened and visually inspected on 2026-08-12. Each row separates **visual fact** from **design inference**. Text hidden by truncation, video controls, pointer highlights, or image framing is not reconstructed.

| Screenshot | Visible layout: visual fact | Information hierarchy: visual fact | Visible controls and design inference | Retain | Avoid or adapt for terminal |
|---|---|---|---|---|---|
| `Captura de pantalla 2026-08-12 a la(s) 14.52.45.png` (`1882x792`) | A selected `plan` detail spans the width. A left column contains agent configuration and collapsed sections; a larger right column contains a timestamped event list. Header chips show success, duration, owner, kind, and attempt. | Phase identity/status first, then configuration and event chronology. Event rows expose time, type, short label, and some durations. | Fact: collapsible chevrons, close control, section counts. Inference: phase blocks drill into a persistent detail region. | Split summary/evidence layout; compact metadata chips; chronological event table. | Do not reproduce translucent background, pointer spotlight, hidden hover controls, payload bodies, or wide chip ornamentation. Use text labels and explicit focus.
| `Captura de pantalla 2026-08-12 a la(s) 14.52.20.png` (`1880x994`) | A continuation of the event column shows dense rows including `thinking`, `tool_call`, `gate_pass`, and logs. Durations align at the right edge. | Time and event class support rapid vertical scanning; latest events appear lower in the list. | Fact: repeated event rows; no visible pagination control. Inference: detail can scroll independently. | Fixed metadata columns and right-aligned duration; dense scan rhythm. | Gentle Observe must omit thought, prompt, tool arguments, and results. Replace body snippets with allowlisted metadata and bounded/paginated history.
| `Captura de pantalla 2026-08-12 a la(s) 14.52.04.png` (`1900x376`) | A compact `request` detail shows a header, four collapsed left sections, and six events on the right. Considerable surrounding black area comes from the screenshot framing. | The short phase remains structurally identical to the larger detail view. | Fact: section chevrons and close control. Inference: one detail template supports phases with sparse evidence. | Stable detail anatomy for sparse and rich entities. | Do not reserve empty panels when data is absent; collapse to a concise state in short terminals.
| `Captura de pantalla 2026-08-12 a la(s) 14.51.38.png` (`1934x1110`) | A session trace uses horizontal time ticks and stacked lanes for engineer, code, planner, and builder. Rectangular phase blocks show status, title, description, duration, and internal tick marks. A run strip shows running state and aggregate statistics. | Run context first; time axis second; actor lanes and phase blocks dominate; model names sit beside actor labels. | Fact: phase blocks appear selectable; one block has a stronger outline. Inference: selecting a phase opens its detail below. | Actor lanes over shared time; selected block outline; duration and current-running distinction; model near actor. | Terminal cells cannot support free-positioned cards faithfully. Quantize spans to columns, guarantee minimum width, and expose exact times in the selected item summary.
| `Captura de pantalla 2026-08-12 a la(s) 14.51.21.png` (`1928x1124`) | A sessions page contains one large run card in a grid area. The card shows run ID/name, truncated request, miniature planner/builder timeline, status, phase dots, start time, and numeric chips. A `live` indicator appears in the top bar. | Collection count, then run card identity/task, miniature activity, status, and aggregate metrics. | Fact: the whole card has a strong border; no persistent card action is visible. Inference: cards open session trace. | Overview grid of equal-height cards; miniature activity summary; source-wide live context. | Do not use truncation without a detail path, color-only phase dots, cost/token prominence, or mouse-only card activation. Gentle Observe prioritizes freshness, provenance, model/config, and evidence gaps.
| `Captura de pantalla 2026-08-12 a la(s) 14.47.18.png` (`1930x992`) | The same single-card sessions view is shown with slightly different framing and without the full application header. | Same hierarchy as `14.51.21`; card content remains legible without the shell. | Fact: card contains a lane mini-timeline and running status. Inference: card anatomy is reusable independently of page chrome. | Self-contained process/agent box summaries that survive grid reflow. | Never rely on ambient page context to identify repository/session/evidence plane; repeat concise context in each card.
| `Captura de pantalla 2026-08-12 a la(s) 14.41.43.png` (`1942x1060`) | A video frame shows the lane timeline above and an open `plan` detail below. Playback controls and progress bar overlay the bottom. | Overview-to-detail continuity is visible in one viewport: run strip, timeline, selected phase, then evidence. | Fact: selected `plan` block corresponds to the open `plan` detail. Inference: context is preserved during drill-down rather than replaced completely. | Preserve selection and trace context while opening detail; use a stable breadcrumb. | Do not copy video controls, animated glow, pointer spotlight, or web-only vertical abundance. In a TUI, detail becomes a route or split pane according to available rows.

### Reference Synthesis

The Just Obs reference succeeds because it gives a session a recognizable shape: collection card, shared time axis, actor lanes, selectable phase, then detailed evidence. Gentle Observe retains that progression while changing the semantics and implementation:

- Cards represent Pi runtime subjects and Gentle AI processes as separately labeled evidence-plane items.
- Lanes never imply a parent/subagent edge unless Pi supplies one explicitly.
- Process phase and actor activity never imply runtime liveness.
- Event rows contain metadata only; no prompt, thought, message, tool argument, or tool result body is rendered.
- Web effects become terminal-safe borders, glyphs, labels, selection markers, and key hints.
- History is bounded and paginated rather than accumulated without limit.

## Design Principles

| Principle | UI consequence |
|---|---|
| Evidence planes remain separate | Runtime and Process are distinct tabs, badges, status vocabularies, filters, and provenance fields. Correlation is an evidence-bearing link, not identity. |
| Answer one operational question per screen | Overview answers “what needs attention?”; timeline answers “what happened when?”; detail answers “what evidence supports this subject?” |
| Deterministic projection | Stable sort, tie-break, lane ordering, truncation, and timestamp rules produce the same screen from the same accepted evidence. |
| Honest unknowns | Unknown, unavailable, unsupported, stale, degraded, gaps, and out-of-scope evidence are rendered explicitly; blank never means healthy. |
| Density without hidden meaning | Compact rows are allowed, but focus, status, plane, freshness, and provenance always have text or glyph fallbacks. |
| Keyboard before decoration | Every operation is reachable without a pointer; focus is always visible; footer hints reflect the active region. |
| Read-only history | Historical selection changes inspection position only. There is no checkout, resume, rewind, fork, branch, retry, archive, approval, or delivery action. |
| Metadata-only privacy | Tables show allowlisted identities, classifications, timestamps, durations, counts, provenance, and confidence, never excluded content bodies. |
| Basic primitives first | Boxes, text, scroll areas, tabs, and tables carry the MVP. Termcn is inspiration, not a runtime dependency or assumed Solid-compatible library. |

## Information Architecture

```text
Gentle Observe
|
+-- Repository index / current repository
|   +-- Runtime plane
|   |   +-- Pi session
|   |       +-- top-level Agent
|   |           +-- explicit Subagent (only when supplied by Pi)
|   |           +-- live/historical Trace
|   |           +-- Activity metadata
|   +-- Process plane
|       +-- Generic recognized non-RDD Process
|       +-- SDD Process
|       |   +-- canonical phase
|       |   +-- artifacts / attempts / dependencies
|       |   +-- Strict TDD evidence under apply or verify
|       +-- Judgment Day Process
|       +-- Agent Builder Process
|       +-- SDD Explore / SDD Tasks specialization
|       +-- authority-free 4R / refuter activity
|
+-- Cross-cutting
    +-- source health and capabilities
    +-- provenance, confidence, freshness, gaps
    +-- search/filter
    +-- help
```

Runtime and process records may share a repository and may have a supported correlation. They do not share identity or status.

## Global Shell Anatomy

```text
+ Gentle Observe | repo: gentle-observe | session: pi-8f25 | process: SDD apply -----+
| Runtime: LIVE observed 0.4s | Process: REPORTED active 1.8s | sources: Pi OK GA ! |
+----------------------------------------------------------------------------------+
| [Overview] [Timeline] [Agent] [Activity] [Process]                                |
|                                                                                  |
|                              MAIN VIEWPORT                                       |
|                                                                                  |
+----------------------------------------------------------------------------------+
| FOLLOW  now  seq 1842/1842 | / filter | Tab plane | Enter open | ? help | q quit |
+----------------------------------------------------------------------------------+
```

| Region | Required content | Behavior |
|---|---|---|
| Header/context | Product, canonical repository, selected session, selected process; unknown values rendered as `? unknown` | One or two rows. Truncate middle segments only after preserving field labels and suffix identities. |
| Source health | Pi and Gentle AI availability, freshness, confidence/evidence class where relevant | Never collapse two sources into one health indicator. A failed source does not recolor healthy evidence. |
| Route tabs | Current screen set with active tab in brackets or inverse style | `1`-`5` select stable top-level routes; unavailable routes remain labeled and explain why. |
| Main viewport | One focused region or, when space allows, primary/secondary split | Region focus order is deterministic and visible. Each scroll area has its own position indicator. |
| Footer/status | Follow/pause mode, historical position, gap state, active filter count, contextual key hints | Always visible except in too-small state, where one diagnostic line replaces the app. |

## Navigation Model

Navigation has three layers:

1. **Route navigation:** stable numbered screens inside the current repository/session/process context.
2. **Region navigation:** `Tab` and `Shift+Tab` move between visible panes or evidence-plane tabs.
3. **Item navigation:** arrows or Vim movement move within grids, trees, timelines, and tables.

Opening an item preserves the previous route, focus identity, scroll offset, filter, and selected evidence plane. `Esc` returns one level and restores that context. If resize removes a pane, its focus moves to the nearest retained region without losing item selection.

### Exact Keyboard Map

Keys are active only in the stated scope. Text entry captures printable keys until `Enter` or `Esc`, avoiding navigation conflicts.

| Scope | Key | Action |
|---|---|---|
| Global | `1` | Repository/session overview |
| Global | `2` | Process/agent trace timeline |
| Global | `3` | Selected Agent/Subagent detail |
| Global | `4` | Activity/log metadata table |
| Global | `5` | Selected Gentle AI process view |
| Global | `Tab` / `Shift+Tab` | Next / previous visible region or evidence-plane tab |
| Global | `/` | Open search/filter input for the active screen |
| Global | `f` | Toggle follow-live; from historical selection, jump to newest trusted position and follow |
| Global | `Space` | Pause/resume streaming viewport; ingestion continues while paused |
| Global | `[` / `]` | Previous / next retained historical page or time window |
| Global | `g` / `G` | First / newest trusted item in active collection; `G` does not resume mutation |
| Global | `r` | Request source refresh/reconciliation only; never retry or mutate an observed run |
| Global | `?` | Open contextual help overlay |
| Global | `Esc` | Close overlay/input, then drill back one route level |
| Global | `q` | Quit only when no text input or overlay is active |
| Grid | Arrow keys | Spatial card movement |
| Grid | `h` `j` `k` `l` | Left / down / up / right card movement |
| Tree/table/list | `j` / `Down`, `k` / `Up` | Next / previous visible row |
| Tree | `h` / `Left`, `l` / `Right` | Collapse / expand explicit hierarchy node |
| Timeline | `h` / `Left`, `l` / `Right` | Previous / next selectable span or event in current lane |
| Timeline | `j` / `Down`, `k` / `Up` | Next / previous lane, retaining nearest time position |
| Timeline | `-` / `=` | Zoom out / in around selected historical position |
| Any collection | `Enter` | Open selected item or drill into selected span |
| Any drill-down | `Backspace` | Same as one-level back when no text input is active |
| Tabs within screen | `Alt+Left` / `Alt+Right` | Previous / next local tab without changing item focus |
| Search/filter input | Printable text | Edit query |
| Search/filter input | `Enter` | Apply query and return focus to results |
| Search/filter input | `Esc` | Cancel edit and restore prior applied query |
| Search/filter input | `Ctrl+U` | Clear current input |
| Table | `s` | Cycle sort key shown in column header; deterministic direction sequence |
| Table | `c` | Open column visibility overlay; metadata fields only |

Conflict decisions:

- `Space` controls viewport pause, while `f` controls follow-live. This keeps “paused at now” distinct from “historically detached.”
- `r` means source refresh only. It cannot be confused with retrying agents, review, receipts, or resume.
- `[` and `]` traverse bounded history windows; timeline item movement stays on `h`/`l` or arrows.
- `q` is suppressed during text input, so search terms can contain `q`.
- No key maps to checkout, resume, branch, fork, approval, gate, archive, or delivery.

## Screen Map and Transitions

```text
                         +------------------+
                 +------>|  ? Help overlay  |
                 |       +------------------+
                 |                |
                 | Esc            | Esc
                 |                v
+----------------+---+  Enter  +------------------+  Enter  +------------------+
| 1 Overview         |-------->| 2 Timeline       |-------->| 3 Agent detail   |
| Runtime | Process  |         | lanes + history  |         | tree + metadata  |
+----+----------+----+         +---------+--------+         +---------+--------+
     |          |                        |                            |
     | Enter    | Enter                  | 4                          | 4
     v          v                        v                            v
+-----------+ +----------------+   +-------------------------------------------+
| Pi agent  | | Gentle process |   | 4 Activity metadata table                 |
| selection | | selection      |   +-------------------------------------------+
+-----------+ +-------+--------+
                       |
                       | 5 / Enter
                       v
                 +------------------+
                 | 5 Process view   |
                 | SDD / JD / 4R /  |
                 | generic          |
                 +------------------+
```

`Esc` reverses each `Enter` transition and restores prior focus. Number keys are direct read-only routes, not a browser-like history mutation. Unsupported routes open an explanatory unavailable state rather than silently redirecting.

## Screen Contracts and Wireframes

### 1. Repository and Session Overview

**Purpose:** triage repositories, Pi sessions/agents, and Gentle AI processes without conflating evidence planes.

**Primary question:** What is running, active, stale, degraded, or unsupported, and where should I inspect next?

```text
+ Gentle Observe | repo: gentle-observe | all sessions -------------------------------+
| Pi: OK observed 0.4s | Gentle AI: DEGRADED reported 1.8s | filter: none             |
+-------------------------------------------------------------------------------------+
| [Runtime 3]  Process 2                                     sort: attention, newest   |
|                                                                                     |
| >+ Agent planner ---------------------+  + Agent builder ---------------------------+|
|  | LIVE  observed 0.4s  seq 1842     |  | IDLE  observed 8.2s  seq 1810           ||
|  | session pi-8f25  parent: none      |  | session pi-8f25  parent: planner [exp]  ||
|  | model gemini-3.6-flash effort high |  | model deepseek-v4 effort ? unknown      ||
|  | trace  [..:::#] now  gap none      |  | trace  [..::..] -32s  gap none          ||
|  | process link: SDD apply [reported] |  | process link: SDD apply [reported]      ||
|  +------------------------------------+  +------------------------------------------+|
|                                                                                     |
|  + Agent verifier --------------------+  + Pi unavailable -------------------------+|
|  | ENDED observed 12m  seq 903        |  | permission denied                      ||
|  | session pi-71aa parent: none       |  | Process evidence remains available     ||
|  | model ? unknown effort ? unknown   |  | Press Enter for source diagnostics     ||
|  +------------------------------------+  +------------------------------------------+|
|                                                                                     |
+-------------------------------------------------------------------------------------+
| FOLLOW | arrows/hjkl move | Tab plane | Enter open | / filter | Space pause | ? help |
+-------------------------------------------------------------------------------------+
```

| Contract | Decision |
|---|---|
| Regions | Context header, plane tabs, card grid, source-health card/diagnostic, footer. |
| Focus order | Plane tabs, first attention-ranked card, remaining cards row-major, source diagnostic. |
| Actions | Switch plane, move, filter, sort, open session/agent/process, pause/follow, refresh source. |
| States | Discovering, populated, no repositories, no matching records, source unavailable, stale, degraded/gap, unsupported process. |
| Minimum data | Repository identity; evidence plane; subject identity; source; availability; observation timestamp/freshness. Model/config and correlation are optional and explicitly unknown. |
| Responsive behavior | Wide: 3 cards; standard: 2; compact: 1 list-like card per row; low rows: one-line rows instead of full cards. Runtime and Process remain separate tabs at every width. |
| PRD links | G-01, G-02, G-06, G-09; FR-001-FR-011, FR-033, FR-040-FR-046, FR-055-FR-057; AC-001-AC-003, AC-019-AC-020, AC-023-AC-024, AC-026-AC-028. |

### 2. Process and Agent Trace Timeline

**Purpose:** inspect temporal relationships among Pi runtime actors and correlated Gentle AI phases/actors while preserving separate evidence claims.

**Primary question:** What happened when, on which evidence plane, and what is selected now?

```text
+ Gentle Observe | repo gentle-observe | session pi-8f25 | window 14:28:00..14:34:00 -+
| Runtime LIVE observed 0.4s | Process SDD apply REPORTED 1.8s | FOLLOW | zoom 1m/12c |
+-------------------------------------------------------------------------------------+
|                 28:00       29:00       30:00       31:00       32:00       NOW      |
| RUNTIME --------------------------------------------------------------------------- |
| planner       |====plan=======|......|====coordinate=========================>>|     |
|   builder     |           |===build===================|                       |     |
|   verifier    |                                  |==verify==|                 |     |
|               explicit parent indent only                         ^ selected  |     |
| PROCESS --------------------------------------------------------------------------- |
| SDD           |[tasks:R].....[apply:R================]...[verify:?]            |     |
| Strict TDD    |                  red:R green:O refactor:?                      |     |
|               R=reported O=Pi-observed ?=unknown                              |     |
|                                                                                     |
| Selected: planner/coordinate | 14:31:42.220..open | 2m18s | source Pi | seq 1839    |
+-------------------------------------------------------------------------------------+
| FOLLOW now 1842/1842 | hjkl/arrows move | -= zoom | [] window | Enter detail | 4 log |
+-------------------------------------------------------------------------------------+
```

| Contract | Decision |
|---|---|
| Regions | Run context, shared time axis, Runtime lane group, Process lane group, selected-item summary, footer. |
| Focus order | Selected lane/span, then other lanes by defined order, selected summary, local plane tabs if present. |
| Actions | Move lanes/spans, zoom, traverse history windows, pause/follow, open Agent/process/span detail, open filtered activity table. |
| States | Live follow, live paused, historical detached, ended, gap/degraded, unknown span, no timing capability, no explicit hierarchy. |
| Minimum data | Subject identity, plane, start/order evidence, source, confidence, freshness. End/duration, parent, model, and correlation remain optional. |
| Responsive behavior | Wide: both groups with full labels and summary; standard: abbreviated lane labels; compact: one plane at a time via tabs and list-like spans; too few rows: selected lane plus adjacent lane count. |
| PRD links | G-02, G-03, G-05, G-06; FR-009-FR-016, FR-017-FR-022, FR-035-FR-046; AC-002-AC-010, AC-021, AC-024. |

### 3. Agent and Subagent Detail

**Purpose:** inspect one Pi Agent at a deterministic trace position with explicit hierarchy, history, model/configuration, and process context.

**Primary question:** What evidence describes this Agent at the selected trace position?

```text
+ Agent detail | planner | session pi-8f25 | position 1839/1842 | HISTORICAL --------+
| status at selection: LIVE* | selected 14:31:42.220 | freshness then: 0.3s           |
| *historical status label; current source status shown separately: LIVE observed 0.4s|
+--------------------------------------+----------------------------------------------+
| Trace tree / history                 | Agent evidence                               |
| > planner [top-level]                | model       gemini-3.6-flash                 |
|   + builder [explicit]               | provider    google [reported by Pi]          |
|   | + verifier [explicit]            | effort      high [observed, seq 1701]        |
|   + researcher [explicit]            | reasoning   enabled [allowlisted config]      |
|                                      | tools       count 6; identities allowlisted  |
| History                              | process     SDD apply [correlated, reported]  |
|   1837 agent_start                   | parent      none [Pi hierarchy capability]    |
| > 1839 activity                      | source      Pi / adapter v1                   |
|   1840 tool_call metadata            | provenance  event pi:e-1839                   |
|   1841 activity                      | freshness   historical selection             |
|   1842 activity [current]            | config gaps thinking budget: unknown         |
+--------------------------------------+----------------------------------------------+
| READ ONLY | jk row | hl tree | [] page | g/G first/newest | 2 timeline | 4 activity  |
+-------------------------------------------------------------------------------------+
```

| Contract | Decision |
|---|---|
| Regions | Identity/status strip, explicit hierarchy and history, evidence metadata, footer. |
| Focus order | Current Agent node, current history row, metadata groups, correlated process link. |
| Actions | Expand explicit children, move history, open event metadata, return to timeline, open correlated process. No runtime control action. |
| States | Current, historical, ended, hierarchy unsupported, flat agents, no model/config capability, partial provenance, stale source. |
| Minimum data | Agent and session identity, source, selected trace position/order, provenance/freshness. Explicit parent and metadata appear only when supplied. |
| Responsive behavior | Wide: tree/history beside evidence; standard: 40/60 split; compact: local tabs `History | Evidence | Context`; short: table rows scroll under fixed identity strip. |
| PRD links | G-02, G-05, G-07; FR-008-FR-016, FR-040, FR-046-FR-050; AC-001-AC-006, AC-022, AC-024. |

### 4. Activity and Log Metadata Table

**Purpose:** scan and filter bounded metadata events without exposing excluded bodies.

**Primary question:** Which metadata events match this investigation, and what are their provenance and timing?

```text
+ Activity | repo gentle-observe | plane ALL | 38 rows | retained page 4/12 ---------+
| filter: type:tool_call OR severity:error   source:all   confidence:all   [APPLIED]   |
+-------------------------------------------------------------------------------------+
|   TIME              PLANE    SUBJECT       TYPE          STATUS  DUR     SRC   CONF   |
| > 14:31:42.220      runtime  planner       tool_call     ok      84ms    Pi    obs    |
|   14:31:43.018      runtime  builder       agent_start   ok      --      Pi    obs    |
|   14:31:45.401      process  SDD/apply     artifact      present --      GA    auth*  |
|   14:31:47.992      process  JD/judge-a    actor_end     reported 12s    GA    rep    |
|   ? unknown         runtime  verifier      ordering_gap  DEGRADED --     Pi    unk    |
|                                                                                     |
| Selected metadata                                                                   |
| id pi:e-1839 | seq 1839 | received 14:31:42.304 | fresh 84ms | payload excluded     |
| *authoritative only for named artifact existence; never delivery authority          |
+-------------------------------------------------------------------------------------+
| jk row | / filter | s sort | c columns | [] page | Enter metadata | Esc back | ? help|
+-------------------------------------------------------------------------------------+
```

| Contract | Decision |
|---|---|
| Regions | Filter summary/input, column header, virtualized/paginated rows, selected metadata summary, footer. |
| Focus order | Filter control, selected row, sortable header/column overlay, selected metadata. |
| Actions | Search, filter, sort, choose allowlisted columns, page history, open metadata-only detail. |
| States | Populated, no matches, retention boundary, gap, malformed/redacted upstream record, source unavailable, loading page. |
| Minimum data | Stable event identity, plane, subject, type/classification, source, evidence confidence, timestamp or ordering evidence, freshness/missingness. |
| Responsive behavior | Wide: all columns; standard: omit duration then confidence only if repeated in selected summary; compact: `time plane subject type status`, with detail below; never horizontally scroll essential identity/status. |
| PRD links | G-05-G-07; FR-012-FR-016, FR-035-FR-043, FR-046-FR-051; AC-004-AC-006, AC-021-AC-023. |

### 5. Gentle AI SDD Process with Embedded Strict TDD

**Purpose:** inspect canonical SDD progress, artifacts, attempts, dependencies, and only evidenced Strict TDD cycles under apply/verify.

**Primary question:** What does Gentle AI report about this SDD change, and what runtime evidence independently supports it?

```text
+ Process | SDD change: observe-tui | REPORTED active | fresh 1.8s | Pi: LIVE 0.4s ---+
| Plane: PROCESS | source Gentle AI | correlated runtime: pi-8f25 [confidence medium] |
+-------------------------------------------------------------------------------------+
| Phase progress                                                                       |
| [init +] [explore +] [propose +] [spec +] [design +] [tasks +] [apply >] [verify ?] |
| [archive .] [onboard n/a]     + reported complete  > active  ? unknown  . not started|
|                                                                                     |
| > apply  attempt 2/3  reported active  started 14:28:43  fresh 1.8s                 |
|   dependencies: tasks artifact present [authoritative: artifact existence only]     |
|   artifacts: proposal present | specs present | design present | tasks present       |
|                                                                                     |
| Strict TDD evidence (embedded in apply; NOT a standalone process)                   |
|   cycle 3  RED reported 14:29:10 | GREEN Pi-observed 14:30:31 | REFACTOR unknown     |
|   prescribed guidance alone is not execution evidence                               |
|                                                                                     |
| Runtime plane summary: planner LIVE; builder IDLE; no liveness derived from SDD      |
+-------------------------------------------------------------------------------------+
| Alt+Left/Right phase | jk evidence | Enter detail | 2 timeline | 4 activity | Esc back|
+-------------------------------------------------------------------------------------+
```

| Contract | Decision |
|---|---|
| Regions | Process/source strip, canonical phase progress, selected phase evidence, embedded Strict TDD section for apply/verify, independent runtime summary. |
| Focus order | Current/selected SDD phase, artifact/dependency rows, Strict TDD cycles, runtime correlation. |
| Actions | Select phase, inspect metadata/artifact evidence, open correlated runtime timeline/activity. No phase transition or artifact mutation. |
| States | Reported active/terminal, missing artifact, unknown cycle, stale/degraded source, unsupported SDD version, no Pi correlation. |
| Minimum data | Canonical SDD identity/phase, source, lifecycle/activity, provenance, freshness, capability/missingness. Strict TDD section requires apply/verify context but may honestly contain `unknown`. |
| Responsive behavior | Wide: phase ribbon plus evidence sections; standard: phase ribbon wraps once; compact: vertical phase list with current and completed counts; Strict TDD remains nested under selected apply/verify. |
| PRD links | G-03, G-05-G-07; FR-017-FR-022, FR-033, FR-040, FR-046-FR-050; AC-007-AC-010, AC-015, AC-022-AC-024. |

### 6. Judgment Day and Authority-Free 4R Activity

**Purpose:** inspect review actors, selected lenses, bounded fix/refuter activity, and safe finding metadata without importing RDD or delivery semantics.

**Primary question:** Which review actors and lenses ran, what did their metadata report, and what evidence is unavailable or explicitly out of scope?

```text
+ Process | Judgment Day jd-204 | terminal REPORTED: changes-requested | fresh 22s ---+
| AUTHORITY-FREE VIEW: no receipts, approval, gates, lineage, worktree, or delivery   |
+-------------------------------------------------------------------------------------+
| Actors / lenses                    | Finding metadata                               |
| > jd-judge-a     ended  reported   | F-17  risk         high    open    judge-a      |
|   jd-judge-b     ended  observed   | F-18  reliability  medium  fixed?  unknown      |
|   jd-fix-agent   unknown           | F-19  readability  low     closed  reported     |
|   risk           selected reported |                                                |
|   readability    selected reported | Selected F-17                                  |
|   reliability    selected observed | source Gentle AI | actor judge-a | fresh 31s    |
|   resilience     not selected      | status reported; not approval                  |
|   refuter        ended  reported   | body excluded | receipt fields out of scope     |
|                                      |                                                |
| Runtime correlation: judge-b agent pi-a92 [observed; explicit correlation]           |
+-------------------------------------------------------------------------------------+
| NO DELIVERY AUTHORITY | Tab actors/findings | jk move | Enter metadata | 4 activity  |
+-------------------------------------------------------------------------------------+
```

| Contract | Decision |
|---|---|
| Regions | Persistent authority-free boundary, actor/lens list, allowlisted finding table/detail, runtime correlation, footer. |
| Focus order | Actor/lens activity, finding rows, selected finding metadata, runtime correlation. Boundary copy is always visible but not focusable. |
| Actions | Filter actors/findings, inspect metadata, open correlated runtime/activity. No approve, reject, gate, fix, receipt, or delivery action. |
| States | Running/reported terminal, one/both judges missing, fix activity unknown, lens not selected, finding metadata unavailable, RDD evidence omitted/out of scope, source degraded. |
| Minimum data | Canonical process/actor or lens identity, lifecycle/activity, source, provenance, freshness, confidence. Finding identity/category/severity/status are optional allowlisted metadata. |
| Responsive behavior | Wide: actors and findings split; standard: 40/60 split; compact: `Actors | Findings` tabs with authority-free line fixed under header; too-short view still retains boundary copy. |
| PRD links | G-04, G-06, G-07; FR-023-FR-034, FR-046-FR-050, FR-057; AC-011-AC-019, AC-022-AC-024, AC-028. |

### 7. Generic Non-RDD Gentle AI Process

**Purpose:** provide a canonical bounded view for recognized, compatible, stably observable non-RDD activity without inventing specialized semantics.

**Primary question:** What safe activity is known for this recognized process, and which capabilities are unavailable?

```text
+ Process | skill: branch-pr | category delivery-support | REPORTED ended | fresh 2m -+
| Generic recognized non-RDD projection | adapter gentle-ai v1 | schema ga.process/1  |
+-------------------------------------------------------------------------------------+
| Identity                                                                            |
| canonical id     branch-pr                                                          |
| canonical name   Branch PR                                                          |
| version          1.4 compatible                                                     |
|                                                                                     |
| Activity                                                                            |
| selected         14:20:01 reported                                                  |
| started          14:20:02 reported                                                  |
| ended            14:21:44 reported                                                  |
| terminal         ended (not approval or delivery authorization)                     |
|                                                                                     |
| Capabilities                                                                        |
| lifecycle yes | actor detail no | artifacts unsupported | runtime correlation none  |
| Missingness: no specialized projection; prescribed steps are not execution proof    |
+-------------------------------------------------------------------------------------+
| jk section | Enter metadata | 4 activity | / filter | Esc back | ? help              |
+-------------------------------------------------------------------------------------+
```

| Contract | Decision |
|---|---|
| Regions | Generic classification strip, canonical identity, lifecycle/activity, capabilities/missingness, provenance, optional runtime correlation. |
| Focus order | Lifecycle rows, capability rows, provenance, correlation. |
| Actions | Inspect metadata/activity, filter, open correlation. No skill-specific controls or inferred steps. |
| States | Active/ended/failed as reported, stale, degraded, unsupported capability, incompatible/unknown activity redirected to unsupported state, RDD filtered/out of scope. |
| Minimum data | Canonical identifier/name, category, compatible version evidence, lifecycle/activity metadata, provenance, freshness, capability, missingness. |
| Responsive behavior | Wide/standard: two-column definition list where useful; compact: one key/value row per line; unsupported records use the state pattern below rather than this generic view. |
| PRD links | G-01, G-06, G-09; FR-006-FR-007, FR-030-FR-034, FR-040, FR-046-FR-050, FR-055-FR-057; AC-018-AC-020, AC-022-AC-024, AC-026-AC-028. |

### 8. Empty, Unavailable, Degraded, Gap, and Compact States

**Purpose:** keep missingness actionable and truthful without hiding healthy evidence from the other plane.

**Primary question:** Is there no evidence, no capability, a source failure, or an integrity problem, and what safe inspection action remains?

```text
EMPTY                         UNAVAILABLE                   DEGRADED / GAP
+-------------------------+  +--------------------------+  +---------------------------+
| No Pi sessions found    |  | Pi source unavailable    |  | ! Runtime trace degraded  |
| Process: 2 records      |  | permission denied        |  | expected seq 1840          |
|                         |  |                          |  | received seq 1842          |
| Tab: inspect Process    |  | Process evidence healthy |  | last trusted: 1839         |
| r: refresh discovery    |  | Enter: diagnostics       |  | follow held; [] history    |
+-------------------------+  +--------------------------+  +---------------------------+

UNSUPPORTED / OUT OF SCOPE                    COMPACT 58x18
+------------------------------------------+  + Gentle Observe | repo gentle-ob... +
| Unsupported process                     |  | Pi OK .4s | GA ! 1.8s             |
| id: unknown-review-v9                    |  | [Runtime] Process                 |
| reason: incompatible version             |  | > planner LIVE obs .4s            |
| not coerced into a known projection      |  |   model gemini... effort high     |
| RDD identifiers are filtered before here |  |   trace ..:# now                  |
+------------------------------------------+  |   builder IDLE obs 8s [explicit]  |
                                              | 1-5 view /filter Enter open ?help |
                                              +-----------------------------------+

TOO SMALL (<50 columns or <14 rows)
+----------------------------------------------+
| Gentle Observe needs at least 50x14 cells.  |
| Current terminal: 42x11. Resize to continue.|
+----------------------------------------------+
```

| Contract | Decision |
|---|---|
| Regions | State title/glyph, affected plane/source, factual reason, last trusted position/freshness where relevant, safe next inspection action. |
| Focus order | First available action, diagnostics, alternate healthy plane. Pure empty states have no phantom focus. |
| Actions | Refresh source discovery, open diagnostics, switch healthy plane, inspect retained trusted history. |
| States | Discovering, empty, filtered-empty, unavailable, permission denied, unsupported, stale, degraded, ordered gap, out of scope, too small. |
| Minimum data | Affected plane/source and classified availability. Gap requires expected/received ordering evidence and last trusted position. |
| Responsive behavior | State copy is never truncated before reason and affected source. At less than `50x14`, replace the application with exact current/minimum dimensions. |
| PRD links | G-06-G-07, G-09; FR-002-FR-003, FR-030-FR-043, FR-045-FR-052, FR-056-FR-057; AC-003, AC-005-AC-006, AC-008-AC-010, AC-013, AC-018-AC-024, AC-027-AC-028. |

## Timeline Design

### Lane Ordering

Lane order is stable for identical evidence:

1. Runtime group before Process group; a labeled separator prevents semantic merging.
2. Runtime top-level Agents ordered by first accepted evidence, then stable identity.
3. Explicit subagents immediately follow their parent, recursively, with textual indentation and `[explicit]` in detail. Agents without explicit parents remain top-level.
4. Process lanes ordered by canonical process order where defined: SDD phases use canonical phase order; Judgment Day uses orchestrator, judge A, judge B, fix; 4R uses selected lens order Risk, Readability, Reliability, Resilience, then refuter.
5. Generic process actors use accepted start/order evidence, then canonical identity.

Absence of hierarchy capability produces a flat lane list. Visual proximity never creates a relationship.

### Time Scale and Spans

- The axis uses absolute clock labels at boundaries and elapsed duration in selected summaries.
- Zoom steps are deterministic: `100ms`, `1s`, `5s`, `30s`, `1m`, `5m`, `30m`, `2h` per 12 terminal columns.
- Each visible span receives at least three cells: status glyph, body, and edge. Exact start/end remain in the selected summary.
- Durations quantize outward to occupied cells; this improves visibility but never replaces exact metadata.
- Concurrent spans may overlap in time but occupy separate lanes. Overlap in one subject lane is stacked as numbered subrows when rows allow, or marked `+N overlap` in compact mode.
- Zero/unknown duration events use a point marker rather than a fabricated span.

### Glyph Vocabulary

| Meaning | Preferred glyph | ASCII fallback | Required text fallback |
|---|---|---|---|
| Completed span | `━` | `=` | status label in selected summary |
| Active/open span | `▶` | `>` | `active` or runtime lifecycle label |
| Point event | `◆` | `*` | event type |
| Selected position | `▲` | `^` | `selected` |
| Current trusted position | `┃` | `#` | `now` / sequence |
| Unknown span | `┄` | `?` | `unknown span` |
| Gap | `!!` | `!!` | `gap expected X received Y` |
| Explicit child indentation | `└` | `+` | `[explicit parent]` in detail |
| Reported / observed | `R` / `O` | same | full confidence in summary |

Unicode is an enhancement. `--ascii` or failed glyph-width detection switches the entire UI to the fallback set; mixed per-row fallback is forbidden because alignment would become nondeterministic.

### Current and Historical Position

- In follow mode, the viewport tracks the newest trusted event and footer says `FOLLOW`.
- `Space` freezes viewport movement while ingestion continues; footer says `PAUSED +N` where `N` is unseen accepted events.
- Moving left from the newest position sets `HISTORICAL` and selects a read-only point. The header shows status “at selection” separately from current source status.
- `f` returns to newest trusted evidence and enables follow.
- `G` moves to newest trusted evidence but does not alter a paused viewport; `f` is the explicit follow command.
- `[` and `]` request bounded previous/next windows. Retention boundaries are visible and never look like trace beginnings.

### Streaming, Gaps, and Unknowns

- Streaming appends accepted events without moving selection while paused or historical.
- A stable event identity updates no row twice; corrected upstream evidence appears as a new classified record if the contract permits it.
- An ordered gap places `!! GAP` at the break, holds the cursor at the last trusted state, marks the affected plane degraded, and disables follow past the gap.
- Evidence after a gap may be listed as untrusted metadata but cannot extend a healthy span until reconciliation closes the gap.
- Unknown start or end uses an open dotted/`?` edge and exact missingness copy in detail.
- Source clock uncertainty appears as `timestamp confidence: unknown`; ordering evidence remains separately visible.

## Visual Semantics

### Status Vocabulary

| Domain | Allowed visible vocabulary | Notes |
|---|---|---|
| Pi runtime lifecycle | `LIVE`, `IDLE`, `ENDED`, `ORPHANED`, `STALE`, `UNKNOWN` | Only when validated Pi policy supports the classification. |
| Gentle AI activity | `REPORTED ACTIVE`, `REPORTED ENDED`, `REPORTED FAILED`, `OBSERVED`, `UNKNOWN` | Never used as runtime liveness. |
| Availability | `OK`, `UNAVAILABLE`, `UNSUPPORTED`, `DEGRADED`, `STALE`, `OUT OF SCOPE`, `UNKNOWN` | Always names the affected source or capability. |
| Integrity | `TRUSTED`, `GAP`, `UNTRUSTED AFTER GAP`, `RETENTION BOUNDARY` | Independent of lifecycle. |
| Evidence confidence | `reported`, `observed`, `authoritative*`, `unknown` | `authoritative*` is followed by narrow-source scope and never means delivery authority. |

### Color and Non-Color Roles

| Role | Suggested color | Required non-color rendering |
|---|---|---|
| Healthy/current | Green | `OK`, `LIVE`, `+`, or `# now` |
| Active/follow | Cyan/blue | `FOLLOW`, `>`, or `active` |
| Selected/focus | High-contrast accent | Leading `>` plus stronger border/inverse text |
| Warning/stale/unknown | Amber | `!`, `?`, and full label |
| Failure/gap | Red | `X`, `!! GAP`, and reason |
| Reported process | Violet | `R` and `reported` |
| Observed runtime | Cyan | `O` and `observed` |
| Muted/secondary | Gray | Labels remain readable; never encode status by dimness alone |

### Borders, Density, and Text

- Use single-cell borders by default; double or heavy borders are reserved for focused modal/help overlays when glyph support is reliable.
- Focus changes both a leading marker and border/inverse style.
- Default table density is one row per event. Detail sections may use one blank line between semantic groups, never between every field.
- Truncate with `...` in compact mode. Preserve canonical type prefix and stable identity suffix where possible; full value appears in selected detail.
- Use local timestamps with milliseconds when event ordering is under inspection and ISO-8601 with offset in provenance detail. Never show a guessed timestamp.
- Relative freshness uses `0.4s`, `8m`, or `stale 2h`; the source observation timestamp remains available.
- Every material claim can expose source, source identity, evidence class, confidence, observation/received time, freshness, sequence/order evidence, and adapter/schema version.
- Correlation labels include confidence and never use “same as” or causal language.

## Component Inventory

The baseline must be implementable with SolidJS plus OpenTUI primitives. Termcn remains a visual reference and may require selective Solid ports.

| Component | OpenTUI primitive composition | Termcn inspiration | Status |
|---|---|---|---|
| `AppShell` | Root `box`, vertical child boxes, `text` | App shell / status bar composition | **Immediately feasible** |
| `ContextHeader` | Horizontal/wrapping `box`, `text` | Breadcrumb and badge rhythm | **Immediately feasible** |
| `SourceHealthStrip` | `box`, `text`, conditional style | Alert and badge vocabulary | **Immediately feasible** |
| `RouteTabs` / `PlaneTabs` | Horizontal `box`, focusable text labels | Tabs | **Immediately feasible** with local implementation |
| `StatusLabel` | Styled `text` with glyph and word | Badge | **Immediately feasible** |
| `CardGrid` | Wrapping/grid-calculated `box` children | Card | **Immediately feasible**; application owns column math |
| `AgentCard` / `ProcessCard` | Bordered `box`, text rows, mini trace text | Card, badge, progress | **Immediately feasible** |
| `ScrollRegion` | OpenTUI scroll area/viewport plus position text | Scroll area | **Immediately feasible** |
| `MetadataTable` | Row boxes and fixed-width text columns | Table/data table | **Immediately feasible**; virtualization/paging owned by app |
| `DefinitionList` | Key/value row boxes | Description list | **Immediately feasible** |
| `TraceTree` | Indented rows, glyph text, scroll area | Tree/collapsible | **Immediately feasible** for explicit hierarchy |
| `LaneTimeline` | Fixed-width text rows, calculated character spans | Timeline/progress visualization | **Immediately feasible**; custom layout logic required |
| `PhaseProgress` | Text tokens in wrapping box | Steps/progress | **Immediately feasible** |
| `FilterInput` | Focusable text input and result summary | Input/command field | **Immediately feasible** if approved OpenTUI input behavior passes spike |
| `HelpOverlay` | Centered bordered box over viewport | Dialog/command palette | **Immediately feasible** for static content |
| `StatePanel` | Bordered box, title/reason/action text | Alert/empty state | **Immediately feasible** |
| `ResizableSplit` | Two boxes with app-calculated ratio | Resizable panels | **Termcn spike candidate**; MVP can use fixed breakpoint ratios |
| `ColumnChooser` | Overlay list with toggles | Dropdown/command palette | **Termcn spike candidate**; simple local overlay is fallback |
| `VirtualizedTable` | Scroll region plus paginated row window | Data table | **Termcn spike candidate**; bounded pagination is MVP fallback |
| `TreeTable` | Indented table rows and disclosure state | Tree/data table combination | **Termcn spike candidate**; separate tree and table is MVP fallback |
| `Toast` | Temporary footer/status text | Toast | **Termcn spike candidate**; persistent state line preferred for errors |

No screenshot requires a dependency on gradients, rounded web cards, SVG icons, hover, pointer coordinates, animation, or browser layout. Termcn ports are accepted only when they preserve Solid ownership, OpenTUI rendering, keyboard behavior, no-color fallback, and production Bun compatibility.

## Responsive Breakpoints

Both columns and rows determine the layout. Column rules apply first; row rules then reduce secondary content.

| Mode | Dimensions | Exact adaptation |
|---|---|---|
| Wide | `>=140` columns and `>=36` rows | Three overview cards; dual-plane timeline visible together; detail/process screens use 40/60 or 45/55 split; full table columns; two-row header allowed. |
| Standard | `90-139` columns and `24-35` rows | Two overview cards; dual-plane timeline remains if at least 30 rows, otherwise plane tabs; 40/60 detail split above 110 columns, stacked below; omit optional table duration before essential fields. |
| Compact | `50-89` columns and `14-23` rows | One card/list column; one evidence plane or local tab at a time; no side-by-side detail; abbreviated canonical labels with full selected detail; footer shows only active contextual hints; phase ribbon becomes vertical list. |
| Too small | `<50` columns or `<14` rows | Replace app with current dimensions, required `50x14`, and resize instruction. No clipped interactive UI. |

Additional exact rules:

- At fewer than 30 rows, overview cards lose mini-timeline before model/config/freshness.
- At fewer than 20 rows, header becomes one context row plus one source row; selected detail is a route, never a lower split.
- At fewer than 70 columns, card borders remain but each card becomes a five-line list item.
- At fewer than 64 columns, table confidence/source move to selected metadata summary, but plane, subject, type, status, and time/order remain columns.
- Runtime and Process never become adjacent unlabeled rows when plane tabs replace the dual view.
- Resize preserves stable selected identity. If it is filtered or no longer visible, the closest retained item is focused and the footer reports the change.

## Accessibility and Keyboard-Only Requirements

- Every action in this document is keyboard reachable; no hover-only or pointer-only action exists.
- Focus is always visible through at least two cues: leading `>`, border/inverse style, or explicit `FOCUS` label in no-style mode.
- Color is redundant with glyph and text. `NO_COLOR` and `--no-color` produce a complete usable vocabulary.
- Unicode has a complete ASCII fallback selected globally at startup or via `--ascii`.
- The interface does not blink. Streaming updates do not steal focus or move a paused/historical selection.
- Status announcements occupy a stable footer region so updates do not reflow the viewport.
- Error messages identify source, reason, last successful observation, and safe action where known.
- Truncated values are available in the selected metadata region without requiring a mouse tooltip.
- Terminal title changes are nonessential; all context is present in the rendered shell.
- Help lists only keys valid in the current context and labels unavailable actions with reasons.
- Search supports case-insensitive literal matching by default; advanced syntax must be disclosed in help and must never execute shell input.
- Time, sequence, and status columns use stable alignment for scanning; screen readers receive text labels rather than decorative glyphs alone when OpenTUI exposes accessibility hooks.
- Reduced-motion needs no special mode because the MVP uses no animation; active state changes use static glyph/text updates.

## Product Decisions

Approved for pre-SDD design:

1. The global shell always names repository, selected session/process context, independent source health, and current follow/historical state.
2. Runtime and Gentle AI process activity are separate evidence-plane groups or tabs on every screen.
3. The overview uses an adaptive grid of equal-structure Agent and Process boxes, with distinct plane labels and no inferred hierarchy.
4. Timeline navigation is lane-and-time based, deterministic, read-only, and bounded; it never offers checkout, resume, branch, or fork.
5. Pi model identity, allowlisted effort/reasoning configuration, provenance, and freshness are first-class detail metadata; unknown values are rendered honestly.
6. Activity/log views are metadata-only and never render prompts, thoughts, messages, tool arguments, or tool results.
7. SDD receives a canonical specialized phase view; Strict TDD evidence is nested only under SDD apply/verify.
8. Judgment Day and 4R/refuter views carry a persistent no-receipt/no-delivery-authority boundary and exclude RDD semantics.
9. Recognized compatible non-RDD skills without a specialized projection use the canonical generic process view; unknown/incompatible records remain unsupported.
10. Basic OpenTUI primitives are the implementation baseline. Termcn-inspired advanced components require selective Solid port spikes and must have a basic fallback.
11. The minimum interactive terminal is `50x14`; below it, an explicit resize state replaces the application.

## Assumptions Requiring Spikes

| Assumption | Spike evidence required before SDD commitment |
|---|---|
| Pi can provide stable identity, ordering, explicit hierarchy, replay/history, and model/config metadata | Fixture-backed adapter proof for each independent capability and missing-capability fallback. |
| OpenTUI can provide reliable key chords and text-input scoping across Linux/macOS terminals | Key matrix covering `Alt+Arrow`, `Shift+Tab`, brackets, resize, Unicode width, and common terminal emulators. |
| OpenTUI scroll areas can retain focus/offset during streaming Solid updates | Stress fixture with 1,000 events/s, paused selection, resize, and bounded row window. |
| Lane quantization remains legible for dense/overlapping traces | Prototype against sparse, bursty, long, unknown-duration, and gap fixtures at all four breakpoints. |
| Gentle AI exposes stable non-RDD lifecycle/activity for specialized and generic projections | Versioned fixtures for SDD, Judgment Day, Agent Builder, SDD Explore/Tasks, 4R/refuter, generic, incompatible, unknown, and RDD-denylisted records. |
| Authority-free 4R fields can be separated from RDD machinery | Allowlist review proving no receipt, gate, lineage, worktree, recovery, or delivery fields cross the adapter boundary. |
| Termcn patterns can be selectively ported without React/Ink coupling | One nonessential component spike, preferably tabs or column chooser, built as Solid/OpenTUI source with Bun production build. |

## Open Design Questions

- Should the default overview open the last repository or a cross-repository attention list once discovery exceeds 20 repositories?
- What validated Pi policy defines `LIVE`, `IDLE`, and `ORPHANED`, and should unsupported lifecycle capability suppress those cards’ status row or show `UNKNOWN`?
- Which model/config fields pass the privacy allowlist, and which require opt-in before first display?
- What is the default retained timeline window and zoom for sessions longer than two hours?
- Should safely detected RDD presence produce one repository-level `OUT OF SCOPE` diagnostic, or remain hidden unless source diagnostics are opened?
- Which literal/filter grammar is powerful enough for metadata investigations without becoming a terminal command language?
- Do common target terminals report `Alt+Left/Right` consistently, or should local tab navigation fall back to `,` and `.` after the keyboard spike?
- Which source supplies canonical version compatibility for generic Gentle AI projection?

## Design Acceptance Checklist

- [ ] Reviewers can distinguish Runtime and Process evidence planes in every applicable wireframe.
- [ ] No screen derives Pi liveness from Gentle AI process status.
- [ ] Every subagent relationship shown is labeled explicit; flat fallback exists.
- [ ] Historical traversal is visibly read-only and exposes no checkout, resume, branch, fork, or mutation action.
- [ ] Model identity, effort/reasoning config, provenance, freshness, and honest unknowns are represented.
- [ ] Activity tables contain metadata only and show excluded payload status rather than bodies.
- [ ] SDD uses canonical phases and nests Strict TDD only under apply/verify.
- [ ] Judgment Day displays both judges independently when available and labels terminal results reported.
- [ ] 4R/refuter design includes a persistent no-receipt/no-delivery-authority boundary and no RDD lifecycle vocabulary.
- [ ] Generic recognized non-RDD activity has a bounded canonical view; unknown/incompatible remains unsupported.
- [ ] Gaps hold the last trusted position and visibly degrade only the affected plane.
- [ ] Keyboard mappings have no scope conflict and remain usable during text input.
- [ ] All controls have keyboard, no-color, and ASCII-safe representations.
- [ ] Wide, standard, compact, short, and too-small adaptations are deterministic.
- [ ] Every major screen links to relevant PRD goals, FRs, and ACs without duplicating the full traceability matrix.
- [ ] Baseline components map to basic OpenTUI primitives; Termcn candidates are optional spikes with fallbacks.
- [ ] Markdown wireframes remain legible in a monospaced renderer without horizontal wrapping at their intended review width.

## Source Basis

- [Gentle Observe Product Requirements Document](../product/prd.md)
- [Gentle Observe Technical Comparison](../research/technical-comparison.md)
- Visually inspected local screenshots listed in [Reference Analysis](#reference-analysis)
- Just Obs visualizer interaction clarification from `SessionsList.vue`, `SessionCard.vue`, `SessionTrace.vue`, `PhaseDetail.vue`, `DetailSection.vue`, and `src/lib/router.ts` in the allowed local Inkwell SSSF snapshot
