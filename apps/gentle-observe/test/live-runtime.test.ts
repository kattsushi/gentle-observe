import { describe, expect, test } from "bun:test";
import { Effect } from "effect";

import { acquireLiveProjection } from "../src/live/runtime";
import type { LiveSystemDependencies } from "../src/live/system";

const repository = "/workspace/repository";
const sessionRoot = "/pi/agent/sessions";
const sessionDirectory = "/pi/agent/sessions/--workspace-repository--";
const change = "live-source-spike";
const changeRoot = "/workspace/repository/openspec/changes/live-source-spike";
const sessionFile = `${sessionDirectory}/newest.jsonl`;
const applyProgress = `${changeRoot}/apply-progress.md`;

const persistedSession = [
  JSON.stringify({
    cwd: repository,
    id: "session-newest",
    timestamp: "2026-03-21T10:00:00.000Z",
    type: "session",
    version: 3,
  }),
  JSON.stringify({ timestamp: "2026-03-21T10:02:00.000Z", type: "tool" }),
  "",
].join("\n");

const statusStdout = JSON.stringify({
  artifactPaths: { applyProgress: [applyProgress] },
  artifactStore: "openspec",
  artifacts: { applyProgress: "partial" },
  blockedReasons: [],
  changeName: change,
  changeRoot,
  nextRecommended: "apply",
  schemaName: "gentle-ai.sdd-status",
  schemaVersion: 1,
});

const dependencies = (
  calls: Array<
    readonly [
      string,
      ReadonlyArray<string>,
      { readonly deadlineMs: number; readonly maximumStdoutBytes: number },
    ]
  >,
  reads: Array<readonly [string, number]>,
  stats: string[],
): LiveSystemDependencies => ({
  listDirectory: (path) => {
    expect(path).toBe(sessionDirectory);
    return Effect.succeed(["older.jsonl", "newest.jsonl"]);
  },
  readText: (path, maximumBytes) => {
    reads.push([path, maximumBytes]);
    return Effect.succeed(persistedSession);
  },
  run: (file, arguments_, options) => {
    calls.push([file, arguments_, options]);
    return Effect.succeed({ stdout: statusStdout });
  },
  stat: (path) => {
    stats.push(path);
    if (path === `${sessionDirectory}/older.jsonl`) {
      return Effect.succeed({ mtime: new Date("2026-03-21T09:00:00.000Z") });
    }
    if (path === sessionFile) {
      return Effect.succeed({ mtime: new Date("2026-03-21T10:00:00.000Z") });
    }
    if (path === applyProgress) {
      return Effect.succeed({ mtime: new Date("2026-03-21T10:03:00.000Z") });
    }
    throw new Error(`unexpected stat: ${path}`);
  },
});

describe("live runtime acquisition", () => {
  test("composes persisted Pi and Gentle status adapters into one non-demo projection", async () => {
    const calls: Array<
      readonly [
        string,
        ReadonlyArray<string>,
        { readonly deadlineMs: number; readonly maximumStdoutBytes: number },
      ]
    > = [];
    const reads: Array<readonly [string, number]> = [];
    const stats: string[] = [];

    const projection = await Effect.runPromise(
      acquireLiveProjection(dependencies(calls, reads, stats), {
        change,
        changeRoot,
        repository,
        sessionRoot,
      }),
    );

    expect(calls).toEqual([
      [
        "gentle-ai",
        [
          "sdd-status",
          change,
          "--cwd",
          repository,
          "--contract",
          "gentle-ai.sdd-status/v1",
          "--json",
        ],
        { deadlineMs: 5_000, maximumStdoutBytes: 1_048_576 },
      ],
    ]);
    expect(reads).toEqual([[sessionFile, 1_048_576]]);
    expect(stats).toEqual([applyProgress, `${sessionDirectory}/older.jsonl`, sessionFile]);
    expect(projection).toEqual({
      demo: false,
      processes: {
        availability: "available",
        capabilities: { tokens: { state: "missing" } },
        freshness: "unknown",
        health: "available",
        missingness: "partial",
        provenance: { adapterVersion: "live-v1", kind: "live" },
        records: [
          {
            activity: "apply",
            durationMs: 0,
            id: change,
            parentId: null,
            repoId: change,
            sessionId: change,
            status: "waiting",
            steps: [{ id: "applyProgress:0", status: "idle" }],
            type: "sdd",
          },
        ],
      },
      runtime: {
        availability: "available",
        capabilities: { tokens: { state: "missing" } },
        freshness: "unknown",
        health: "available",
        missingness: "partial",
        provenance: { adapterVersion: "live-v1", kind: "live" },
        records: [
          {
            durationMs: 0,
            id: "session-newest",
            model: "unobserved",
            parentId: null,
            provider: "pi",
            repoId: repository,
            sessionId: "session-newest",
            status: "idle",
            steps: [{ id: "session-newest:tool:2026-03-21T10:02:00.000Z", status: "completed" }],
          },
        ],
      },
    });
    expect(
      JSON.stringify({ processes: projection.processes, runtime: projection.runtime }),
    ).not.toContain("demo");
  });
});
