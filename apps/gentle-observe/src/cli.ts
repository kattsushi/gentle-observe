import { Effect, Option, Stdio, Stream } from "effect";
import { CliError, Command, Flag } from "effect/unstable/cli";

import type { DemoScenario } from "./demo/layers";
import { version } from "./version";

const writeOutput = Effect.fn("GentleObserveCli.writeOutput")(function* (message: string) {
  const stdio = yield* Stdio.Stdio;
  yield* Stream.make(message).pipe(Stream.run(stdio.stdout()));
});

export interface RendererOptions {
  readonly change?: string;
  readonly demo: boolean;
  readonly live?: boolean;
  readonly piSession?: string;
  readonly scenario: DemoScenario;
}

type StartRenderer = (options: RendererOptions) => Effect.Effect<void, CliError.UserError>;

const startInteractiveRenderer = Effect.fn("GentleObserveCli.startRenderer")(
  (options: RendererOptions) =>
    Effect.tryPromise({
      try: async () => {
        Bun.env.DEV = "false";
        return (await import("./tui")).startTui(options);
      },
      catch: (cause) =>
        new CliError.UserError({
          cause,
          userMessage: "gentle-observe could not start the terminal renderer.",
        }),
    }),
);

const runCommand = Effect.fn("GentleObserveCli.runCommand")(function* (
  options: RendererOptions & { readonly version: boolean },
  startRenderer: StartRenderer,
) {
  const stdio = yield* Stdio.Stdio;

  if (options.version) {
    return yield* writeOutput(`gentle-observe ${version}\n`);
  }

  if (options.demo && options.live) {
    return yield* new CliError.UserError({
      cause: "conflicting modes",
      userMessage: "--demo and --live cannot be used together.",
    });
  }

  if (options.live && options.change === undefined) {
    return yield* new CliError.UserError({
      cause: "live change required",
      userMessage: "--live requires --change <name>.",
    });
  }

  if (options.piSession !== undefined && !options.piSession.startsWith("/")) {
    return yield* new CliError.UserError({
      cause: "Pi session path is not absolute",
      userMessage: "--pi-session must be an absolute path.",
    });
  }

  const stdinIsTerminal = yield* stdio.stdinIsTerminal;
  const stdoutIsTerminal = yield* stdio.stdoutIsTerminal;

  if (!stdinIsTerminal || !stdoutIsTerminal) {
    return yield* new CliError.UserError({
      cause: "terminal required",
      userMessage: "gentle-observe requires an interactive terminal.",
    });
  }

  return yield* startRenderer(
    options.live
      ? {
          change: options.change,
          demo: false,
          live: true,
          ...(options.piSession === undefined ? {} : { piSession: options.piSession }),
          scenario: options.scenario,
        }
      : { demo: options.demo, scenario: options.scenario },
  );
});

export const makeCommand = (startRenderer: StartRenderer = startInteractiveRenderer) =>
  Command.make(
    "gentle-observe",
    {
      change: Flag.optional(Flag.string("change")),
      demo: Flag.boolean("demo"),
      live: Flag.boolean("live"),
      piSession: Flag.optional(Flag.string("pi-session")),
      scenario: Flag.choice("scenario", ["normal", "degraded", "complex"]).pipe(
        Flag.withDefault("normal"),
      ),
      version: Flag.boolean("version"),
    },
    (options) =>
      runCommand(
        {
          ...options,
          change: Option.getOrUndefined(options.change),
          piSession: Option.getOrUndefined(options.piSession),
        },
        startRenderer,
      ),
  );

export const command = makeCommand();
