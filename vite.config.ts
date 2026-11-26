import { defineConfig, loadEnv, type Plugin } from 'vite';
import preact from '@preact/preset-vite';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { loadContent } from './scripts/lib/content.ts';
import { serviceWorkerSource } from './scripts/lib/sw.ts';
import { connectSrc, feedbackEmail, feedbackEndpoint, withNoindex } from './src/config.ts';

const pkg = JSON.parse(readFileSync(resolve(import.meta.dirname, 'package.json'), 'utf8')) as { version: string };

const CONTENT_DIR = resolve(import.meta.dirname, 'content');
const VIRTUAL_ID = 'virtual:content';
const RESOLVED_ID = '\0' + VIRTUAL_ID;

/**
 * content/ is read and validated with Zod at build start (and on every dev reload). The browser receives only the
 * normalised JSON: no YAML parser and no Zod in the bundle. Any schema or cross-reference error fails the build.
 */
function contentPlugin(): Plugin {
  return {
    name: 'stopa-content',
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : null;
    },
    load(id) {
      if (id !== RESOLVED_ID) return null;
      const res = loadContent(CONTENT_DIR);
      for (const f of res.files) this.addWatchFile(f);
      if (!res.content) this.error(`content validation failed:\n${res.errors.join('\n')}`);
      return `export default ${JSON.stringify(res.content)};`;
    },
    handleHotUpdate(ctx) {
      if (!ctx.file.startsWith(CONTENT_DIR)) return;
      const mod = ctx.server.moduleGraph.getModuleById(RESOLVED_ID);
      if (mod) ctx.server.moduleGraph.invalidateModule(mod);
      ctx.server.ws.send({ type: 'full-reload' });
      return [];
    },
  };
}

function listFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? listFiles(p) : [p];
  });
}

/**
 * Writes sw.js that precaches exactly the build output and public/ files: the game's own assets, nothing else.
 * Runs after every other file is written, and the cache version hashes the *bytes* of every file (index.html with
 * its CSP, public/ files, chunks and assets), so any change in a new build gives a new cache name and replaces the
 * old assets (sceptic 13a).
 */
function serviceWorkerPlugin(): Plugin {
  let outDir = '';
  return {
    name: 'stopa-sw',
    apply: 'build',
    enforce: 'post',
    configResolved(cfg) {
      outDir = resolve(cfg.root, cfg.build.outDir);
    },
    writeBundle() {
      const files = listFiles(outDir)
        .map((p) => relative(outDir, p).split('\\').join('/'))
        .filter((f) => f !== 'sw.js' && !f.endsWith('.map'))
        .sort();
      const hash = createHash('sha256');
      for (const f of files) hash.update(f).update('\0').update(readFileSync(join(outDir, f))).update('\0');
      const version = hash.digest('hex').slice(0, 12);
      writeFileSync(join(outDir, 'sw.js'), serviceWorkerSource(version, files));
    },
  };
}

/**
 * A strict Content-Security-Policy in the built page: own origin only (Red Line 7). The one addition: when the build
 * sets VITE_FEEDBACK_ENDPOINT, `connect-src` also allows that endpoint's origin, for the comment box's „Odoslať“.
 */
function cspPlugin(endpoint: string | null): Plugin {
  const csp = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self' data:",
    "font-src 'self'",
    `connect-src ${connectSrc(endpoint)}`,
    "manifest-src 'self'",
    "worker-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
  ].join('; ');
  return {
    name: 'stopa-csp',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${csp}" />`);
    },
  };
}

/** While PILOT is on (src/config.ts), the built page asks search engines not to index it. */
function noindexPlugin(): Plugin {
  return {
    name: 'stopa-noindex',
    apply: 'build',
    transformIndexHtml(html) {
      return withNoindex(html);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, 'VITE_');
  // VITE_FEEDBACK_EMAIL (optional) is the address of the comment box's „Poslať e-mailom“ link; a malformed value fails
  // the build here. It adds no network access: the CSP stays the same with or without it.
  feedbackEmail(env.VITE_FEEDBACK_EMAIL);
  // VITE_FEEDBACK_ENDPOINT (optional) turns on „Odoslať“ and adds only its origin to connect-src. Unset: the build is
  // as before (the send code is a dead branch and is dropped from the bundle). A malformed value fails the build.
  const endpoint = feedbackEndpoint(env.VITE_FEEDBACK_ENDPOINT);
  return {
    base: './',
    /** The version from package.json (pilot label) and the comment endpoint or null (src/vite-env.d.ts). */
    define: { __APP_VERSION__: JSON.stringify(pkg.version), __FEEDBACK_ENDPOINT__: JSON.stringify(endpoint) },
    plugins: [preact(), contentPlugin(), serviceWorkerPlugin(), cspPlugin(endpoint), noindexPlugin()],
    build: { target: 'es2022', sourcemap: false, assetsInlineLimit: 0 },
  };
});
