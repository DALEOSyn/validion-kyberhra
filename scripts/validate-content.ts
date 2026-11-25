/** npm run validate: schema and cross-reference check of content/ (the build and `npm test` run it too). */
import { resolve } from 'node:path';
import { loadContent } from './lib/content.ts';

const res = loadContent(resolve(import.meta.dirname, '..', 'content'));
if (res.errors.length > 0) {
  for (const e of res.errors) console.error(e);
  console.error(`\ncontent validation: ${res.errors.length} problem(s).`);
  process.exit(1);
}
const cases = Object.keys(res.content?.cases ?? {}).length;
console.log(`content validation: ${res.content?.tracks.length} track(s), ${cases} case(s), ${res.sources.length} source(s) OK.`);
