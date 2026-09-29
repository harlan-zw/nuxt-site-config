import { fileURLToPath } from 'node:url'
import { fetch, setup } from '@nuxt/test-utils'
import { describe, expect, it } from 'vitest'

await setup({
  rootDir: fileURLToPath(new URL('../fixtures/basic', import.meta.url)),
  server: true,
  build: true,
  nuxtConfig: {
    // @ts-expect-error module augments NuxtConfig
    site: {
      name: 'Middleware Site',
      url: 'https://middleware.example.com',
    },
  },
})

describe('user server middleware', () => {
  it('reads resolved site config', async () => {
    const res = await fetch('/')
    expect(res.headers.get('x-site-name')).toBe('Middleware Site')
    expect(res.headers.get('x-site-url')).toBe('https://middleware.example.com')
  })
})
