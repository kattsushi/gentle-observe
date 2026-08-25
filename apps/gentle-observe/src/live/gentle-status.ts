import { isAbsolute, relative, resolve } from "node:path";

import { Data, Effect } from "effect";

export class GentleStatusRejected extends Data.TaggedClass("GentleStatusRejected")<{
  readonly reason: string;
}> {}

export interface GentleStatusDependencies {
  readonly now: () => Date;
  readonly run: (
    file: string,
    arguments_: ReadonlyArray<string>,
  ) => Effect.Effect<{ readonly stdout: string }, GentleStatusRejected>;
  readonly stat: (
    path: string,
  ) => Effect.Effect<{ readonly mtime: Date } | undefined, GentleStatusRejected>;
}

export interface GentleStatusRequest {
  readonly change: string;
  readonly changeRoot: string;
  readonly repository: string;
  readonly store: "openspec";
}

/** Process planning metadata; nextRecommended is advice, never a claim of a running phase. */
export interface GentleProcessStatus {
  readonly artifacts: ReadonlyArray<{
    readonly exists: boolean;
    readonly mtime: string | undefined;
    readonly name: string;
    readonly state: string;
  }>;
  readonly blocked: boolean;
  readonly change: string;
  readonly nextRecommended: GentleNextRecommended;
  readonly provenance: {
    readonly contract: "gentle-ai.sdd-status/v1";
    readonly observedAt: string;
  };
}

const maximumStatusBytes = 1_048_576;
const contract = "gentle-ai.sdd-status/v1" as const;
const changeName = /^[a-z0-9][a-z0-9._-]*$/i;
const applyProgressStates = new Set(["missing", "partial", "done"]);
const nextRecommendedTokens = [
  "propose",
  "spec",
  "design",
  "tasks",
  "apply",
  "review",
  "verify",
  "remediate",
  "archive",
  "sdd-new",
  "select-change",
  "resolve-blockers",
  "resolve-review",
] as const;

export type GentleNextRecommended = (typeof nextRecommendedTokens)[number];
type ApplyProgressState = "missing" | "partial" | "done";

interface SddStatus {
  readonly artifactPaths: {
    readonly applyProgress: ReadonlyArray<string>;
  };
  readonly artifactStore: "openspec";
  readonly artifacts: {
    readonly applyProgress: ApplyProgressState;
  };
  readonly blockedReasons: ReadonlyArray<string>;
  readonly changeName: string;
  readonly changeRoot: string;
  readonly nextRecommended: GentleNextRecommended;
  readonly schemaName: "gentle-ai.sdd-status";
  readonly schemaVersion: 1;
}

const rejected = () => new GentleStatusRejected({ reason: "Gentle status contract is invalid" });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNextRecommended = (value: unknown): value is GentleNextRecommended =>
  typeof value === "string" && nextRecommendedTokens.some((token) => token === value);

const isSddStatus = (value: unknown, request: GentleStatusRequest): value is SddStatus =>
  isRecord(value) &&
  value.schemaName === "gentle-ai.sdd-status" &&
  value.schemaVersion === 1 &&
  value.changeName === request.change &&
  value.artifactStore === "openspec" &&
  value.changeRoot === request.changeRoot &&
  isNextRecommended(value.nextRecommended) &&
  Array.isArray(value.blockedReasons) &&
  value.blockedReasons.every((reason) => typeof reason === "string" && reason.length > 0) &&
  isRecord(value.artifactPaths) &&
  Array.isArray(value.artifactPaths.applyProgress) &&
  value.artifactPaths.applyProgress.every((path) => typeof path === "string" && path.length > 0) &&
  isRecord(value.artifacts) &&
  typeof value.artifacts.applyProgress === "string" &&
  applyProgressStates.has(value.artifacts.applyProgress);

const hasParentTraversal = (path: string) => path.split("/").includes("..");

const isContainedFile = (root: string, candidate: string): boolean => {
  const pathFromRoot = relative(root, candidate);
  return (
    !hasParentTraversal(root) &&
    !hasParentTraversal(candidate) &&
    pathFromRoot.length > 0 &&
    pathFromRoot !== ".." &&
    !pathFromRoot.startsWith("../") &&
    !isAbsolute(pathFromRoot)
  );
};

const isRequestValid = (request: GentleStatusRequest): boolean => {
  if (
    !changeName.test(request.change) ||
    !isAbsolute(request.repository) ||
    !isAbsolute(request.changeRoot) ||
    request.store !== "openspec"
  ) {
    return false;
  }

  const repository = resolve(request.repository);
  const changeRoot = resolve(request.changeRoot);
  return (
    changeRoot === resolve(repository, "openspec", "changes", request.change) &&
    isContainedFile(repository, changeRoot)
  );
};

const parseStatus = (stdout: string): unknown => {
  try {
    return JSON.parse(stdout) as unknown;
  } catch {
    return undefined;
  }
};

export const readGentleStatus = (
  dependencies: GentleStatusDependencies,
  request: GentleStatusRequest,
): Effect.Effect<GentleProcessStatus, GentleStatusRejected> =>
  Effect.gen(function* () {
    if (!isRequestValid(request)) {
      return yield* Effect.fail(rejected());
    }

    const output = yield* dependencies.run("gentle-ai", [
      "sdd-status",
      request.change,
      "--cwd",
      request.repository,
      "--contract",
      contract,
      "--json",
    ]);
    if (new TextEncoder().encode(output.stdout).byteLength > maximumStatusBytes) {
      return yield* Effect.fail(rejected());
    }

    const status = parseStatus(output.stdout);
    if (!isSddStatus(status, request)) {
      return yield* Effect.fail(rejected());
    }

    const repository = resolve(request.repository);
    const changeRoot = resolve(request.changeRoot);
    if (
      !status.artifactPaths.applyProgress.every(
        (path) =>
          isAbsolute(path) &&
          isContainedFile(repository, path) &&
          isContainedFile(changeRoot, path),
      )
    ) {
      return yield* Effect.fail(rejected());
    }

    const artifacts = yield* Effect.forEach(status.artifactPaths.applyProgress, (path) =>
      Effect.map(dependencies.stat(path), (details) => ({
        exists: details !== undefined,
        mtime: details === undefined ? undefined : details.mtime.toISOString(),
        name: "applyProgress",
        state: status.artifacts.applyProgress,
      })),
    );

    return {
      artifacts,
      blocked: status.blockedReasons.length > 0,
      change: status.changeName,
      nextRecommended: status.nextRecommended,
      provenance: { contract, observedAt: dependencies.now().toISOString() },
    };
  });
