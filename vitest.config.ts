/// <reference types="vitest" />
/// <reference types="vitest/globals" />

import { isCI } from 'std-env'
import { defineConfig } from 'vite'

export default defineVitestConfig({
  test: {
    poolOptions: {
      threads: {
        singleThread: !isCI,
      },
    },
  },
})
