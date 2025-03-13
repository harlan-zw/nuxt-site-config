import { fileURLToPath } from 'node:url'
import { $fetch, setup } from '@nuxt/test-utils'
import { describe, expect, it } from 'vitest'

process.env.NUXT_PUBLIC_SITE_URL = 'https://env.harlanzw.com'
process.env.NUXT_PUBLIC_SITE_ENV = 'test'
await setup({
  rootDir: fileURLToPath(new URL('../../fixtures/i18n', import.meta.url)),
  server: true,
  build: true,
  nuxtConfig: {
    site: {
      url: 'https://harlanzw.com',
    },
  },
})

describe('i18n', async () => {
  it('en', async () => {
    const s = (await $fetch('/')) as string
    // replace ports in snapshot with pattern `:port/`
    // extract html <td data-currentlocale="true">en</td>
    const currentLocale = s.match(/<td data-currentlocale="true">(.+?)<\/td>/)?.[1]
    const defaultLocale = s.match(/<td data-defaultlocale="true">(.+?)<\/td>/)?.[1]
    const description = s.match(/<td data-description="true">(.+?)<\/td>/)?.[1]
    const env = s.match(/<td data-env="true">(.+?)<\/td>/)?.[1]
    const name = s.match(/<td data-name="true">(.+?)<\/td>/)?.[1]
    const url = s.match(/<td data-url="true">(.+?)<\/td>/)?.[1]
    expect(currentLocale).toBe('en-US')
    expect(defaultLocale).toBe('en-US')
    expect(description).toBe('My site description')
    expect(env).toBe('test')
    expect(name).toBe('My Site')
    expect(url).toBe('https://env.harlanzw.com')
  })
  it('fr', async () => {
    const s = (await $fetch('/fr')) as string
    // replace ports in snapshot with pattern `:port/`
    // extract html <td data-currentlocale="true">fr</td>
    const currentLocale = s.match(/<td data-currentlocale="true">(.+?)<\/td>/)?.[1]
    const defaultLocale = s.match(/<td data-defaultlocale="true">(.+?)<\/td>/)?.[1]
    const description = s.match(/<td data-description="true">(.+?)<\/td>/)?.[1]
    const env = s.match(/<td data-env="true">(.+?)<\/td>/)?.[1]
    const name = s.match(/<td data-name="true">(.+?)<\/td>/)?.[1]
    const url = s.match(/<td data-url="true">(.+?)<\/td>/)?.[1]
    expect(currentLocale).toBe('fr-FR')
    expect(defaultLocale).toBe('en-US')
    expect(description).toBe('La description de mon site')
    expect(env).toBe('test')
    expect(name).toBe('Mon site')
    expect(url).toBe('https://env.harlanzw.com')
  })
})
