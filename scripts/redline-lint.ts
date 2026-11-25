/**
 * npm run redline: lints every YAML file in content/ for the red lines a machine can check
 * (rules in scripts/lib/redline.ts, documented in docs/CONTENT_SCHEMA.md). Exits 1 on any hit.
 * Usage: tsx scripts/redline-lint.ts [content-dir]
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join, relative, resolve } from 'node:path';
import { parse } from 'yaml';
import { denyMatchers, lintValue, parseDenylist } from './lib/redline.ts';

const root = resolve(import.meta.dirname, '..');
const contentDir = resolve(process.argv[2] ?? join(root, 'content'));
const REAL_NAMES_ALLOWED = new Set(['sources.yaml', 'help.yaml']);

function yamlFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) return yamlFiles(p);
    return /\.ya?ml$/.test(n) ? [p] : [];
  });
}

const matchers = denyMatchers(parseDenylist(readFileSync(join(root, 'scripts/redline-denylist.txt'), 'utf8')));
let count = 0;
const files = yamlFiles(contentDir);
for (const file of files) {
  const rel = relative(root, file);
  let value: unknown;
  try {
    value = parse(readFileSync(file, 'utf8'));
  } catch (e) {
    console.error(`${rel}: YAML error: ${(e as Error).message}`);
    count++;
    continue;
  }
  const allowed = REAL_NAMES_ALLOWED.has(basename(file)) && relative(contentDir, file) === basename(file);
  for (const hit of lintValue(value, matchers, allowed)) {
    console.error(`${rel}: ${hit.path}: [${hit.rule}] ${hit.message}`);
    count++;
  }
}
if (count > 0) {
  console.error(`\nred-line lint: ${count} problem(s) in ${files.length} file(s). See docs/CONTENT_SCHEMA.md, "Red-line linter".`);
  process.exit(1);
}
console.log(`red-line lint: ${files.length} file(s) clean.`);
