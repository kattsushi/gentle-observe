import packageMetadata from "../package.json" with { type: "json" };

declare const __GENTLE_OBSERVE_VERSION__: string | undefined;

export const version =
  typeof __GENTLE_OBSERVE_VERSION__ === "string"
    ? __GENTLE_OBSERVE_VERSION__
    : packageMetadata.version;
