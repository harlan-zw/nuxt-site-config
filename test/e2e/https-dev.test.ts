import { fileURLToPath } from 'node:url'
import { $fetch, setup } from '@nuxt/test-utils'
import { describe, expect, it } from 'vitest'

await setup({
  rootDir: fileURLToPath(new URL('../fixtures/https-dev', import.meta.url)),
  server: true,
  build: true,
})

describe('https dev server with custom host', () => {
  it('default nitroOrigin uses 127.0.0.1 from test server', async () => {
    const debug = await $fetch<{ nitroOrigin: string }>('/__site-config__/debug.json')

    // without x-forwarded headers, uses the actual request host (127.0.0.1 from test server)
    expect(debug.nitroOrigin).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/$/)
  })

  it('prefers request host over 127.0.0.1 from env var', async () => {
    const debug = await $fetch<{ nitroOrigin: string }>('/__site-config__/debug.json', {
      headers: {
        'x-forwarded-host': 'local.u7buy.com:3000',
        'x-forwarded-proto': 'https',
      },
    })

    expect(debug.nitroOrigin).toBe('https://local.u7buy.com:3000/')
  })

  it('uses localhost when request host is also localhost', async () => {
    const debug = await $fetch<{ nitroOrigin: string }>('/__site-config__/debug.json', {
      headers: {
        'x-forwarded-host': 'localhost:3000',
        'x-forwarded-proto': 'http',
      },
    })

    expect(debug.nitroOrigin).toBe('http://localhost:3000/')
  })

  it('uses 127.0.0.1 when request host is 127.0.0.1', async () => {
    const debug = await $fetch<{ nitroOrigin: string }>('/__site-config__/debug.json', {
      headers: {
        'x-forwarded-host': '127.0.0.1:3000',
        'x-forwarded-proto': 'http',
      },
    })

    expect(debug.nitroOrigin).toBe('http://127.0.0.1:3000/')
  })
})
