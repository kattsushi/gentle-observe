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

const v1NextRecommended = [
  "propose spec design tasks apply review verify remediate archive",
  "sdd-new select-change resolve-blockers resolve-review",
].flatMap((tokens) => tokens.split(" "));

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
        blocked: true,
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
    expect(outcome).not.toHaveProperty("value.blockedReasons");
  });

  test("accepts every v1 recommendation token and projects empty blockers", async () => {
    for (const nextRecommended of v1NextRecommended) {
      const outcome = await execute(
        readGentleStatus(
          {
            now: () => new Date("2026-03-21T10:03:00.000Z"),
            run: () =>
              Effect.succeed({
                stdout: JSON.stringify({ ...sddStatus, blockedReasons: [], nextRecommended }),
              }),
            stat: () => Effect.succeed(undefined),
          },
          statusRequest,
        ),
      );
      expect(outcome).toMatchObject({
        result: "success",
        value: { blocked: false, nextRecommended },
      });
    }
  });

  test("rejects invalid identity, store, change root, artifact path escapes, tokens, and blockers before stat", async () => {
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
      { ...sddStatus, nextRecommended: "" },
      { ...sddStatus, nextRecommended: "apply this" },
      { ...sddStatus, nextRecommended: "not-a-token" },
      { ...sddStatus, nextRecommended: "apply\u0000" },
      { ...sddStatus, nextRecommended: "x".repeat(1_025) },
      { ...sddStatus, blockedReasons: "review required" },
      { ...sddStatus, blockedReasons: [""] },
      { ...sddStatus, blockedReasons: [0] },
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
