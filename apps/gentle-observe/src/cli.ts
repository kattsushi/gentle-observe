import { Effect, Stdio, Stream } from "effect";
import { CliError, Command, Flag } from "effect/unstable/cli";

import { version } from "./version";

const writeOutput = Effect.fn("GentleObserveCli.writeOutput")(function* (message: string) {
  const stdio = yield* Stdio.Stdio;
  yield* Stream.make(message).pipe(Stream.run(stdio.stdout()));
});

type StartRenderer = () => Effect.Effect<void, CliError.UserError>;

const startInteractiveRenderer = Effect.fn("GentleObserveCli.startRenderer")(() =>
  Effect.tryPromise({
    try: async () => (await import("./tui")).startTui(),
    catch: (cause) =>
      new CliError.UserError({
        cause,
        userMessage: "gentle-observe could not start the terminal renderer.",
      }),
  }),
);

const runCommand = Effect.fn("GentleObserveCli.runCommand")(function* (
  options: { readonly version: boolean },
  startRenderer: StartRenderer,
) {
  const stdio = yield* Stdio.Stdio;

  if (options.version) {
    return yield* writeOutput(`gentle-observe ${version}\n`);
  }

  const stdinIsTerminal = yield* stdio.stdinIsTerminal;
  const stdoutIsTerminal = yield* stdio.stdoutIsTerminal;

  if (!stdinIsTerminal || !stdoutIsTerminal) {
    return yield* new CliError.UserError({
      cause: "terminal required",
      userMessage: "gentle-observe requires an interactive terminal.",
    });
  }

  return yield* startRenderer();
});

export const makeCommand = (startRenderer: StartRenderer = startInteractiveRenderer) =>
  Command.make("gentle-observe", { version: Flag.boolean("version") }, (options) =>
    runCommand(options, startRenderer),
  );

export const command = makeCommand();
