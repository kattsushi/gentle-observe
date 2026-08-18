# Demo Gate facilitator kit

**Gate status: pending.** This kit prepares a small, metadata-only validation; it does not record participants, select a product decision, or authorize Live work.

## Quick path

1. Give the Linux x64 demo binary to a consented participant and run the exercise for their profile.
2. Record only the template's enumerated fields; use a pseudonymous participant and session reference.
3. Independently collect the human-owned profile decision, then validate documentation records with `bun validate.ts` only as a format check.
4. Update gate status only after 3–5 real records, both profiles, valid references, and two independent `continue` decisions.

## Prerequisites

- Linux x64 terminal capable of `xterm-256color` and the compiled `gentle-observe --demo --scenario complex` binary.
- A facilitator, a consented agent engineer or Gentle AI maintainer, and a local private recording location approved for this study.
- No network account, telemetry, repository access, source inspection, or production/Live connection.

## Privacy boundary

Record only enums, duration buckets, pseudonymous references, and approved observation codes. `payloadCapture` is always `none`. Do not collect names, notes, comments, feedback prose, transcripts, media, prompts, thoughts, messages, tool arguments/results, costs, RDD, payload bodies, or any unknown field. The templates are **templates, not observed records**.

## Recording and validation

Use the profile exercise verbatim enough to compare tasks. Enter task outcome, assistance, and duration bucket; then enter the four metrics and observation codes. The dependency-free `validate.ts` checks exact keys and enum shape only. It has no runtime authority, does not inspect the application, and never chooses a decision from metrics.

## Decision rules

A profile's human decision is `continue`, `pivot`, or `stop`; it is never inferred from thresholds. Live is eligible only when there are 3–5 unique real participant records, both profiles are represented, all decision references are valid, and both human-owned profile decisions are `continue`. Pending, pivot, stop, missing profiles, invalid references, or an out-of-range count keep Live ineligible.

## Pending gate

`gate-status.json` is the committed truthful state: zero participants, neither profile represented, both decisions pending, and `liveEligible: false`. Task 4.3 remains pending until real evidence exists.
