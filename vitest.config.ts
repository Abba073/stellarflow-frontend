import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // jsdom simulates a browser DOM environment for React component tests
    environment: 'jsdom',

    // Load jest-dom matchers (toBeInTheDocument, toHaveTextContent, etc.)
    setupFiles: ['./src/__tests__/setup.ts'],

    // Match all test files under src/__tests__/
    include: ['src/__tests__/**/*.{test,spec}.{ts,tsx}'],

    globals: true,

    // Print a coverage summary in the terminal alongside test results
    coverage: {
      provider: 'v8',
      include: [
        'src/utils/**',
        'src/lib/classNameVariants.ts',
        'src/app/components/ModularStatsCard.tsx',
        'src/app/components/RelayerStatusTable.tsx',
        'src/app/governance/page.tsx',
      ],
      reporter: ['text', 'lcov'],
    },
  },

  resolve: {
    alias: {
      // Mirror the tsconfig path aliases so imports like @/utils/... resolve
      '@': path.resolve(__dirname, './src'),
    },
  },
});
