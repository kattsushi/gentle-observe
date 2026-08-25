import { mkdir, mkdtemp, readFile, symlink, utimes, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";
import { Effect } from "effect";

import {
  LiveSystemRejected,
  type LiveSystemDependencies,
  type PiSessionFilesystemDependencies,
  derivePiSessionDirectory,
  makeLiveSystemDependencies,
  makePiSessionFilesystemDependencies,
  selectPiSession,
} from "../src/live/system";

const execute = async <A, E>(program: Effect.Effect<A, E>) => {
  try {
    return { result: "success" as const, value: await Effect.runPromise(program) };
  } catch (error) {
    return { error, result: "failure" as const };
  }
};

const piSessionDirectory = "/pi/agent/sessions/--workspace-repository--";

const dependencies = (
  overrides: Partial<PiSessionFilesystemDependencies> = {},
): PiSessionFilesystemDependencies => ({
  canonicalize: (path) => Effect.succeed(path),
  listDirectory: () => Effect.succeed([]),
  readText: () => Effect.succeed("persisted metadata"),
  stat: () => Effect.succeed(undefined),
  ...overrides,
});

const sessionFixture = async () => {
  const sessionRoot = await mkdtemp(join(tmpdir(), "gentle-observe-live-system-"));
  const lookup = { repository: "/workspace/repository", sessionRoot };
  const sessionDirectory = await Effect.runPromise(derivePiSessionDirectory(lookup));
  await mkdir(sessionDirectory);
  return { lookup, sessionDirectory };
};

const writeSession = async (directory: string, name: string, mtime: string) => {
  const path = join(directory, name);
  await writeFile(path, "persisted metadata");
  await utimes(path, new Date(mtime), new Date(mtime));
  return path;
};

const createFifo = (path: string) => {
  const result = Bun.spawnSync({ cmd: ["mkfifo", path], stderr: "pipe", stdout: "pipe" });
  if (result.exitCode !== 0) throw new Error(`mkfifo failed: ${result.stderr.toString()}`);
};

describe("live system boundary", () => {
  test("derives Pi's documented cwd-encoded session directory from an explicit root", async () => {
    expect(
      await execute(
        derivePiSessionDirectory({
          repository: "/workspace/repository",
          sessionRoot: "/pi/agent/sessions",
        }),
      ),
    ).toEqual({ result: "success", value: piSessionDirectory });
  });

  test("selects the newest persisted JSONL deterministically by mtime then name, never as active", async () => {
    const stats: string[] = [];
    const outcome = await execute(
      selectPiSession(
        dependencies({
          listDirectory: () =>
            Effect.succeed(["older.jsonl", "tie-a.jsonl", "tie-b.jsonl", "ignored.txt"]),
          stat: (path) => {
            stats.push(path);
            const mtime = path.endsWith("older.jsonl")
              ? new Date("2026-03-20T10:00:00.000Z")
              : new Date("2026-03-21T10:00:00.000Z");
            return Effect.succeed({ isRegular: true, mtime });
          },
        }),
        { repository: "/workspace/repository", sessionRoot: "/pi/agent/sessions" },
      ),
    );

    expect(outcome).toEqual({
      result: "success",
      value: { selection: "latest-persisted", sessionFile: `${piSessionDirectory}/tie-b.jsonl` },
    });
    expect(stats).toHaveLength(3);
  });

  test("rejects escaping, non-JSONL, and repository-mismatched explicit selections before filesystem access", async () => {
    const accesses: string[] = [];
    const denied = dependencies({
      canonicalize: () => {
        accesses.push("canonicalize");
        return Effect.fail(new LiveSystemRejected({ reason: "unexpected access" }));
      },
    });
    for (const sessionFile of [
      `${piSessionDirectory}/../escape.jsonl`,
      `${piSessionDirectory}/not-a-session.txt`,
      "/pi/agent/sessions/--workspace-other--/latest.jsonl",
    ]) {
      expect(
        await execute(
          selectPiSession(denied, {
            repository: "/workspace/repository",
            sessionFile,
            sessionRoot: "/pi/agent/sessions",
          }),
        ),
      ).toEqual({
        error: new LiveSystemRejected({ reason: "Pi session selection is invalid" }),
        result: "failure",
      });
    }
    expect(accesses).toEqual([]);
  });

  test("rejects final symlinks and non-regular Pi session candidates without reading them", async () => {
    const { lookup, sessionDirectory } = await sessionFixture();
    const system = makePiSessionFilesystemDependencies();
    const regular = await writeSession(sessionDirectory, "regular.jsonl", "2026-03-20T10:00:00Z");
    const outside = await writeSession(lookup.sessionRoot, "outside.jsonl", "2026-03-22T10:00:00Z");
    const link = join(sessionDirectory, "link.jsonl");
    const directory = join(sessionDirectory, "directory.jsonl");
    const fifo = join(sessionDirectory, "fifo.jsonl");
    await symlink(outside, link);
    await mkdir(directory);
    createFifo(fifo);

    const selected = await execute(selectPiSession(system, lookup));
    expect(selected).toEqual({
      result: "success",
      value: { selection: "latest-persisted", sessionFile: regular },
    });

    expect(await execute(selectPiSession(system, { ...lookup, sessionFile: regular }))).toEqual({
      result: "success",
      value: { selection: "latest-persisted", sessionFile: regular },
    });
    for (const sessionFile of [link, directory, fifo]) {
      expect(await execute(selectPiSession(system, { ...lookup, sessionFile }))).toEqual({
        error: new LiveSystemRejected({ reason: "Pi session file is not a regular file" }),
        result: "failure",
      });
    }
    const unsafeReads = await Promise.all(
      [link, directory, fifo].map((path) => execute(system.readText(path, 128))),
    );
    expect(unsafeReads.every((outcome) => outcome.result === "failure")).toBe(true);
    expect(await execute(system.readText(regular, 18))).toEqual({
      result: "success",
      value: "persisted metadata",
    });
    expect((await execute(system.readText(regular, 17))).result).toBe("failure");
    for (const missing of [
      { ...lookup, sessionFile: join(sessionDirectory, "missing.jsonl") },
      { ...lookup, sessionRoot: join(lookup.sessionRoot, "missing") },
    ]) {
      expect(await execute(selectPiSession(system, missing))).toEqual({
        error: new LiveSystemRejected({ reason: "No persisted Pi sessions found" }),
        result: "failure",
      });
    }
  });

  test("bounds directory inspection before candidate stats and leaves payload reads to consumers", async () => {
    const inspect = async (count: number) => {
      const stats: string[] = [];
      let reads = 0;
      const outcome = await execute(
        selectPiSession(
          dependencies({
            listDirectory: () =>
              Effect.succeed(Array.from({ length: count }, (_, index) => `session-${index}.jsonl`)),
            readText: () => {
              reads += 1;
              return Effect.succeed("payload");
            },
            stat: (path) => {
              stats.push(path);
              return Effect.succeed({
                isRegular: true,
                mtime: new Date("2026-03-21T10:00:00.000Z"),
              });
            },
          }),
          { repository: "/workspace/repository", sessionRoot: "/pi/agent/sessions" },
        ),
      );
      return { outcome, reads, stats };
    };
    const accepted = await inspect(256);
    expect(accepted.outcome).toEqual({
      result: "success",
      value: {
        selection: "latest-persisted",
        sessionFile: `${piSessionDirectory}/session-99.jsonl`,
      },
    });
    expect(accepted.stats).toHaveLength(256);
    expect(accepted.reads).toBe(0);
    const rejected = await inspect(257);
    expect(rejected.outcome).toEqual({
      error: new LiveSystemRejected({ reason: "Pi session directory exceeds 256 entries" }),
      result: "failure",
    });
    expect(rejected.stats).toEqual([]);
    expect(rejected.reads).toBe(0);
  });
});

const errorCode = (cause: unknown) =>
  typeof cause === "object" && cause !== null && "code" in cause && typeof cause.code === "string"
    ? cause.code
    : undefined;

const isProcessAlive = (pid: number): boolean => {
  try {
    process.kill(pid, 0);
    return true;
  } catch (cause) {
    if (errorCode(cause) === "ESRCH") return false;
    throw cause;
  }
};

const awaitChildPid = async (path: string): Promise<number> => {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const pid = Number((await readFile(path, "utf8")).trim());
      if (Number.isSafeInteger(pid) && pid > 0) return pid;
      throw new Error("child wrote an invalid pid");
    } catch (cause) {
      if (errorCode(cause) !== "ENOENT") throw cause;
    }
    await Bun.sleep(10);
  }
  throw new Error("child did not publish a pid");
};

const resistantChild = async (mode: "silent" | "overflow") => {
  const directory = await mkdtemp(join(tmpdir(), "gentle-observe-live-subprocess-"));
  const pidFile = join(directory, "child.pid");
  const stdout = mode === "overflow" ? 'process.stdout.write("overflow");' : "";
  const source = [
    'import { writeFileSync } from "node:fs";',
    `writeFileSync(${JSON.stringify(pidFile)}, String(process.pid));`,
    'process.on("SIGTERM", () => {});',
    stdout,
    "setInterval(() => {}, 1_000);",
  ].join("");
  return { pidFile, source };
};

const runResistantChild = (
  live: LiveSystemDependencies,
  child: { readonly source: string },
  options: { readonly deadlineMs: number; readonly maximumStdoutBytes: number },
) => live.run(Bun.argv[0], ["--eval", child.source], options);

describe("live subprocess authority", () => {
  test("preserves exact argv, bounds normal stdout, and rejects nonzero or invalid requests", async () => {
    const live = makeLiveSystemDependencies();
    const argv = ["space value", "$(not-a-shell)"];
    const options = {
      deadlineMs: 500,
      maximumStdoutBytes: new TextEncoder().encode(JSON.stringify(argv)).byteLength,
    };

    expect(
      await execute(
        live.run(
          Bun.argv[0],
          ["--eval", "process.stdout.write(JSON.stringify(process.argv.slice(1)))", ...argv],
          options,
        ),
      ),
    ).toEqual({ result: "success", value: { stdout: JSON.stringify(argv) } });

    expect(await execute(live.run(Bun.argv[0], ["--eval", "process.exit(7)"], options))).toEqual({
      error: new LiveSystemRejected({ reason: "Live subprocess failed" }),
      result: "failure",
    });

    for (const invalid of [
      { deadlineMs: 0, maximumStdoutBytes: 128 },
      { deadlineMs: 500, maximumStdoutBytes: 0 },
    ]) {
      expect(await execute(live.run("never-started", [], invalid))).toEqual({
        error: new LiveSystemRejected({ reason: "Gentle AI request is invalid" }),
        result: "failure",
      });
    }
  });

  test("waits for resistant children to exit after deadline and stdout overflow", async () => {
    const live = makeLiveSystemDependencies();
    for (const [mode, options] of [
      ["silent", { deadlineMs: 100, maximumStdoutBytes: 128 }],
      ["overflow", { deadlineMs: 500, maximumStdoutBytes: 4 }],
    ] as const) {
      const child = await resistantChild(mode);
      const running = execute(runResistantChild(live, child, options));
      const pid = await awaitChildPid(child.pidFile);

      expect(isProcessAlive(pid)).toBe(true);
      expect(await running).toEqual({
        error: new LiveSystemRejected({ reason: "Live subprocess failed" }),
        result: "failure",
      });
      expect(isProcessAlive(pid)).toBe(false);
    }
  });

  test("uses Effect's abort signal and settles only after finalizing a resistant child", async () => {
    const live = makeLiveSystemDependencies();
    const child = await resistantChild("silent");
    const controller = new AbortController();
    const running = Effect.runPromise(
      runResistantChild(live, child, { deadlineMs: 500, maximumStdoutBytes: 128 }),
      { signal: controller.signal },
    );
    const pid = await awaitChildPid(child.pidFile);

    expect(isProcessAlive(pid)).toBe(true);
    controller.abort();
    const outcome = await running.then(
      () => "resolved" as const,
      () => "rejected" as const,
    );
    expect(outcome).toBe("rejected");
    expect(isProcessAlive(pid)).toBe(false);
  });
});
