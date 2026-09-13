// @ts-check
// `serwist build` (see package.json's "build" script) loads this file with a plain
// Node `import()` — it can't be TypeScript, since the CLI does no transpilation of
// the config file itself (only of the swSrc service worker it builds). The .mjs
// extension is required so Node treats it as ESM: package.json has no
// "type": "module", so a plain .js here would be parsed as CommonJS instead.
import { serwist } from "@serwist/next/config";

export default serwist({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
});
