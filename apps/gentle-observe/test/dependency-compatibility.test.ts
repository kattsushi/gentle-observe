import { readFile } from "node:fs/promises";

import { describe, expect, test } from "bun:test";

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

const readPackageJson = async (path: string) =>
  JSON.parse(await readFile(new URL(path, import.meta.url), "utf8")) as PackageJson;

const dependencyNames = (manifest: PackageJson) =>
  new Set([
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.devDependencies ?? {}),
  ]);

const publishedPeers = {
  atomSolid: {
    effect: "^4.0.0-rc.108",
    solid: ">=1.9.14 <2.0.0",
  },
  currentOpenTuiSolid: {
    solid: "1.9.12",
  },
  rejectedOpenTuiSolidDowngrade: {
    solid: "^1.9.9",
    typescript: "^5",
  },
} as const;

describe("observability dependency compatibility", () => {
  test("rejects peer-incompatible, downgraded, overridden, legacy, and fallback tuples", async () => {
    const [root, app] = await Promise.all([
      readPackageJson("../../../package.json"),
      readPackageJson("../package.json"),
    ]);
    const catalog = root.workspaces?.catalog ?? {};
    const names = new Set([...dependencyNames(root), ...dependencyNames(app)]);
    const violations = [
      catalog.effect === "4.0.0-rc.108" ? undefined : "Effect must remain 4.0.0-rc.108",
      catalog["@effect/atom-solid"] === "4.0.0-rc.108"
        ? undefined
        : "Atom Solid must be the official 4.0.0-rc.108 package",
      catalog["solid-js"] === "1.9.14" ? undefined : "Solid must satisfy Atom Solid >=1.9.14",
      catalog["@opentui/solid"] === "0.5.2"
        ? undefined
        : "OpenTUI must not be downgraded below the current 0.5.2 baseline",
      publishedPeers.atomSolid.effect === "^4.0.0-rc.108" &&
      publishedPeers.atomSolid.solid === ">=1.9.14 <2.0.0" &&
      publishedPeers.currentOpenTuiSolid.solid === catalog["solid-js"] &&
      catalog["solid-js"] === "1.9.14"
        ? undefined
        : "published Atom Solid and OpenTUI Solid peers must agree on Solid",
      publishedPeers.rejectedOpenTuiSolidDowngrade.typescript === "^5" &&
      root.workspaces?.catalogs?.tooling?.typescript === "7.0.2"
        ? "OpenTUI 0.1.6 is rejected: its TypeScript ^5 peer excludes workspace TypeScript 7.0.2"
        : undefined,
      publishedPeers.rejectedOpenTuiSolidDowngrade.solid === "^1.9.9"
        ? "OpenTUI 0.1.6 is rejected: it is a forbidden downgrade from 0.5.2"
        : undefined,
      app.dependencies?.["@effect/atom-solid"] === "catalog:"
        ? undefined
        : "the app must use the catalog Atom Solid package",
      root.overrides === undefined && app.overrides === undefined
        ? undefined
        : "peer overrides are forbidden",
      ["@effect/atom", "@effect/atom-solid-legacy", "@effect/atom-solid-fallback"].some((name) =>
        names.has(name),
      )
        ? "legacy or fallback Atom packages are forbidden"
        : undefined,
    ].filter((violation): violation is string => violation !== undefined);

    expect(violations).toEqual([]);
  });
});
