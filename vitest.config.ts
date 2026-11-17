import { defineConfig, defineProject } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    reporters: 'dot',
    projects: [
      ...[true, false].map(server => defineProject({
        resolve: { dedupe: ['nuxt'] },
        define: {
          'import.meta.server': server,
          'import.meta.client': !server,
        },
        test: {
          name: server ? 'i18n-server' : 'i18n-client',
          include: ['./test/i18n-plugin.test.ts'],
          pool: 'forks',
          execArgv: ['--expose-gc'],
        },
      })),
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
