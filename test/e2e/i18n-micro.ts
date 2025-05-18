import { $fetch } from '@nuxt/test-utils'
import { describe, expect, it } from 'vitest'

// this is broken for some reason

describe('i18n-micro', async () => {
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
