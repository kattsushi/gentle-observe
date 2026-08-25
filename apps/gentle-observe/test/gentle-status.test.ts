import { describe, expect, test } from "bun:test";
import { Effect } from "effect";

import { readGentleStatus } from "../src/live/gentle-status";

const execute = async <A, E>(program: Effect.Effect<A, E>) => {
  try {
    return { result: "success" as const, value: await Effect.runPromise(program) };
  } catch (error) {
    return { error, result: "failure" as const };
  }
};

const statusRequest = {
  change: "live-source-spike",
  changeRoot: "/workspace/repository/openspec/changes/live-source-spike",
  repository: "/workspace/repository",
  store: "openspec",
} as const;

const sddStatus = {
  artifactPaths: {
    applyProgress: ["/workspace/repository/openspec/changes/live-source-spike/apply.md"],
  },
  artifactStore: "openspec",
  artifacts: { applyProgress: "partial" },
  blockedReasons: ["review required"],
  changeName: "live-source-spike",
  changeRoot: "/workspace/repository/openspec/changes/live-source-spike",
  nextRecommended: "apply",
  schemaName: "gentle-ai.sdd-status",
  schemaVersion: 1,
};

const rejected = {
  error: { _tag: "GentleStatusRejected", reason: "Gentle status contract is invalid" },
  result: "failure" as const,
};

describe("Gentle AI status metadata adapter", () => {
  test("uses exact argv-only access and normalizes contained artifact metadata", async () => {
    const calls: Array<readonly [string, ReadonlyArray<string>]> = [];
    const stats: string[] = [];
    const outcome = await execute(
      readGentleStatus(
        {
          now: () => new Date("2026-03-21T10:03:00.000Z"),
          run: (file, arguments_) => {
            calls.push([file, arguments_]);
            return Effect.succeed({ stdout: JSON.stringify(sddStatus) });
          },
          stat: (path) => {
            stats.push(path);
            return Effect.succeed({ mtime: new Date("2026-03-21T10:02:30.000Z") });
          },
        },
        statusRequest,
      ),
    );

    expect(outcome).toEqual({
      result: "success",
      value: {
        artifacts: [
          {
            exists: true,
            mtime: "2026-03-21T10:02:30.000Z",
            name: "applyProgress",
            state: "partial",
          },
        ],
        change: "live-source-spike",
        nextRecommended: "apply",
        provenance: {
          contract: "gentle-ai.sdd-status/v1",
          observedAt: "2026-03-21T10:03:00.000Z",
        },
      },
    });
    expect(calls).toEqual([
      [
        "gentle-ai",
        [
          "sdd-status",
          "live-source-spike",
          "--cwd",
          "/workspace/repository",
          "--contract",
          "gentle-ai.sdd-status/v1",
          "--json",
        ],
      ],
    ]);
    expect(stats).toEqual(["/workspace/repository/openspec/changes/live-source-spike/apply.md"]);
  });

  test("rejects invalid identity, store, change root, and artifact path escapes before stat", async () => {
    const invalidStatuses = [
      { ...sddStatus, schemaName: "gentle-ai.sdd-status/v2" },
      { ...sddStatus, schemaVersion: 2 },
      { ...sddStatus, changeName: "another-change" },
      { ...sddStatus, artifactStore: "other-store" },
      { ...sddStatus, changeRoot: "/workspace/repository/openspec/changes/another-change" },
      { ...sddStatus, artifactPaths: { applyProgress: ["/workspace/escape.md"] } },
      {
        ...sddStatus,
        artifactPaths: {
          applyProgress: ["/workspace/repository/outside-change-root/apply.md"],
        },
      },
    ];

    for (const status of invalidStatuses) {
      const stats: string[] = [];
      const outcome = await execute(
        readGentleStatus(
          {
            now: () => new Date("2026-03-21T10:03:00.000Z"),
            run: () => Effect.succeed({ stdout: JSON.stringify(status) }),
            stat: (path) => {
              stats.push(path);
              return Effect.succeed(undefined);
            },
          },
          statusRequest,
        ),
      );

      expect(outcome).toEqual(rejected);
      expect(stats).toEqual([]);
    }
  });
});
