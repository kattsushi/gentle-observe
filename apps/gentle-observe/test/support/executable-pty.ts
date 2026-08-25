import { Data } from "effect";

const captureLimit = 64 * 1024;
const defaultDeadlineMs = 10_000;
const termGraceMs = 250;
const textDecoder = new TextDecoder();

type Stage =
  | "asset"
  | "cleanup"
  | "environment"
  | "exit-code"
  | "interaction"
  | "non-tty"
  | "readiness"
  | "timeout"
  | "version";

export interface CleanupEvidence {
  readonly killSent: boolean;
  readonly noLeaks: boolean;
  readonly terminalClosed: boolean;
  readonly termSent: boolean;
}

export class PtyE2eError extends Data.TaggedError("PtyE2eError")<{
  readonly cause: unknown;
  readonly cleanup: CleanupEvidence;
  readonly message: string;
  readonly stage: Stage;
}> {}

interface IsolatedEnvironment {
  readonly artifactDirectory: string;
  readonly cwd: string;
  readonly env: Record<string, string | undefined>;
  readonly root: string;
}

interface ProcessResult {
  readonly exitCode: number;
  readonly output: string;
}

interface PtyResult extends ProcessResult {
  readonly cleanup: CleanupEvidence;
  readonly cwd: string;
}

interface PtyOptions {
  readonly cols?: number;
  readonly deadlineMs?: number;
  readonly interaction?: (writeAndWait: WriteAndWait) => Promise<void>;
  readonly readiness?: (output: string) => boolean;
  readonly readinessText?: string;
  readonly rows?: number;
}

type WriteAndWait = (
  input: string,
  marker: string,
  predicate: (output: string) => boolean,
  options?: { readonly parserGuardMs?: 30 },
) => Promise<void>;

export interface ExecutableProof {
  readonly demoPty: PtyResult;
  readonly nonTty: ProcessResult;
  readonly pty: PtyResult;
  readonly version: ProcessResult;
}

export interface CompiledNavigationProof extends PtyResult {
  readonly semanticEvidence: ReadonlyArray<string>;
  readonly steps: ReadonlyArray<string>;
}

const unavailableCleanup: CleanupEvidence = {
  killSent: false,
  noLeaks: true,
  terminalClosed: true,
  termSent: false,
};

export const appendCapture = (capture: Uint8Array, chunk: Uint8Array) => {
  if (chunk.byteLength >= captureLimit) return chunk.slice(chunk.byteLength - captureLimit);

  const retained = capture.slice(Math.max(0, capture.byteLength + chunk.byteLength - captureLimit));
  const result = new Uint8Array(retained.byteLength + chunk.byteLength);
  result.set(retained);
  result.set(chunk, retained.byteLength);
  return result;
};

const captureStream = async (stream: ReadableStream<Uint8Array> | undefined) => {
  if (stream === undefined) return "";

  const reader = stream.getReader();
  let capture = new Uint8Array();

  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) return textDecoder.decode(capture);
      capture = appendCapture(capture, chunk.value);
    }
  } finally {
    reader.releaseLock();
  }
};

const escape = String.fromCodePoint(27);
const bell = String.fromCodePoint(7);

export const normalizeAnsi = (output: string) => {
  let normalized = "";

  for (let index = 0; index < output.length;) {
    if (output[index] !== escape) {
      normalized += output[index];
      index += 1;
      continue;
    }

    if (index + 1 === output.length) break;

    const type = output[index + 1];
    if (type === "[") {
      index += 2;
      while (index < output.length) {
        const code = output.charCodeAt(index++);
        if (code >= 0x40 && code <= 0x7e) break;
      }
      continue;
    }

    if (type === "]" || type === "P" || type === "_") {
      index += 2;
      while (index < output.length) {
        if (type === "]" && output[index] === bell) {
          index += 1;
          break;
        }
        if (output[index] === escape && output[index + 1] === "\\") {
          index += 2;
          break;
        }
        index += 1;
      }
      continue;
    }

    normalized += `${escape}${type}`;
    index += 2;
  }

  return normalized;
};

const redraw = (output: string, cols: number, rows: number) => {
  const screen = Array.from({ length: rows }, () => Array<string>(cols).fill(" "));
  let column = 0;
  let row = 0;

  for (let index = 0; index < output.length;) {
    if (output[index] !== escape) {
      if (output[index] >= " " && screen[row]?.[column] !== undefined)
        screen[row][column++] = output[index];
      index += 1;
      continue;
    }
    const type = output[index + 1];
    if (type !== "[") {
      index += 2;
      continue;
    }
    const end = output.slice(index + 2).search(/[\x40-\x7e]/) + index + 2;
    if (end < index + 2) break;
    if (output[end] === "H") {
      const [nextRow = 1, nextColumn = 1] = output
        .slice(index + 2, end)
        .split(";")
        .map((value) => Number(value) || 1);
      row = nextRow - 1;
      column = nextColumn - 1;
    }
    index = end + 1;
  }

  return screen.map((line) => line.join("")).join("\n");
};

const occurrences = (output: string, marker: string) =>
  marker === "" ? 0 : output.split(marker).length - 1;

const commandResult = (
  command: ReadonlyArray<string>,
  cwd: string,
  env: Record<string, string | undefined>,
) => {
  const result = Bun.spawnSync({ cmd: [...command], cwd, env, stderr: "pipe", stdout: "pipe" });
  const output = `${result.stdout?.toString() ?? ""}${result.stderr?.toString() ?? ""}`;

  if (result.exitCode !== 0) {
    throw new PtyE2eError({
      cause: result,
      cleanup: unavailableCleanup,
      message: `[environment] ${command[0]} failed: ${output}`,
      stage: "environment",
    });
  }

  return output;
};

const makeIsolatedEnvironment = (): IsolatedEnvironment => {
  const root = commandResult(
    ["mktemp", "-d", "/tmp/gentle-observe-e2e.XXXXXX"],
    "/tmp",
    Bun.env,
  ).trim();
  const artifactDirectory = `${root}/artifact`;
  const cwd = `${root}/run`;
  const home = `${root}/home`;
  const tmp = `${root}/tmp`;

  commandResult(
    [
      "mkdir",
      "-p",
      artifactDirectory,
      cwd,
      home,
      tmp,
      `${home}/cache`,
      `${home}/config`,
      `${home}/data`,
    ],
    root,
    Bun.env,
  );

  return {
    artifactDirectory,
    cwd,
    env: {
      ...Bun.env,
      HOME: home,
      TERM: "xterm-256color",
      TMPDIR: tmp,
      XDG_CACHE_HOME: `${home}/cache`,
      XDG_CONFIG_HOME: `${home}/config`,
      XDG_DATA_HOME: `${home}/data`,
    },
    root,
  };
};

const removeIsolatedEnvironment = (environment: IsolatedEnvironment) => {
  commandResult(["rm", "-rf", environment.root], "/tmp", Bun.env);
};

const waitForExit = (child: Bun.Subprocess, deadlineMs: number) =>
  new Promise<number>((resolve, reject) => {
    const deadline = setTimeout(() => reject(new Error("deadline exceeded")), deadlineMs);

    void child.exited.then(
      (exitCode) => {
        clearTimeout(deadline);
        resolve(exitCode);
      },
      (cause) => {
        clearTimeout(deadline);
        reject(cause);
      },
    );
  });

const waitForReadiness = (ready: Promise<void>, child: Bun.Subprocess, deadlineMs: number) =>
  new Promise<void | number>((resolve, reject) => {
    const deadline = setTimeout(
      () => reject(new Error("PTY readiness deadline exceeded")),
      deadlineMs,
    );
    const finish = (callback: () => void) => {
      clearTimeout(deadline);
      callback();
    };

    void ready.then(
      () => finish(resolve),
      (cause) => finish(() => reject(cause)),
    );
    void child.exited.then(
      (exitCode) => finish(() => resolve(exitCode)),
      (cause) => finish(() => reject(cause)),
    );
  });

const runNonTty = async (
  executable: string,
  args: ReadonlyArray<string>,
  environment: IsolatedEnvironment,
): Promise<ProcessResult> => {
  const child = Bun.spawn([executable, ...args], {
    cwd: environment.cwd,
    env: environment.env,
    stderr: "pipe",
    stdin: "pipe",
    stdout: "pipe",
  });
  void child.stdin?.end();

  const stdout = captureStream(child.stdout ?? undefined);
  const stderr = captureStream(child.stderr ?? undefined);
  let exitCode: number;

  try {
    exitCode = await waitForExit(child, defaultDeadlineMs);
  } catch (cause) {
    let killSent = false;
    child.kill("SIGTERM");
    try {
      await waitForExit(child, termGraceMs);
    } catch {
      killSent = true;
      child.kill("SIGKILL");
      await child.exited;
    }
    throw new PtyE2eError({
      cause,
      cleanup: { ...unavailableCleanup, killSent, termSent: true },
      message: `[timeout] Non-TTY process did not exit within ${defaultDeadlineMs}ms.`,
      stage: "timeout",
    });
  }

  return { exitCode, output: `${await stdout}${await stderr}` };
};

const cleanupChild = async (child: Bun.Subprocess): Promise<CleanupEvidence> => {
  let terminalClosed = false;
  let termSent = false;
  let killSent = false;

  try {
    if (child.exitCode === null) {
      termSent = true;
      child.kill("SIGTERM");
      try {
        await waitForExit(child, termGraceMs);
      } catch {
        killSent = true;
        child.kill("SIGKILL");
        await child.exited;
      }
    }
  } finally {
    if (child.terminal !== undefined) {
      child.terminal.close();
      terminalClosed = child.terminal.closed;
    }
  }

  return {
    killSent,
    noLeaks: child.exitCode !== null || child.signalCode !== null,
    terminalClosed,
    termSent,
  };
};

const runPty = async (
  command: ReadonlyArray<string>,
  environment: IsolatedEnvironment,
  options: PtyOptions = {},
): Promise<PtyResult> => {
  const deadlineMs = options.deadlineMs ?? defaultDeadlineMs;
  const readiness =
    options.readiness ??
    ((output) =>
      output.includes(options.readinessText ?? "Runtime: unavailable | source unavailable"));
  let capture = new Uint8Array();
  let observeOutput: ((output: string) => void) | undefined;
  let resolveReady: (() => void) | undefined;
  const ready = new Promise<void>((resolve) => {
    resolveReady = resolve;
  });
  const cols = options.cols ?? 80;
  const rows = options.rows ?? 24;
  const output = () => normalizeAnsi(textDecoder.decode(capture));
  const observedOutput = () => `${output()}\n${redraw(textDecoder.decode(capture), cols, rows)}`;
  const child = Bun.spawn([...command], {
    cwd: environment.cwd,
    env: environment.env,
    terminal: {
      cols,
      data: (_terminal, data) => {
        capture = appendCapture(capture, data);
        const observed = observedOutput();
        if (readiness(observed)) resolveReady?.();
        observeOutput?.(observed);
      },
      name: "xterm-256color",
      rows,
    },
  });
  let failure:
    | { readonly cause: unknown; readonly message: string; readonly stage: Stage }
    | undefined;
  let cleanup = unavailableCleanup;

  try {
    if (child.terminal === undefined) {
      failure = {
        cause: child,
        message: "[environment] Bun.spawn did not provide a terminal.",
        stage: "environment",
      };
    } else {
      const writeAndWait: WriteAndWait = async (input, marker, predicate, guard = {}) => {
        const baseline = occurrences(observedOutput(), marker);
        const fresh = new Promise<void>((resolve) => {
          observeOutput = (candidate) => {
            if (occurrences(candidate, marker) > baseline && predicate(candidate)) {
              observeOutput = undefined;
              resolve();
            }
          };
        });
        child.terminal?.write(input);
        if (guard.parserGuardMs !== undefined) await Bun.sleep(guard.parserGuardMs);
        try {
          const observed = await waitForReadiness(fresh, child, deadlineMs);
          if (typeof observed === "number") {
            throw new Error(`PTY child exited ${observed} during interaction.`);
          }
        } catch (cause) {
          throw new Error(
            `Fresh marker ${marker} did not satisfy its interaction predicate: ${
              cause instanceof Error ? cause.message : "unknown wait failure"
            }`,
          );
        }
      };

      try {
        const observed = await waitForReadiness(ready, child, deadlineMs);
        if (typeof observed === "number") {
          failure = {
            cause: child,
            message: `[exit-code] PTY child exited ${observed} before readiness.`,
            stage: "exit-code",
          };
        }
      } catch (cause) {
        failure = {
          cause,
          message: `[readiness] PTY readiness was not observed within ${deadlineMs}ms.`,
          stage: "readiness",
        };
      }

      if (failure === undefined && options.interaction !== undefined) {
        try {
          await options.interaction(writeAndWait);
        } catch (cause) {
          failure = {
            cause,
            message: `[interaction] PTY navigation did not reach fresh output: ${
              cause instanceof Error ? cause.message : "unknown interaction failure"
            }`,
            stage: "interaction",
          };
        }
      }

      if (failure === undefined) {
        child.terminal.write("q");
        try {
          const exitCode = await waitForExit(child, deadlineMs);
          if (exitCode !== 0) {
            failure = {
              cause: child,
              message: `[exit-code] PTY child exited ${exitCode}.`,
              stage: "exit-code",
            };
          }
        } catch (cause) {
          failure = {
            cause,
            message: `[timeout] PTY child did not exit within ${deadlineMs}ms after q.`,
            stage: "timeout",
          };
        }
      }
    }
  } catch (cause) {
    failure = {
      cause,
      message: "[cleanup] PTY execution failed before it could complete.",
      stage: "cleanup",
    };
  }

  try {
    cleanup = await cleanupChild(child);
  } catch (cause) {
    throw new PtyE2eError({
      cause,
      cleanup,
      message: "[cleanup] PTY terminal cleanup raised an error.",
      stage: "cleanup",
    });
  }

  if (!cleanup.noLeaks || !cleanup.terminalClosed) {
    throw new PtyE2eError({
      cause: child,
      cleanup,
      message: "[cleanup] PTY child or terminal cleanup was incomplete.",
      stage: "cleanup",
    });
  }

  if (failure !== undefined) throw new PtyE2eError({ ...failure, cleanup });

  return { cleanup, cwd: environment.cwd, exitCode: 0, output: observedOutput() };
};

const assertAsset = (artifactPath: string) => {
  const asset = Bun.spawnSync({ cmd: ["test", "-x", artifactPath], cwd: "/tmp", env: Bun.env });
  if (asset.exitCode !== 0) {
    throw new PtyE2eError({
      cause: asset,
      cleanup: unavailableCleanup,
      message: `[asset] Compiled executable is missing or not executable: ${artifactPath}`,
      stage: "asset",
    });
  }
};

const relocate = (artifactPath: string, environment: IsolatedEnvironment) => {
  const relocated = `${environment.artifactDirectory}/gentle-observe`;
  commandResult(
    ["cp", "--preserve=mode", artifactPath, relocated],
    environment.cwd,
    environment.env,
  );
  return relocated;
};

export const runExecutableProof = async ({ artifactPath }: { readonly artifactPath: string }) => {
  assertAsset(artifactPath);
  const environment = makeIsolatedEnvironment();

  try {
    const relocated = relocate(artifactPath, environment);
    const version = await runNonTty(relocated, ["--version"], environment);
    if (version.exitCode !== 0 || version.output !== "gentle-observe 0.1.0\n") {
      throw new PtyE2eError({
        cause: version,
        cleanup: unavailableCleanup,
        message: `[version] Unexpected compiled version result: ${version.output}`,
        stage: "version",
      });
    }

    const nonTty = await runNonTty(relocated, [], environment);
    if (nonTty.exitCode === 0 || !nonTty.output.includes("requires an interactive terminal")) {
      throw new PtyE2eError({
        cause: nonTty,
        cleanup: unavailableCleanup,
        message: `[non-tty] Compiled executable did not reject default non-TTY launch: ${nonTty.output}`,
        stage: "non-tty",
      });
    }

    const pty = await runPty([relocated], environment);
    const demoPty = await runPty([relocated, "--demo", "--scenario", "normal"], environment, {
      readinessText: "DEMO DATA",
    });
    return { demoPty, nonTty, pty, version } satisfies ExecutableProof;
  } finally {
    removeIsolatedEnvironment(environment);
  }
};

export const runCompiledNavigationProof = async ({
  artifactPath,
}: {
  readonly artifactPath: string;
}) => {
  assertAsset(artifactPath);
  const environment = makeIsolatedEnvironment();
  const semanticEvidence: string[] = [];
  const steps: string[] = [];

  try {
    const relocated = relocate(artifactPath, environment);
    const result = await runPty([relocated, "--demo", "--scenario", "complex"], environment, {
      cols: 50,
      readiness: (output) =>
        output.includes("DEMO DATA") &&
        output.includes("Runtime [active]") &&
        output.includes("> agent-alpha | observed running"),
      rows: 14,
      interaction: async (writeAndWait) => {
        await writeAndWait(
          "\x09",
          "reported",
          (output) => output.includes("Processes [active]") && output.includes("process-build"),
        );
        semanticEvidence.push("Processes [active] | process-build | reported");
        steps.push("processes-active");
        await writeAndWait("j", ">", () => true);
        steps.push("process-check-selected");
        await writeAndWait(
          "\x0d",
          ">ProcessDetail",
          (output) =>
            output.includes("id:process-check|type:generic") &&
            output.includes("specializedsemantics:unavailable"),
        );
        steps.push("generic-detail");
        await writeAndWait("\x1b", ">", () => true, { parserGuardMs: 30 });
        steps.push("generic-back");
        await writeAndWait("k", ">", () => true);
        steps.push("process-build-selected");
        await writeAndWait("\x0d", "SDD:", (output) =>
          output.includes(
            "SDD:phase/progress/artifacts/attempts/dependencies/StrictTDDunavailable",
          ),
        );
        steps.push("sdd-detail");
        await writeAndWait(
          "2",
          "timestamps unavailable",
          (output) =>
            output.includes("Timeline | Processes | process-build") &&
            output.includes("timestamps unavailable") &&
            output.includes("normalized contract"),
        );
        semanticEvidence.push(
          "Timeline | Processes | process-build | timestamps unavailable | normalized contract",
        );
        steps.push("timeline");
        await writeAndWait("\x1b", "SDD:", () => true, { parserGuardMs: 30 });
        steps.push("timeline-back");
        await writeAndWait("\x1b", ">", () => true, { parserGuardMs: 30 });
        steps.push("overview-back");
      },
    });
    return { ...result, semanticEvidence, steps } satisfies CompiledNavigationProof;
  } finally {
    removeIsolatedEnvironment(environment);
  }
};

export const runTimeoutCleanupProof = async () => {
  const environment = makeIsolatedEnvironment();

  try {
    return await runPty(["/bin/sh", "-c", "trap '' TERM; while :; do :; done"], environment, {
      deadlineMs: 100,
    });
  } finally {
    removeIsolatedEnvironment(environment);
  }
};

export const runEarlyExitProof = async () => {
  const environment = makeIsolatedEnvironment();

  try {
    return await runPty(["/bin/sh", "-c", "exit 7"], environment);
  } finally {
    removeIsolatedEnvironment(environment);
  }
};
