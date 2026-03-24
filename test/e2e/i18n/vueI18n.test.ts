import { fileURLToPath } from 'node:url'
import { $fetch, setup } from '@nuxt/test-utils'
import { describe, expect, it } from 'vitest'

process.env.NUXT_PUBLIC_SITE_ENV = 'test'
await setup({
  rootDir: fileURLToPath(new URL('../../fixtures/i18n-vue-i18n', import.meta.url)),
  server: true,
  build: true,
})

describe('i18n vueI18n config', async () => {
  it('en', async () => {
    const s = (await $fetch('/')) as string
    const currentLocale = s.match(/<td data-currentlocale="true">(.+?)<\/td>/)?.[1]
    const defaultLocale = s.match(/<td data-defaultlocale="true">(.+?)<\/td>/)?.[1]
    const description = s.match(/<td data-description="true">(.+?)<\/td>/)?.[1]
    const name = s.match(/<td data-name="true">(.+?)<\/td>/)?.[1]
    const url = s.match(/<td data-url="true">(.+?)<\/td>/)?.[1]
    expect(currentLocale).toBe('en-US')
    expect(defaultLocale).toBe('en-US')
    expect(description).toBe('My site description')
    expect(name).toBe('My Site')
    expect(url).toBe('https://nuxtseo.com')
  })
  it('fr', async () => {
    const s = (await $fetch('/fr')) as string
    const currentLocale = s.match(/<td data-currentlocale="true">(.+?)<\/td>/)?.[1]
    const defaultLocale = s.match(/<td data-defaultlocale="true">(.+?)<\/td>/)?.[1]
    const description = s.match(/<td data-description="true">(.+?)<\/td>/)?.[1]
    const name = s.match(/<td data-name="true">(.+?)<\/td>/)?.[1]
    const url = s.match(/<td data-url="true">(.+?)<\/td>/)?.[1]
    expect(currentLocale).toBe('fr-FR')
    expect(defaultLocale).toBe('en-US')
    expect(description).toBe('La description de mon site')
    expect(name).toBe('Mon site')
    expect(url).toBe('https://nuxtseo.com')
  })
})
