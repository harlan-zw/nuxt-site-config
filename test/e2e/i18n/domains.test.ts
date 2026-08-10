import { fileURLToPath } from 'node:url'
import { $fetch, setup } from '@nuxt/test-utils'
import { describe, expect, it } from 'vitest'

await setup({
  rootDir: fileURLToPath(new URL('../../fixtures/i18n', import.meta.url)),
  server: true,
  build: true,
  nuxtConfig: {
    // @ts-expect-error module augments NuxtConfig
    site: {
      url: 'https://nuxtseo.com',
    },
    // @ts-expect-error untyped
    i18n: {
      defaultLocale: 'en',
      detectBrowserLanguage: false,
      differentDomains: true,
      strategy: 'no_prefix',
    },
  },
})

describe('i18n domains', () => {
  it('uses the locale domain as the canonical site URL', async () => {
    const html = await $fetch('/') as string
    const url = html.match(/<td data-url="true">(.+?)<\/td>/)?.[1]
    expect(url).toBe('http://en.nuxtseo.com')
  })
})
