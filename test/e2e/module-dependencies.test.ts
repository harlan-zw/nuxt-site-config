import { fileURLToPath } from 'node:url'
import { $fetch, setup } from '@nuxt/test-utils'
import { describe, expect, it } from 'vitest'

await setup({
  rootDir: fileURLToPath(new URL('../fixtures/module-dependencies', import.meta.url)),
  server: true,
  build: true,
})

describe('module dependencies', () => {
  it('reads config during consumer setup and preserves user values at runtime', async () => {
    const config = await $fetch<{ name: string, description: string }>('/api/site')

    expect(config.name).toBe('User Site')
    expect(config.description).toBe('Read User Site during setup')
  })
})
