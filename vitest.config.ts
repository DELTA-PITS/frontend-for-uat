import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

import { playwright } from '@vitest/browser-playwright';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  resolve: {
    // Mirrors tsconfig.json `compilerOptions.paths` — Vitest doesn't read
    // that file on its own, so the unit test project needs the same
    // aliases spelled out here to resolve `@lib/...`, `@components/...`, etc.
    alias: {
      '@': dirname,
      '@components': path.join(dirname, 'components'),
      '@styles': path.join(dirname, 'styles'),
      '@lib': path.join(dirname, 'lib'),
      '@hooks': path.join(dirname, 'hooks'),
      '@api': path.join(dirname, 'app/api'),
      '@types': path.join(dirname, 'types'),
    },
  },
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          include: ['**/*.test.{ts,tsx}'],
          exclude: ['node_modules/**', '.next/**', 'stories/**'],
        },
      },
    ],
  },
});
