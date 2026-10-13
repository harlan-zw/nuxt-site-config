import { fileURLToPath } from 'node:url'
import { setup } from '@nuxt/test-utils'
import { describe } from 'vitest'
import { describeRuntimeUpdates } from './runtime-updates'

await setup({
  rootDir: fileURLToPath(new URL('../fixtures/runtime-updates', import.meta.url)),
  server: true,
  build: true,
})

describe('runtime site config updates', () => {
  describeRuntimeUpdates()
})
