import { defineConfig } from 'vitest/config';

export default defineConfig({
  // src/ui/CommentBox.tsx reads the build-time endpoint; unit tests run without one (the default build).
  define: { __FEEDBACK_ENDPOINT__: 'null' },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
});
