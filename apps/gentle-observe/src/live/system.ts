import { readdir, open, stat as statFile } from "node:fs/promises";

import { Data, Effect } from "effect";

export class LiveSystemRejected extends Data.TaggedClass("LiveSystemRejected")<{
  readonly reason: string;
}> {}

export interface LiveSystemDependencies {
  readonly listDirectory: (
    path: string,
  ) => Effect.Effect<ReadonlyArray<string>, LiveSystemRejected>;
  readonly readText: (
    path: string,
    maximumBytes: number,
  ) => Effect.Effect<string, LiveSystemRejected>;
  readonly run: (
    file: string,
    arguments_: ReadonlyArray<string>,
    options: { readonly deadlineMs: number; readonly maximumStdoutBytes: number },
  ) => Effect.Effect<{ readonly stdout: string }, LiveSystemRejected>;
  readonly stat: (
    path: string,
  ) => Effect.Effect<{ readonly mtime: Date } | undefined, LiveSystemRejected>;
}

export interface PiSessionLookup {
  readonly repository: string;
  readonly sessionFile?: string;
  readonly sessionRoot: string;
}

export interface PiSessionSelection {
  readonly selection: "latest-persisted";
  readonly sessionFile: string;
}

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

export const derivePiSessionDirectory = (
  lookup: Pick<PiSessionLookup, "repository" | "sessionRoot">,
): Effect.Effect<string, LiveSystemRejected> => {
  if (
    !isAbsolutePath(lookup.repository) ||
    !isAbsolutePath(lookup.sessionRoot) ||
    hasParentTraversal(lookup.repository) ||
    hasParentTraversal(lookup.sessionRoot)
  ) {
    return Effect.fail(rejected("Pi session directory is invalid"));
  }

  return Effect.succeed(
    `${stripTrailingSlash(lookup.sessionRoot)}/-${lookup.repository.replaceAll("/", "-")}--`,
  );
};

export const selectPiSession = (
  dependencies: LiveSystemDependencies,
  lookup: PiSessionLookup,
): Effect.Effect<PiSessionSelection, LiveSystemRejected> =>
  Effect.gen(function* () {
    const sessionDirectory = yield* derivePiSessionDirectory(lookup);

    if (lookup.sessionFile !== undefined) {
      if (
        !isContainedPath(lookup.sessionFile, sessionDirectory) ||
        !isSessionFile(lookup.sessionFile)
      ) {
        return yield* Effect.fail(rejected("Pi session selection is invalid"));
      }

      return { selection: "latest-persisted", sessionFile: lookup.sessionFile };
    }

    const entries = yield* dependencies.listDirectory(sessionDirectory);
    const sessionFiles = entries
      .filter(isSessionFileName)
      .map((name) => `${sessionDirectory}/${name}`);
    const persisted = yield* Effect.forEach(sessionFiles, (sessionFile) =>
      dependencies
        .stat(sessionFile)
        .pipe(
          Effect.map((stat) =>
            stat === undefined ? undefined : { mtime: stat.mtime, sessionFile },
          ),
        ),
    );
    const latest = persisted
      .filter(
        (session): session is { readonly mtime: Date; readonly sessionFile: string } =>
          session !== undefined,
      )
      .sort(
        (left, right) =>
          right.mtime.getTime() - left.mtime.getTime() ||
          right.sessionFile.localeCompare(left.sessionFile),
      )[0];

    if (latest === undefined) {
      return yield* Effect.fail(rejected("No persisted Pi sessions found"));
    }

    return { selection: "latest-persisted", sessionFile: latest.sessionFile };
  });

const systemFailure = (operation: string, cause: unknown) =>
  rejected(`${operation} failed: ${cause instanceof Error ? cause.message : String(cause)}`);

const isMissingPath = (cause: unknown) =>
  typeof cause === "object" && cause !== null && "code" in cause && cause.code === "ENOENT";

const readBoundedText = async (path: string, maximumBytes: number): Promise<string> => {
  if (!Number.isSafeInteger(maximumBytes) || maximumBytes <= 0) {
    throw new Error("maximum bytes is invalid");
  }

  const file = await open(path, "r");
  try {
    const bytes = new Uint8Array(maximumBytes + 1);
    const { bytesRead } = await file.read(bytes, 0, bytes.length, 0);
    if (bytesRead > maximumBytes) throw new Error("file exceeds maximum bytes");
    return new TextDecoder().decode(bytes.subarray(0, bytesRead));
  } finally {
    await file.close();
  }
};

const collectBoundedStdout = async (
  file: string,
  arguments_: ReadonlyArray<string>,
  deadlineMs: number,
  maximumStdoutBytes: number,
): Promise<{ readonly stdout: string }> => {
  const child = Bun.spawn([file, ...arguments_], { stderr: "ignore", stdout: "pipe" });
  let timedOut = false;
  const deadline = setTimeout(() => {
    timedOut = true;
    child.kill();
  }, deadlineMs);
  const reader = child.stdout.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      totalBytes += next.value.byteLength;
      if (totalBytes > maximumStdoutBytes) {
        child.kill();
        throw new Error("stdout exceeds maximum bytes");
      }
      chunks.push(next.value);
    }

    const exitCode = await child.exited;
    if (timedOut) throw new Error("process exceeded deadline");
    if (exitCode !== 0) throw new Error(`process exited with code ${exitCode}`);

    const stdout = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      stdout.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return { stdout: new TextDecoder().decode(stdout) };
  } finally {
    clearTimeout(deadline);
    reader.releaseLock();
  }
};

/** Real read-only filesystem and argv-only subprocess authority for live adapters. */
export const makeLiveSystemDependencies = (): LiveSystemDependencies => ({
  listDirectory: (path) =>
    Effect.tryPromise({
      try: () => readdir(path),
      catch: (cause) => systemFailure("list directory", cause),
    }),
  readText: (path, maximumBytes) =>
    Effect.tryPromise({
      try: () => readBoundedText(path, maximumBytes),
      catch: (cause) => systemFailure("read text", cause),
    }),
  run: (file, arguments_, options) => {
    if (
      !Number.isSafeInteger(options.deadlineMs) ||
      options.deadlineMs <= 0 ||
      !Number.isSafeInteger(options.maximumStdoutBytes) ||
      options.maximumStdoutBytes <= 0
    ) {
      return Effect.fail(rejected("Gentle AI request is invalid"));
    }
    return Effect.tryPromise({
      try: () =>
        collectBoundedStdout(file, arguments_, options.deadlineMs, options.maximumStdoutBytes),
      catch: (cause) => systemFailure("run process", cause),
    });
  },
  stat: (path) =>
    Effect.tryPromise({
      try: async () => {
        try {
          const details = await statFile(path);
          return { mtime: details.mtime };
        } catch (cause) {
          if (isMissingPath(cause)) return undefined;
          throw cause;
        }
      },
      catch: (cause) => systemFailure("stat path", cause),
    }),
});
