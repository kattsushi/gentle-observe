import { BunRuntime, BunServices } from "@effect/platform-bun";
import { Effect } from "effect";
import { CliConfig, Command, GlobalFlag } from "effect/unstable/cli";

import { command } from "./cli";
import { version } from "./version";

const program = Command.run(command, { version }).pipe(
  Effect.provide(CliConfig.layer({ builtIns: [GlobalFlag.Help] })),
  Effect.provide(BunServices.layer),
);

BunRuntime.runMain(program);
