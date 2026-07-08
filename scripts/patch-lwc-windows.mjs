/**
 * Windows compatibility patch for @lwc/rollup-plugin.
 *
 * The official SLDS 2 Starter Kit fails on Windows out of the box: the app is
 * stuck at "Loading…" and `npm run build` breaks. Root cause is that
 * @lwc/rollup-plugin assumes OS path separators (`path.sep` = "\" on Windows)
 * while Vite module ids always use forward slashes. Two spots break:
 *
 *   1. Component namespace/name detection splits the filename on `path.sep`.
 *      On Windows the forward-slash Vite id never splits, so every component
 *      compiles with name="" and the router outlet (`lwc:component lwc:is`)
 *      silently renders nothing → permanent "Loading…".
 *
 *   2. The virtual ids for the implicit empty template/style fallbacks are
 *      built with `[...].join(path.sep)`, producing "@lwc\resources\empty_html.js".
 *      Vite normalizes the id to forward slashes before calling `load`, so the
 *      plugin's exact-equality check misses and the module 404s
 *      (e.g. `datatable.html?import`).
 *
 * This script rewrites those two spots to be separator-agnostic. It is
 * idempotent (safe to re-run) and wired into `postinstall`, so it re-applies
 * automatically whenever dependencies are installed. This patches generated
 * code inside node_modules only — no application code depends on it.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TARGET = resolve(__dirname, '../node_modules/@lwc/rollup-plugin/dist/index.js');

const REPLACEMENTS = [
  {
    find: "['@lwc', 'resources', 'empty_html.js'].join(path.sep)",
    replace: "['@lwc', 'resources', 'empty_html.js'].join('/')",
  },
  {
    find: "['@lwc', 'resources', 'empty_css.css'].join(path.sep)",
    replace: "['@lwc', 'resources', 'empty_css.css'].join('/')",
  },
  {
    find: 'path.dirname(filename).split(path.sep).slice(-2)',
    replace: 'path.dirname(filename).split(/[\\\\/]/).slice(-2)',
  },
];

function main() {
  if (!existsSync(TARGET)) {
    console.warn(`[patch-lwc-windows] target not found, skipping: ${TARGET}`);
    return;
  }
  let source = readFileSync(TARGET, 'utf8');
  let applied = 0;
  let alreadyPatched = 0;

  for (const { find, replace } of REPLACEMENTS) {
    if (source.includes(find)) {
      source = source.split(find).join(replace);
      applied += 1;
    } else if (source.includes(replace)) {
      alreadyPatched += 1;
    } else {
      console.warn(
        `[patch-lwc-windows] neither original nor patched snippet found; @lwc/rollup-plugin may have changed. Snippet: ${find}`
      );
    }
  }

  if (applied > 0) {
    writeFileSync(TARGET, source, 'utf8');
    console.log(`[patch-lwc-windows] applied ${applied} Windows fix(es) to @lwc/rollup-plugin.`);
  } else {
    console.log(`[patch-lwc-windows] already patched (${alreadyPatched}/${REPLACEMENTS.length}); nothing to do.`);
  }
}

main();
