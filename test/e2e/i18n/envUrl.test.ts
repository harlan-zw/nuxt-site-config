import { fileURLToPath } from 'node:url'
import { $fetch, setup } from '@nuxt/test-utils'
import { describe, expect, it } from 'vitest'

process.env.NUXT_PUBLIC_SITE_ENV = 'test'
process.env.NUXT_SITE_URL = 'https://runtime-env.example.com'
await setup({
  rootDir: fileURLToPath(new URL('../../fixtures/i18n', import.meta.url)),
  server: true,
  build: true,
  nuxtConfig: {
    // @ts-expect-error untyped
    i18n: {
      baseUrl: 'https://i18n.baseurl.com',
    },
  },
})

describe('i18n baseUrl', () => {
  it('loses to a runtime NUXT_SITE_URL', async () => {
    const s = await $fetch<string>('/')
    expect(s.match(/<td data-url="true">(.+?)<\/td>/)?.[1]).toBe('https://runtime-env.example.com')
  })
})
