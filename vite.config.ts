import { defineConfig, type Plugin } from 'vite';
import preact from '@preact/preset-vite';
import { createHash } from 'node:crypto';
import { readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { loadContent } from './scripts/lib/content.ts';
import { serviceWorkerSource } from './scripts/lib/sw.ts';

const CONTENT_DIR = resolve(import.meta.dirname, 'content');
const PUBLIC_DIR = resolve(import.meta.dirname, 'public');
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

/** Writes sw.js that precaches exactly the build output and public/ files: the game's own assets, nothing else. */
function serviceWorkerPlugin(): Plugin {
  return {
    name: 'stopa-sw',
    apply: 'build',
    generateBundle(_opts, bundle) {
      const files = [
        'index.html',
        ...Object.keys(bundle),
        ...listFiles(PUBLIC_DIR).map((p) => relative(PUBLIC_DIR, p).split('\\').join('/')),
      ]
        .filter((f, i, all) => f !== 'sw.js' && !f.endsWith('.map') && all.indexOf(f) === i)
        .sort();
      const version = createHash('sha256').update(files.join('\n')).update(JSON.stringify(Object.values(bundle).map((b) => ('code' in b ? b.code.length : 0)))).digest('hex').slice(0, 12);
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: serviceWorkerSource(version, files) });
    },
  };
}

/** A strict Content-Security-Policy in the built page: own origin only (Red Line 7, no network). */
function cspPlugin(): Plugin {
  const csp = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
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

export default defineConfig({
  base: './',
  plugins: [preact(), contentPlugin(), serviceWorkerPlugin(), cspPlugin()],
  build: { target: 'es2022', sourcemap: false, assetsInlineLimit: 0 },
});
