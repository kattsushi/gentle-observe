import { describe, expect, test } from "bun:test";
import appManifest from "../package.json" with { type: "json" };
import rootManifest from "../../../package.json" with { type: "json" };

interface PackageJson {
  readonly dependencies?: Record<string, string>;
  readonly devDependencies?: Record<string, string>;
  readonly overrides?: Record<string, string>;
  readonly workspaces?: {
    readonly catalog?: Record<string, string>;
    readonly catalogs?: {
      readonly tooling?: Record<string, string>;
    };
  };
}

const dependencyNames = (manifest: PackageJson) =>
  new Set([
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.devDependencies ?? {}),
  ]);

const publishedPeers = {
  atomReact: {
    effect: "^4.0.0-rc.108",
    react: ">=19.2.7 <20.0.0",
    scheduler: ">=0.27.0 <0.28.0",
  },
  openTuiReact: {
    react: ">=19.2.0",
    reactDevtoolsCore: "^7.0.1",
    ws: "^8.18.0",
  },
} as const;

const exactTuple = {
  "@effect/atom-react": "4.0.0-rc.108",
  "@opentui/core": "0.5.2",
  "@opentui/core-linux-x64": "0.5.2",
  "@opentui/react": "0.5.2",
  "@types/react": "19.2.18",
  "@types/react-reconciler": "0.33.0",
  "@types/scheduler": "0.26.0",
  "@types/ws": "8.18.1",
  effect: "4.0.0-rc.108",
  react: "19.2.8",
  "react-devtools-core": "7.0.1",
  scheduler: "0.27.0",
  ws: "8.21.3",
};

describe("observability dependency compatibility", () => {
  test("rejects peer-incompatible, downgraded, overridden, legacy, and fallback tuples", async () => {
    const root: PackageJson = rootManifest;
    const app: PackageJson = appManifest;
    const catalog = root.workspaces?.catalog ?? {};
    const names = new Set([...dependencyNames(root), ...dependencyNames(app)]);
    const violations = [
      Object.entries(exactTuple).every(([name, version]) => catalog[name] === version)
        ? undefined
        : "the root catalog must pin the exact verified React tuple",
      [
        "@effect/atom-react",
        "@opentui/core",
        "@opentui/core-linux-x64",
        "@opentui/react",
        "effect",
        "react",
        "react-devtools-core",
        "scheduler",
        "ws",
      ].every((name) => app.dependencies?.[name] === "catalog:") &&
      ["@types/react", "@types/react-reconciler", "@types/scheduler", "@types/ws"].every(
        (name) => app.devDependencies?.[name] === "catalog:",
      )
        ? undefined
        : "the app must declare every required runtime peer and type package",
      publishedPeers.atomReact.effect === "^4.0.0-rc.108" &&
      publishedPeers.atomReact.react === ">=19.2.7 <20.0.0" &&
      publishedPeers.atomReact.scheduler === ">=0.27.0 <0.28.0" &&
      publishedPeers.openTuiReact.react === ">=19.2.0" &&
      publishedPeers.openTuiReact.reactDevtoolsCore === "^7.0.1" &&
      publishedPeers.openTuiReact.ws === "^8.18.0"
        ? undefined
        : "the tuple must satisfy published Atom React and OpenTUI React peers",
      root.workspaces?.catalogs?.tooling?.typescript === "7.0.2"
        ? undefined
        : "TypeScript must remain unchanged at 7.0.2",
      root.overrides === undefined && app.overrides === undefined
        ? undefined
        : "peer overrides are forbidden",
      [
        "@effect/atom",
        "@effect/atom-solid",
        "@effect/atom-solid-legacy",
        "@effect/atom-solid-fallback",
        "@opentui/solid",
        "solid-js",
      ].some((name) => names.has(name))
        ? "Solid, legacy, and fallback packages are forbidden"
        : undefined,
    ].filter((violation): violation is string => violation !== undefined);

    expect(violations).toEqual([]);
  });
});
