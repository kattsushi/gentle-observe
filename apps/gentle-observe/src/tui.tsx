import "@opentui/solid/preload";

import { createCliRenderer, type CliRenderer } from "@opentui/core";
import { render } from "@opentui/solid";
import { Effect } from "effect";

import { App } from "./app";
import { acquireProjection, type ShellOptions } from "./ui/projection";

const destroyRenderer = (renderer: CliRenderer) => {
  if (!renderer.isDestroyed) {
    renderer.destroy();
  }
};

export const startTui = async (options: ShellOptions) => {
  const renderer = await createCliRenderer({ exitOnCtrlC: true });

  try {
    const projection = await Effect.runPromise(acquireProjection(options));
    await render(
      () => <App onQuit={() => destroyRenderer(renderer)} projection={projection} />,
      renderer,
    );
  } catch (cause) {
    destroyRenderer(renderer);
    throw cause;
  }
};
