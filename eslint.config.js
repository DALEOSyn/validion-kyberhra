// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

const NO_LINK = { selector: "JSXOpeningElement[name.name='a']", message: 'No links: the game opens nothing outside itself. Show addresses as text.' };
const NO_MAILTO_LITERAL = { selector: 'Literal[value=/mailto:/i]', message: 'The only mailto: is the comment box (src/ui/CommentBox.tsx).' };
const NO_MAILTO_TEMPLATE = { selector: 'TemplateElement[value.raw=/mailto:/i]', message: 'The only mailto: is the comment box (src/ui/CommentBox.tsx).' };
const SRC_SYNTAX = [
  { selector: "JSXOpeningElement[name.name='form']", message: 'No forms: the game never submits anything (Red Line 2).' },
  { selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']", message: 'Render content as text, never as HTML.' },
  { selector: "MemberExpression[property.name=/^(innerHTML|outerHTML|sendBeacon|fetch)$/]", message: 'No raw HTML, no beacons, no network calls.' },
  { selector: "AssignmentExpression > MemberExpression.left[property.name='href']", message: 'No navigation away from the game.' },
  { selector: "CallExpression > MemberExpression.callee[property.name=/^(assign|replace|open)$/][object.name=/^(location|window)$/]", message: 'No navigation away from the game.' },
  NO_MAILTO_LITERAL,
  NO_MAILTO_TEMPLATE,
];

export default tseslint.config(
  { ignores: ['dist/', 'dist-email/', 'node_modules/', 'playwright-report/', 'test-results/'] },
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
      'no-restricted-syntax': ['error', NO_LINK, ...SRC_SYNTAX],
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
    // The one exception (Roman, 2026-11-26): the comment box's „Poslať e-mailom“ is a plain mailto: link that opens
    // the adult's own mail app. Only this file may render <a> and write "mailto:"; every other rule still applies.
    files: ['src/ui/CommentBox.tsx'],
    rules: { 'no-restricted-syntax': ['error', ...SRC_SYNTAX.filter((r) => r !== NO_MAILTO_LITERAL && r !== NO_MAILTO_TEMPLATE)] },
  },
  {
    // The schema is build-time only (vite content plugin, tests); it is the one file under src/ that may use Zod.
    files: ['src/content/schema.ts'],
    rules: { '@typescript-eslint/no-restricted-imports': 'off' },
  },
);
