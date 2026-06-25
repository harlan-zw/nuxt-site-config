import { fileURLToPath } from 'node:url'
import { $fetch, setup } from '@nuxt/test-utils'
import { describe, expect, it } from 'vitest'

await setup({
  rootDir: fileURLToPath(new URL('../fixtures/spa', import.meta.url)),
  server: true,
  build: true,
})

describe('spa', () => {
  it('injects site config into the non-ssr app shell', async () => {
    const html = await $fetch<string>('/')

    expect(html).toContain('window.__NUXT_SITE_CONFIG__=')
    expect(html).toContain('SPA Site')
    expect(html).toContain('spa.example.com')
  })
})
