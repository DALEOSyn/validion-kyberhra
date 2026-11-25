// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/', 'node_modules/', 'playwright-report/', 'test-results/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    // Game code in the browser: no network, no raw HTML, no forms (Red Lines 2 and 7), no Zod at runtime.
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        { selector: "JSXOpeningElement[name.name='form']", message: 'No forms: the game never submits anything (Red Line 2).' },
        { selector: "JSXOpeningElement[name.name='a']", message: 'No links: the game opens nothing outside itself. Show addresses as text.' },
        { selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']", message: 'Render content as text, never as HTML.' },
        { selector: "MemberExpression[property.name=/^(innerHTML|outerHTML|sendBeacon)$/]", message: 'No raw HTML, no beacons.' },
      ],
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: 'No runtime network calls; content is bundled at build time.' },
        { name: 'XMLHttpRequest', message: 'No runtime network calls.' },
        { name: 'WebSocket', message: 'No runtime network calls.' },
      ],
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            { regex: 'content/schema(\\.ts)?$|^\\./schema(\\.ts)?$', allowTypeImports: true, message: 'Runtime code imports only types from schema.ts (Zod stays out of the bundle).' },
            { regex: '^(zod|yaml)$', message: 'No Zod or YAML parser at runtime: content is validated at build time.' },
          ],
        },
      ],
    },
  },
  {
    // The schema is build-time only (vite content plugin, tests); it is the one file under src/ that may use Zod.
    files: ['src/content/schema.ts'],
    rules: { '@typescript-eslint/no-restricted-imports': 'off' },
  },
);
