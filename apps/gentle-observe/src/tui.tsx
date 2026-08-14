import "@opentui/solid/preload";

import { createCliRenderer, type CliRenderer } from "@opentui/core";
import { render } from "@opentui/solid";

import { App } from "./app";

const destroyRenderer = (renderer: CliRenderer) => {
  if (!renderer.isDestroyed) {
    renderer.destroy();
  }
};

export const startTui = async () => {
  const renderer = await createCliRenderer({ exitOnCtrlC: true });

  try {
    await render(() => <App onQuit={() => destroyRenderer(renderer)} />, renderer);
  } catch (cause) {
    destroyRenderer(renderer);
    throw cause;
  }
};
