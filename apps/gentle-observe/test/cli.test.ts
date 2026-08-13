import { describe, expect, test } from "bun:test";
import { BunServices } from "@effect/platform-bun";
import { Effect, Layer, Sink, Stdio, Stream } from "effect";
import { CliConfig, Command, GlobalFlag } from "effect/unstable/cli";

import { makeCommand } from "../src/cli";
import { version } from "../src/version";

const runCommand = (args: string[], terminal = { stdinTTY: true, stdoutTTY: true }) => {
  let rendererStarts = 0;
  const output: string[] = [];
  const decodeMessage = (message: string | Uint8Array) =>
    typeof message === "string" ? message : new TextDecoder().decode(message);
  const stdioLayer = Stdio.layerTest({
    stdin: Stream.empty,
    stdinIsTerminal: Effect.succeed(terminal.stdinTTY),
    stdoutIsTerminal: Effect.succeed(terminal.stdoutTTY),
    stderr: () => Sink.drain,
    stdout: () =>
      Sink.forEach((message: string | Uint8Array) =>
        Effect.sync(() => output.push(decodeMessage(message))),
      ),
  });
  const command = makeCommand(() => Effect.sync(() => (rendererStarts += 1)));
  const commandProgram = Command.runWith(command, { version, renderErrors: false })(args).pipe(
    Effect.provide(CliConfig.layer({ builtIns: [GlobalFlag.Help] })),
    Effect.provide(Layer.merge(BunServices.layer, stdioLayer)),
  );

  return {
    output,
    rendererStarts: () => rendererStarts,
    run: () => Effect.runPromiseExit(commandProgram),
  };
};

describe("gentle-observe CLI", () => {
  test("renders Help without starting the renderer", async () => {
    const fixture = runCommand(["--help"]);

    expect((await fixture.run())._tag).toBe("Success");

    expect(fixture.rendererStarts()).toBe(0);
  });

  test("prints the stable version without starting the renderer", async () => {
    const fixture = runCommand(["--version"]);

    expect((await fixture.run())._tag).toBe("Success");

    expect(fixture.output).toEqual(["gentle-observe 0.1.0\n"]);
    expect(fixture.rendererStarts()).toBe(0);
  });

  test("attributes a mixed version invocation to its extra argument", async () => {
    const fixture = runCommand(["--version", "extra"]);
    const exit = await fixture.run();

    expect(exit._tag).toBe("Failure");

    expect(fixture.output).toEqual([]);
    expect(fixture.rendererStarts()).toBe(0);
  });

  test("rejects an unknown argument with usage without starting the renderer", async () => {
    const fixture = runCommand(["--unknown"]);
    const exit = await fixture.run();

    expect(exit._tag).toBe("Failure");

    expect(fixture.output).toEqual([]);
    expect(fixture.rendererStarts()).toBe(0);
  });

  test("rejects a non-TTY launch without starting the renderer", async () => {
    const fixture = runCommand([], { stdinTTY: false, stdoutTTY: false });

    expect((await fixture.run())._tag).toBe("Failure");

    expect(fixture.output).toEqual([]);
    expect(fixture.rendererStarts()).toBe(0);
  });

  test("starts the renderer once for a TTY launch", async () => {
    const fixture = runCommand([]);

    expect((await fixture.run())._tag).toBe("Success");

    expect(fixture.rendererStarts()).toBe(1);
  });
});
