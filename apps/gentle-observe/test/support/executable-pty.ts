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

export interface ExecutableProof {
  readonly nonTty: ProcessResult;
  readonly pty: ProcessResult & {
    readonly cleanup: CleanupEvidence;
    readonly cwd: string;
  };
  readonly version: ProcessResult;
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
      () => {
        finish(resolve);
      },
      (cause) => {
        finish(() => reject(cause));
      },
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
  deadlineMs = defaultDeadlineMs,
): Promise<ProcessResult & { readonly cleanup: CleanupEvidence; readonly cwd: string }> => {
  let capture = new Uint8Array();
  let readyOutput = "";
  let resolveReady: (() => void) | undefined;
  const ready = new Promise<void>((resolve) => {
    resolveReady = resolve;
  });
  const child = Bun.spawn([...command], {
    cwd: environment.cwd,
    env: environment.env,
    terminal: {
      cols: 80,
      data: (_terminal, data) => {
        capture = appendCapture(capture, data);
        const normalized = normalizeAnsi(textDecoder.decode(capture));
        if (normalized.includes("Discovery is not connected.")) {
          readyOutput = normalized;
          resolveReady?.();
        }
      },
      name: "xterm-256color",
      rows: 24,
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
      try {
        const readiness = await waitForReadiness(ready, child, deadlineMs);
        if (typeof readiness === "number") {
          failure = {
            cause: child,
            message: `[exit-code] PTY child exited ${readiness} before readiness.`,
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

  if (failure !== undefined) {
    throw new PtyE2eError({ ...failure, cleanup });
  }

  return { cleanup, cwd: environment.cwd, exitCode: 0, output: readyOutput };
};

export const runExecutableProof = async ({ artifactPath }: { readonly artifactPath: string }) => {
  const asset = Bun.spawnSync({ cmd: ["test", "-x", artifactPath], cwd: "/tmp", env: Bun.env });
  if (asset.exitCode !== 0) {
    throw new PtyE2eError({
      cause: asset,
      cleanup: unavailableCleanup,
      message: `[asset] Compiled executable is missing or not executable: ${artifactPath}`,
      stage: "asset",
    });
  }
  const environment = makeIsolatedEnvironment();

  try {
    const relocated = `${environment.artifactDirectory}/gentle-observe`;
    commandResult(
      ["cp", "--preserve=mode", artifactPath, relocated],
      environment.cwd,
      environment.env,
    );

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
    return { nonTty, pty, version } satisfies ExecutableProof;
  } finally {
    removeIsolatedEnvironment(environment);
  }
};

export const runTimeoutCleanupProof = async () => {
  const environment = makeIsolatedEnvironment();

  try {
    return await runPty(["/bin/sh", "-c", "trap '' TERM; while :; do :; done"], environment, 100);
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
