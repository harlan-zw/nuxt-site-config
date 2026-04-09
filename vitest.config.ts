import { defineConfig, defineProject } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    reporters: 'dot',
    projects: [
      defineProject({
        test: {
          name: 'unit',
          include: [
            './test/unit/**/*.test.ts',
            './src/**/*.test.ts',
          ],
          typecheck: {
            enabled: true,
            tsconfig: './test/tsconfig.json',
            include: ['./test/unit/**/*.test-d.ts'],
          },
        },
      }),
      defineProject({
        test: {
          name: 'e2e',
          include: [
            './test/e2e/**/*.test.ts',
          ],
          environment: 'node',
        },
      }),
    ],
  },
})
