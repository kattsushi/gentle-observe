import { Data, Effect } from "effect";

export class LiveSourceRejected extends Data.TaggedClass("LiveSourceRejected")<{
  readonly reason: string;
}> {}

export interface PiSessionDependencies {
  readonly readText: (
    path: string,
    maximumBytes: number,
  ) => Effect.Effect<string, LiveSourceRejected>;
}

export interface PiSessionRequest {
  readonly maximumBytes: number;
  readonly repository: string;
  readonly sessionFile: string;
}

/** Metadata observed in persisted Pi session history; it does not assert a live runtime. */
export interface PiRuntimeActivity {
  readonly cwd: string;
  readonly latestEntry: {
    readonly timestamp: string;
    readonly type: string;
  };
  readonly sessionId: string;
}

const rejected = (reason: string) => new LiveSourceRejected({ reason });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isIsoTimestamp = (value: unknown): value is string =>
  typeof value === "string" &&
  value.length > 0 &&
  !Number.isNaN(Date.parse(value)) &&
  new Date(value).toISOString() === value;

const isSessionHeader = (
  value: unknown,
): value is {
  readonly cwd: string;
  readonly id: string;
  readonly parentSession?: string;
  readonly timestamp: string;
  readonly type: "session";
  readonly version: 3;
} => {
  if (!isRecord(value)) {
    return false;
  }

  const keys = Object.keys(value);
  return (
    keys.length >= 5 &&
    keys.length <= 6 &&
    keys.every((key) =>
      ["cwd", "id", "parentSession", "timestamp", "type", "version"].includes(key),
    ) &&
    typeof value.cwd === "string" &&
    value.cwd.length > 0 &&
    typeof value.id === "string" &&
    value.id.length > 0 &&
    (!("parentSession" in value) ||
      (typeof value.parentSession === "string" && value.parentSession.length > 0)) &&
    isIsoTimestamp(value.timestamp) &&
    value.type === "session" &&
    value.version === 3
  );
};

const isPersistedEntryType = (value: unknown): value is string =>
  typeof value === "string" && value.length <= 128 && /^[a-z][a-z0-9_]*$/.test(value);

const isPersistedEntry = (
  value: unknown,
): value is { readonly timestamp: string; readonly type: string } =>
  isRecord(value) && isIsoTimestamp(value.timestamp) && isPersistedEntryType(value.type);

const parseCompletedLine = (line: string): unknown => {
  try {
    return JSON.parse(line) as unknown;
  } catch {
    return undefined;
  }
};

export const readPiSession = (
  dependencies: PiSessionDependencies,
  request: PiSessionRequest,
): Effect.Effect<PiRuntimeActivity, LiveSourceRejected> =>
  Effect.gen(function* () {
    if (
      !Number.isSafeInteger(request.maximumBytes) ||
      request.maximumBytes <= 0 ||
      request.repository.length === 0 ||
      request.sessionFile.length === 0
    ) {
      return yield* Effect.fail(rejected("Pi session request is invalid"));
    }

    const text = yield* dependencies.readText(request.sessionFile, request.maximumBytes);
    if (new TextEncoder().encode(text).byteLength > request.maximumBytes) {
      return yield* Effect.fail(rejected("Pi session exceeds maximum bytes"));
    }

    const completeLines = text.split("\n").slice(0, -1);
    const header = parseCompletedLine(completeLines[0] ?? "");

    if (!isSessionHeader(header)) {
      return yield* Effect.fail(rejected("Pi session header is invalid"));
    }
    if (header.cwd !== request.repository) {
      return yield* Effect.fail(rejected("Pi session cwd does not match repository"));
    }

    let latestEntry: PiRuntimeActivity["latestEntry"] | undefined;
    for (const line of completeLines.slice(1)) {
      const entry = parseCompletedLine(line);
      if (!isPersistedEntry(entry)) {
        return yield* Effect.fail(rejected("Pi session entry is invalid"));
      }
      latestEntry = { timestamp: entry.timestamp, type: entry.type };
    }

    if (latestEntry === undefined) {
      return yield* Effect.fail(rejected("Pi session has no persisted entries"));
    }

    return { cwd: header.cwd, latestEntry, sessionId: header.id };
  });
