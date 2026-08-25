import { BunRuntime, BunServices } from "@effect/platform-bun";
import { Data, Effect, FileSystem, Path } from "effect";

import packageMetadata from "./package.json" with { type: "json" };

class CompilationError extends Data.TaggedError("CompilationError")<{
  readonly operation: "Bun.build";
  readonly logs: ReadonlyArray<string>;
  readonly message: string;
  readonly cause: unknown;
}> {}

const compilationError = (logs: ReadonlyArray<string>, cause: unknown) =>
  new CompilationError({
    operation: "Bun.build",
    logs,
    message: [
      "[compilation] Unable to compile gentle-observe.",
      "operation: Bun.build",
      ...logs,
    ].join("\n"),
    cause,
  });

const failureLogs = (cause: unknown): ReadonlyArray<string> =>
  cause instanceof AggregateError ? cause.errors.map(String) : [String(cause)];

const compile = Effect.fn("GentleObserveBuild.compile")(function* (
  entrypoint: string,
  outfile: string,
) {
  const result = yield* Effect.tryPromise({
    try: () =>
      Bun.build({
        entrypoints: [entrypoint],
        compile: {
          outfile,
          target: "bun-linux-x64-baseline",
        },
        define: {
          __GENTLE_OBSERVE_VERSION__: JSON.stringify(packageMetadata.version),
        },
      }),
    catch: (cause) => compilationError(failureLogs(cause), cause),
  });

  if (!result.success) {
    return yield* Effect.fail(
      compilationError(
        result.logs.map((log) => log.message),
        result,
      ),
    );
  }
});

const build = Effect.fn("GentleObserveBuild.build")(function* () {
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const outputDirectory = path.resolve(import.meta.dir, "../../dist/apps/gentle-observe");
  const outputFile = path.join(outputDirectory, "gentle-observe");
  const entrypoint = path.join(import.meta.dir, "src/main.ts");

  yield* Effect.sync(() => {
    Bun.env.OPENTUI_LIBC = "glibc";
  });
  yield* fileSystem.remove(outputDirectory, { force: true, recursive: true });
  yield* fileSystem.makeDirectory(outputDirectory, { recursive: true });
  yield* compile(entrypoint, outputFile);
});

BunRuntime.runMain(build().pipe(Effect.provide(BunServices.layer)));
