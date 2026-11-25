import raw from 'virtual:content';
import type { GameContent } from './schema.ts';

/** The validated, normalised content (checked with Zod at build time by vite.config.ts). */
export const content = raw as GameContent;
