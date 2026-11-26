/// <reference types="vite/client" />

/** Built by the content plugin in vite.config.ts; typed in src/content/content.ts. */
declare module 'virtual:content' {
  const content: unknown;
  export default content;
}

/** package.json "version", injected by `define` in vite.config.ts. */
declare const __APP_VERSION__: string;

/** Build-time env (see src/config.ts feedbackEmail). */
interface ImportMetaEnv {
  readonly VITE_FEEDBACK_EMAIL?: string;
}
