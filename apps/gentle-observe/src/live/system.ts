import { constants } from "node:fs";
import { lstat, open, opendir, realpath } from "node:fs/promises";
import { dirname } from "node:path";
import { Data, Effect } from "effect";
export class LiveSystemRejected extends Data.TaggedClass("LiveSystemRejected")<{
  readonly reason: string;
}> {}
type FsEffect<Result> = Effect.Effect<Result, LiveSystemRejected>;
export type PiSessionFileStat = { readonly isRegular: boolean; readonly mtime: Date };
/** Filesystem-only authority; a later adapter composes separate subprocess authority. */
export interface PiSessionFilesystemDependencies {
  readonly canonicalize: (path: string) => FsEffect<string | undefined>;
  readonly listDirectory: (path: string) => FsEffect<readonly string[]>;
  readonly readText: (path: string, maximumBytes: number) => FsEffect<string>;
  readonly stat: (path: string) => FsEffect<PiSessionFileStat | undefined>;
}

export interface LiveSubprocessOptions {
  readonly deadlineMs: number;
  readonly maximumStdoutBytes: number;
}

/** Separate argv-only authority; callers cannot interpolate a shell command. */
export interface ArgvSubprocessDependencies {
  readonly run: (
    file: string,
    arguments_: ReadonlyArray<string>,
    options: LiveSubprocessOptions,
  ) => FsEffect<{ readonly stdout: string }>;
}

export type LiveSystemDependencies = PiSessionFilesystemDependencies & ArgvSubprocessDependencies;
export interface PiSessionLookup {
  readonly repository: string;
  readonly sessionFile?: string;
  readonly sessionRoot: string;
}
export type PiSessionSelection = {
  readonly selection: "latest-persisted";
  readonly sessionFile: string;
};
/** Pi session scans inspect at most 256 directory entries. */
const maximumDirectoryEntries = 256;
const terminationGraceMs = 100;
const noSessions = "No persisted Pi sessions found";
const notRegular = "Pi session file is not a regular file";
const rejected = (reason: string) => new LiveSystemRejected({ reason });
const isAbsolutePath = (path: string) => path.startsWith("/");
const hasParentTraversal = (path: string) => path.split("/").includes("..");
const stripTrailingSlash = (path: string) => (path === "/" ? path : path.replace(/\/+$/, ""));
const isContainedPath = (path: string, root: string) => {
  const containedRoot = stripTrailingSlash(root);
  return (
    isAbsolutePath(path) &&
    isAbsolutePath(containedRoot) &&
    !hasParentTraversal(path) &&
    !hasParentTraversal(containedRoot) &&
    (containedRoot === "/" || path === containedRoot || path.startsWith(`${containedRoot}/`))
  );
};
const isSessionFile = (path: string) => path.endsWith(".jsonl");
const isSessionFileName = (name: string) =>
  isSessionFile(name) && !name.includes("/") && !hasParentTraversal(name);
const errorCode = (cause: unknown) =>
  typeof cause === "object" && cause !== null && "code" in cause && typeof cause.code === "string"
    ? cause.code
    : undefined;
const isMissingPath = (cause: unknown) => errorCode(cause) === "ENOENT";
const systemFailure = (operation: string, cause: unknown) =>
  rejected(`${operation} failed: ${cause instanceof Error ? cause.message : String(cause)}`);
const missingIsUndefined = async <Result>(
  operation: () => Promise<Result>,
): Promise<Result | undefined> => {
  try {
    return await operation();
  } catch (cause) {
    if (isMissingPath(cause)) return undefined;
    throw cause;
  }
};
const filesystemOperation = <Result>(
  operation: string,
  try_: () => Promise<Result>,
  catch_: (cause: unknown) => LiveSystemRejected = (cause) => systemFailure(operation, cause),
): FsEffect<Result> => Effect.tryPromise({ try: try_, catch: catch_ });
export const derivePiSessionDirectory = (
  lookup: Pick<PiSessionLookup, "repository" | "sessionRoot">,
): FsEffect<string> => {
  if (
    !isAbsolutePath(lookup.repository) ||
    !isAbsolutePath(lookup.sessionRoot) ||
    hasParentTraversal(lookup.repository) ||
    hasParentTraversal(lookup.sessionRoot)
  )
    return Effect.fail(rejected("Pi session directory is invalid"));
  return Effect.succeed(
    `${stripTrailingSlash(lookup.sessionRoot)}/-${lookup.repository.replaceAll("/", "-")}--`,
  );
};
type Candidate = { readonly mtime: Date; readonly name: string; readonly sessionFile: string };
const selectLatest = (current: Candidate | undefined, next: Candidate) =>
  current === undefined ||
  next.mtime.getTime() > current.mtime.getTime() ||
  (next.mtime.getTime() === current.mtime.getTime() && next.name > current.name)
    ? next
    : current;
export const selectPiSession = (
  dependencies: PiSessionFilesystemDependencies,
  lookup: PiSessionLookup,
): FsEffect<PiSessionSelection> =>
  Effect.gen(function* () {
    const sessionDirectory = yield* derivePiSessionDirectory(lookup);
    if (
      lookup.sessionFile !== undefined &&
      (!isContainedPath(lookup.sessionFile, sessionDirectory) || !isSessionFile(lookup.sessionFile))
    )
      return yield* Effect.fail(rejected("Pi session selection is invalid"));
    const canonicalRoot = yield* dependencies.canonicalize(lookup.sessionRoot);
    const canonicalDirectory = yield* dependencies.canonicalize(
      lookup.sessionFile === undefined ? sessionDirectory : dirname(lookup.sessionFile),
    );
    if (canonicalRoot === undefined || canonicalDirectory === undefined)
      return yield* Effect.fail(rejected(noSessions));
    if (!isContainedPath(canonicalDirectory, canonicalRoot))
      return yield* Effect.fail(rejected("Pi session selection is invalid"));
    if (lookup.sessionFile !== undefined) {
      const details = yield* dependencies.stat(lookup.sessionFile);
      if (details === undefined) return yield* Effect.fail(rejected(noSessions));
      if (!details.isRegular) return yield* Effect.fail(rejected(notRegular));
      return { selection: "latest-persisted", sessionFile: lookup.sessionFile };
    }
    const entries = yield* dependencies.listDirectory(sessionDirectory);
    if (entries.length > maximumDirectoryEntries)
      return yield* Effect.fail(
        rejected(`Pi session directory exceeds ${maximumDirectoryEntries} entries`),
      );
    let latest: Candidate | undefined;
    for (const name of entries) {
      if (!isSessionFileName(name)) continue;
      const sessionFile = `${sessionDirectory}/${name}`;
      const details = yield* dependencies.stat(sessionFile);
      if (details !== undefined && details.isRegular)
        latest = selectLatest(latest, { ...details, name, sessionFile });
    }
    if (latest === undefined) return yield* Effect.fail(rejected(noSessions));
    return { selection: "latest-persisted", sessionFile: latest.sessionFile };
  });
const readBoundedText = async (path: string, maximumBytes: number): Promise<string> => {
  if (!Number.isSafeInteger(maximumBytes) || maximumBytes <= 0)
    throw new Error("maximum bytes is invalid");
  const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    if (!(await file.stat()).isFile()) throw new Error(notRegular);
    const bytes = new Uint8Array(maximumBytes + 1);
    const { bytesRead } = await file.read(bytes, 0, bytes.length, 0);
    if (bytesRead > maximumBytes) throw new Error("file exceeds maximum bytes");
    return new TextDecoder().decode(bytes.subarray(0, bytesRead));
  } finally {
    await file.close();
  }
};
const terminate = (child: ReturnType<typeof Bun.spawn>, signal: "SIGKILL" | "SIGTERM") => {
  if (process.platform !== "win32") {
    try {
      process.kill(-child.pid, signal);
    } catch {
      // The process group may have already exited or be unavailable to this runtime.
    }
  }
  try {
    child.kill(signal);
  } catch {
    // The child may have exited between the group signal and this direct signal.
  }
};

const waitForExitOrGrace = async (child: ReturnType<typeof Bun.spawn>): Promise<void> => {
  let grace: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      child.exited,
      new Promise<void>((resolve) => {
        grace = setTimeout(resolve, terminationGraceMs);
      }),
    ]);
  } catch {
    // Bun currently resolves `exited`; retain finalization even if that changes.
  } finally {
    if (grace !== undefined) clearTimeout(grace);
  }
};

const collectBoundedStdout = async (
  file: string,
  arguments_: ReadonlyArray<string>,
  options: LiveSubprocessOptions,
  signal: AbortSignal,
  registerFinalizer: (finalizer: () => Promise<void>) => void,
): Promise<{ readonly stdout: string }> => {
  const child = Bun.spawn([file, ...arguments_], {
    detached: true,
    stderr: "ignore",
    stdout: "pipe",
  });
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  let deadline: ReturnType<typeof setTimeout> | undefined;
  let finalization: Promise<void> | undefined;
  let abortReason: Error | undefined;
  let rejectAbort!: (reason: Error) => void;
  const aborted = new Promise<never>((_, reject) => {
    rejectAbort = reject;
  });

  const onAbort = () => requestAbort(new Error("process interrupted"));
  const clearResources = () => {
    if (deadline !== undefined) clearTimeout(deadline);
    signal.removeEventListener("abort", onAbort);
  };
  const finalize = (abnormal: boolean): Promise<void> => {
    if (finalization !== undefined) return finalization;
    finalization = (async () => {
      clearResources();
      let cancellation: Promise<void> | undefined;
      if (abnormal && reader !== undefined) {
        try {
          cancellation = reader.cancel().catch(() => undefined);
        } catch {
          // A concurrent stream failure still requires process finalization.
        }
      }
      if (abnormal) {
        if (child.exitCode === null) {
          terminate(child, "SIGTERM");
          await waitForExitOrGrace(child);
          if (child.exitCode === null) terminate(child, "SIGKILL");
        }
        try {
          await child.exited;
        } catch {
          // Finalization must still release the reader if exit observation fails.
        }
      }
      if (cancellation !== undefined) await cancellation;
      if (reader !== undefined) {
        try {
          reader.releaseLock();
        } catch {
          // A failed reader has no lock to release.
        }
      }
    })();
    return finalization;
  };
  const requestAbort = (reason: Error) => {
    if (abortReason !== undefined) return;
    abortReason = reason;
    void finalize(true);
    rejectAbort(reason);
  };

  registerFinalizer(() => finalize(true));
  let completed = false;
  try {
    reader = child.stdout.getReader();
    signal.addEventListener("abort", onAbort, { once: true });
    if (signal.aborted) requestAbort(new Error("process interrupted"));
    else {
      deadline = setTimeout(
        () => requestAbort(new Error("process exceeded deadline")),
        options.deadlineMs,
      );
    }

    const chunks: Uint8Array[] = [];
    let totalBytes = 0;
    while (true) {
      const next = await Promise.race([reader.read(), aborted]);
      if (next.done) break;
      totalBytes += next.value.byteLength;
      if (totalBytes > options.maximumStdoutBytes) throw new Error("stdout exceeds maximum bytes");
      chunks.push(next.value);
    }

    const exitCode = await child.exited;
    if (abortReason !== undefined) throw abortReason;
    if (exitCode !== 0) throw new Error("process exited with a nonzero code");

    const bytes = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    completed = true;
    return { stdout: new TextDecoder().decode(bytes) };
  } finally {
    await finalize(!completed);
  }
};

const boundedDirectoryEntries = async (path: string): Promise<readonly string[]> => {
  try {
    const directory = await opendir(path);
    const entries: string[] = [];
    try {
      while (true) {
        const entry = await directory.read();
        if (entry === null) return entries;
        if (entries.length === maximumDirectoryEntries)
          throw new Error(`Pi session directory exceeds ${maximumDirectoryEntries} entries`);
        entries.push(entry.name);
      }
    } finally {
      await directory.close();
    }
  } catch (cause) {
    if (isMissingPath(cause)) return [];
    throw cause;
  }
};
const readFailure = (cause: unknown) =>
  errorCode(cause) === "ELOOP" || (cause instanceof Error && cause.message === notRegular)
    ? rejected(notRegular)
    : systemFailure("read text", cause);
/** Node/Bun lack openat: intermediate same-user replacement can race canonical checks; final open is O_NOFOLLOW and regular-verified. */
export const makePiSessionFilesystemDependencies = (): PiSessionFilesystemDependencies => ({
  canonicalize: (path) =>
    filesystemOperation("canonicalize path", () => missingIsUndefined(() => realpath(path))),
  listDirectory: (path) =>
    filesystemOperation("list directory", () => boundedDirectoryEntries(path)),
  readText: (path, maximumBytes) =>
    filesystemOperation("read text", () => readBoundedText(path, maximumBytes), readFailure),
  stat: (path) =>
    filesystemOperation("stat path", async () => {
      const details = await missingIsUndefined(() => lstat(path));
      return details === undefined
        ? undefined
        : { isRegular: details.isFile(), mtime: details.mtime };
    }),
});

const isLiveSubprocessOptions = (options: LiveSubprocessOptions): boolean =>
  Number.isSafeInteger(options.deadlineMs) &&
  options.deadlineMs > 0 &&
  Number.isSafeInteger(options.maximumStdoutBytes) &&
  options.maximumStdoutBytes > 0;

const makeArgvSubprocessDependencies = (): ArgvSubprocessDependencies => ({
  run: (file, arguments_, options) => {
    if (!isLiveSubprocessOptions(options))
      return Effect.fail(rejected("Gentle AI request is invalid"));

    let finalize = async (): Promise<void> => undefined;
    return Effect.uninterruptibleMask((restore) =>
      restore(
        Effect.tryPromise({
          try: (signal) =>
            collectBoundedStdout(file, arguments_, options, signal, (finalizer) => {
              finalize = finalizer;
            }),
          catch: () => rejected("Live subprocess failed"),
        }),
      ).pipe(Effect.onInterrupt(() => Effect.promise(() => finalize()))),
    );
  },
});

/** Composes filesystem-only Pi session access with argv-only subprocess execution. */
export const makeLiveSystemDependencies = (): LiveSystemDependencies => ({
  ...makePiSessionFilesystemDependencies(),
  ...makeArgvSubprocessDependencies(),
});
